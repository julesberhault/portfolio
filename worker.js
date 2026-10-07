// Runs only for /assets/vid/* (see run_worker_first in wrangler.jsonc). Static assets answer a
// Range request with the whole file, but browsers need 206 partial responses to seek in a video,
// and iOS Safari will not play an MP4 without them. So fetch the file and stream out the range.

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

    // Stream the slice when the size is known up front; otherwise buffer once to measure it.
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
  },
};
