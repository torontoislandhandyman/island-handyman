const UPSTREAM_ORIGIN = new URL("https://islandhandy-mssnqkgd.manus.space");
const ALLOWED_HOSTS = new Set([
  "islandhandyman.vip",
  "www.islandhandyman.vip",
  "islandhandyman-vip-proxy.torontoislandhandyman.workers.dev",
]);

export default {
  async fetch(request) {
    const incoming = new URL(request.url);
    if (!ALLOWED_HOSTS.has(incoming.hostname.toLowerCase())) {
      return new Response("Not found", { status: 404 });
    }

    const upstream = new URL(`${incoming.pathname}${incoming.search}`, UPSTREAM_ORIGIN);
    const headers = new Headers(request.headers);
    headers.delete("host");
    headers.set("x-forwarded-host", incoming.host);
    headers.set("x-forwarded-proto", incoming.protocol.slice(0, -1));

    // Replace client-supplied forwarding data with Cloudflare's transport address.
    const clientIp = request.headers.get("cf-connecting-ip");
    if (clientIp) headers.set("x-forwarded-for", clientIp);
    else headers.delete("x-forwarded-for");

    const init = {
      method: request.method,
      headers,
      redirect: "manual",
    };
    if (request.method !== "GET" && request.method !== "HEAD") {
      init.body = request.body;
    }

    const upstreamResponse = await fetch(upstream.toString(), init);
    if (upstreamResponse.status === 101) return upstreamResponse;

    const responseHeaders = new Headers(upstreamResponse.headers);
    const location = responseHeaders.get("location");
    if (location) {
      try {
        const destination = new URL(location, UPSTREAM_ORIGIN);
        if (destination.origin === UPSTREAM_ORIGIN.origin) {
          destination.protocol = incoming.protocol;
          destination.host = incoming.host;
          responseHeaders.set("location", destination.toString());
        }
      } catch {
        // Preserve an unusual Location header unchanged.
      }
    }

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: responseHeaders,
    });
  },
};
