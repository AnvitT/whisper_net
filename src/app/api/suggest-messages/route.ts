import { GoogleGenerativeAI } from "@google/generative-ai";

async function generateAIContent(userPrompt: string) {
    const genAI = new GoogleGenerativeAI(String(process.env.GEMINI_API_KEY))
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const aiPrompt = `
        You are an advanced AI agent. Your task is to generate random messages for a anonymous messaging platform.
        Messages should not more than 20 words. The messages should be engaging and friendly.
        Generate 3 random messages and format them as a single string separated by '||'.
        Messages should cater to a wide audience and should not be offensive.
        The messages should not expect an answer as this is just a one way communication.
        I will give userPrompt if it is empty do nothing. If the user prompt is not empty, the if it has some meaning,
        then try to generate messages based on the user prompt.
        userPrompt: ${userPrompt}
        For example, your output should be structured like this:
        'message1||message2||message3'.
        Thanks for your help!
    `;

    const result = await model.generateContentStream(aiPrompt)

    const stream = new ReadableStream({
        async start(controller) {
            for await (const chunk of result.stream) {
                const chunkText = chunk.text()
                controller.enqueue(new TextEncoder().encode(chunkText))
            }
            controller.close()
        }
    })
    return new Response(stream, {
        headers: { 'Content-Type': 'text/plain' }
    });
}

export async function POST(request: Request) {
    try {
        const { userPrompt } = await request.json();
        return await generateAIContent(userPrompt);
    } catch (error) {
        console.error("An unexpected error occurred. ", error);
        return new Response(JSON.stringify({ error: "An unexpected error occurred." }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
