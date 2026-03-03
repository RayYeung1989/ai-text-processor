export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    try {
      const { text, operation } = await request.json();

      if (!text || !operation) {
        return new Response(JSON.stringify({ error: "Missing text or operation" }), {
          status: 400,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      }

      const prompts = {
        summarize: `Summarize the following text in a concise way, keeping the key points: ${text}`,
        improve: `Improve the following text's grammar, clarity, and style: ${text}`,
        shorten: `Shorten the following text while preserving the main meaning: ${text}`,
        expand: `Expand the following text with more detail and elaboration: ${text}`,
      };

      const prompt = prompts[operation] || prompts.summarize;

      // Use Cloudflare Workers AI
      const aiResponse = await env.AI.run("@cf/meta/llama-3-8b-instruct", {
        messages: [
          { role: "system", content: "You are a helpful text processing assistant. Provide concise, direct responses." },
          { role: "user", content: prompt },
        ],
        max_tokens: 512,
      });

      const result = aiResponse.response;

      return new Response(JSON.stringify({ result }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }
  },
};
