// Runs only for /assets/vid/* (see run_worker_first in wrangler.jsonc). Static assets answer a
// Range request with the whole file, but browsers need 206 partial responses to seek in a video,
// and iOS Safari will not play an MP4 without them. So fetch the full file and slice the range here.
export default {
  async fetch(request, env) {
    const range = request.headers.get('Range');
    const headers = new Headers(request.headers);
    headers.delete('Range');
    const res = await env.ASSETS.fetch(new Request(request, { headers }));
    if (res.status !== 200 || request.method !== 'GET') return res;

    const out = new Headers(res.headers);
    out.set('Accept-Ranges', 'bytes');
    const m = range && /^bytes=(\d*)-(\d*)$/.exec(range.trim());
    if (!m || (m[1] === '' && m[2] === '')) return new Response(res.body, { status: 200, headers: out });

    const body = await res.arrayBuffer();
    const size = body.byteLength;
    let start;
    let end;
    if (m[1] === '') {
      start = Math.max(0, size - Number(m[2]));
      end = size - 1;
    } else {
      start = Number(m[1]);
      end = m[2] === '' ? size - 1 : Math.min(Number(m[2]), size - 1);
    }
    if (start >= size || start > end) {
      out.set('Content-Range', `bytes */${size}`);
      out.delete('Content-Length');
      return new Response(null, { status: 416, headers: out });
    }
    out.set('Content-Range', `bytes ${start}-${end}/${size}`);
    out.set('Content-Length', String(end - start + 1));
    return new Response(body.slice(start, end + 1), { status: 206, headers: out });
  },
};
