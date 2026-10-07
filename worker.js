// Runs only for /assets/vid/* (see run_worker_first in wrangler.jsonc). Static assets answer a
// Range request with the whole file, but browsers need 206 partial responses to seek in a video,
// and iOS Safari will not play an MP4 without them. So fetch the full file and slice the range here.

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

    const body = await res.arrayBuffer();
    const size = body.byteLength;
    const range = byteRange(header, size);
    if (range === undefined) return new Response(body, { status: 200, headers: out });
    if (range === null) {
      out.set('Content-Range', `bytes */${size}`);
      return new Response(null, { status: 416, headers: out });
    }
    const [start, end] = range;
    out.set('Content-Range', `bytes ${start}-${end}/${size}`);
    out.set('Content-Length', String(end - start + 1));
    return new Response(body.slice(start, end + 1), { status: 206, headers: out });
  },
};
