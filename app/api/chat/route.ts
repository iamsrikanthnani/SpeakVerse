import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const { message } = await req.json();
  const signal = req.signal;

  try {
    const response = await client.chat.completions.create(
      {
        messages: [
          {
            role: "system",
            content:
              "Provide short, concise responses in plain text. Avoid formatting or lengthy explanations.",
          },
          { role: "user", content: message },
        ],
        model: "gpt-4o",
        stream: true,
      },
      { signal }
    );

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            const text = chunk.choices[0]?.delta?.content || "";
            if (text) {
              controller.enqueue(
                `data: ${JSON.stringify({ response: text })}\n\n`
              );
            }
          }
          controller.enqueue(`data: [DONE]\n\n`);
        } catch (error) {
          console.error("Error in OpenAI stream:", error);
          controller.error(error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "AbortError") {
      return new Response(JSON.stringify({ error: "Request aborted" }), {
        status: 499,
        headers: { "Content-Type": "application/json" },
      });
    }
    console.error("Error in OpenAI API call:", error);
    return new Response(
      JSON.stringify({
        error: "An error occurred while processing your request",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
