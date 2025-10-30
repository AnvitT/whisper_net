import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: String(process.env.GEMINI_API_KEY)
});

async function generateAIContent(userPrompt: string) {
    const aiPrompt = `
        You are an advanced AI agent. Your task is to generate random messages for an anonymous messaging platform.
        Messages should not be more than 20 words. The messages should be engaging and friendly.
        Generate 3 random messages and format them as a single string separated by '||'.
        Messages should cater to a wide audience and should not be offensive.
        The messages should not expect an answer as this is just a one way communication.
        I will give userPrompt if it is empty do nothing. If the user prompt is not empty, and if it has some meaning,
        then try to generate messages based on the user prompt.
        userPrompt: ${userPrompt}
        For example, your output should be structured like this:
        'message1||message2||message3'.
        Thanks for your help!
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: aiPrompt,
    });

    // If the API returns a stream, handle it here. Otherwise, just return the text.
    // Assuming response.text contains the result.
    return new Response(response.text, {
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