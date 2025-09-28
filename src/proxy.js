export default {
  async fetch(request) {
    const url = new URL(request.url);
    const upstream = `https://solved.ac/api/v3/search/problem${url.search}`;

    // Handle preflight request
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "https://boj-practice.netlify.com",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers":
            request.headers.get("Access-Control-Request-Headers") || "*",
        },
      });
    }

    // Proxy request
    const response = await fetch(upstream, request);

    // Add CORS headers
    const newHeaders = new Headers(response.headers);
    newHeaders.set(
      "Access-Control-Allow-Origin",
      "https://boj-practice.netlify.com"
    );
    newHeaders.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    newHeaders.set("Access-Control-Allow-Headers", "*");

    return new Response(response.body, {
      status: response.status,
      headers: newHeaders,
    });
  },
};
