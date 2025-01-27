import { GoogleGenerativeAI } from "@google/generative-ai";

async function generateAIContent() {
    const genAI = new GoogleGenerativeAI(String(process.env.GEMINI_API_KEY))
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const aiPrompt = `
    Create a list of three open-ended and engaging questions formatted as a single string.
    Each question should be separated by '||'.
    These questions are for an anonymous social messaging platform, like Qooh.me,
    and should be suitable for a diverse audience.
    Avoid personal or sensitive topics focusing instead on universal themes that encourage friendly interation.
    For example, your output should be structured like this:
    'What's a hobby you've recently started?||If you could have dinner with any historical figure, who would it be?||What's a simple thing that makes you happy?'.
    Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.
    Maximum words in each questions MUST BE 10 words.
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

export async function POST() {
    try {
        return await generateAIContent();
    } catch (error) {
        console.error("An unexpected error occurred. ", error);
        return new Response(JSON.stringify({ error: "An unexpected error occurred." }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
