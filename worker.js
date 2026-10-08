// Runs only for /assets/vid/* (see run_worker_first in wrangler.jsonc). Static assets answer a
// Range request with the whole file, but browsers need 206 partial responses to seek in a video,
// and iOS Safari will not play an MP4 without them.
//
// The Cache API does serve ranges from a stored full response, straight from the requested offset.
// So each clip is cached once per Cloudflare location, keyed by its content hash (a redeploy with a
// changed clip gets a new key), and ranges are answered from there. If caching fails, the range is
// streamed out of the asset instead, which has to read through the file up to the requested offset.

const YEAR = 60 * 60 * 24 * 365;

// Parse a single `bytes=` range against a file size: [start, end], null if unsatisfiable,
// undefined if absent or not a single byte range (serve the whole file).
function byteRange(header, size) {
  const m = header && /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!m || (m[1] === '' && m[2] === '')) return undefined;
  const [start, end] = m[1] === ''
    ? [Math.max(0, size - Number(m[2])), size - 1]
    : [Number(m[1]), m[2] === '' ? size - 1 : Math.min(Number(m[2]), size - 1)];
  return start < size && start <= end ? [start, end] : null;
}

// Pass through only bytes start..end of a stream, then stop reading the source.
function sliceStream(source, start, end) {
  let offset = 0;
  const slicer = new TransformStream({
    transform(chunk, controller) {
      const from = Math.max(0, start - offset);
      const to = Math.min(chunk.byteLength, end + 1 - offset);
      offset += chunk.byteLength;
      if (from < to) controller.enqueue(chunk.subarray(from, to));
      if (offset > end) controller.terminate();
    },
  });
  // FixedLengthStream (Workers runtime) keeps the exact Content-Length on the streamed response.
  const length = end - start + 1;
  const sized = typeof FixedLengthStream === 'function' ? new FixedLengthStream(length) : new TransformStream();
  source.pipeThrough(slicer).pipeTo(sized.writable).catch(() => {});
  return sized.readable;
}

// Fallback: answer the range by streaming it out of the asset response.
async function streamRange(res, header, out) {
  let size = Number(res.headers.get('Content-Length'));
  let body = res.body;
  if (!size) {
    const buf = await res.arrayBuffer();
    size = buf.byteLength;
    body = new Blob([buf]).stream();
  }
  const range = byteRange(header, size);
  if (range === undefined) return new Response(body, { status: 200, headers: out });
  if (range === null) {
    body.cancel();
    out.set('Content-Range', `bytes */${size}`);
    out.delete('Content-Length');
    return new Response(null, { status: 416, headers: out });
  }
  const [start, end] = range;
  out.set('Content-Range', `bytes ${start}-${end}/${size}`);
  out.set('Content-Length', String(end - start + 1));
  return new Response(sliceStream(body, start, end), { status: 206, headers: out });
}

export default {
  async fetch(request, env) {
    const headers = new Headers(request.headers);
    headers.delete('Range');
    const res = await env.ASSETS.fetch(new Request(request, { headers }));
    if (res.status !== 200 || request.method !== 'GET') return res;

    const out = new Headers(res.headers);
    out.set('Accept-Ranges', 'bytes');
    const header = request.headers.get('Range');
    if (!header) return new Response(res.body, { status: 200, headers: out });

    const etag = res.headers.get('ETag');
    const cache = typeof caches !== 'undefined' && caches.default;
    if (cache && etag && res.headers.get('Content-Length')) {
      try {
        const url = new URL(request.url);
        const key = `${url.origin}${url.pathname}?v=${encodeURIComponent(etag)}`;
        const ranged = () => cache.match(new Request(key, { headers: { Range: header } }));
        let hit = await ranged();
        if (!hit) {
          const stored = new Headers(res.headers);
          stored.set('Cache-Control', `public, max-age=${YEAR}, immutable`);
          await cache.put(key, new Response(res.body, { status: 200, headers: stored }));
          hit = await ranged();
        } else {
          res.body.cancel();
        }
        if (hit) {
          const served = new Headers(hit.headers);
          served.set('Accept-Ranges', 'bytes');
          served.set('Cache-Control', out.get('Cache-Control') || 'public, max-age=0, must-revalidate');
          return new Response(hit.body, { status: hit.status, headers: served });
        }
        // Stored but not matchable (the body was consumed by put): fetch the asset again to stream.
        return streamRange(await env.ASSETS.fetch(new Request(request, { headers })), header, out);
      } catch {
        // Fall through to streaming from a fresh asset response.
        return streamRange(await env.ASSETS.fetch(new Request(request, { headers })), header, out);
      }
    }
    return streamRange(res, header, out);
  },
};
