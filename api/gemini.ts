import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey!);

const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
});

const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
};

async function retryWithExponentialBackoff(fn, maxRetries = 5, initialDelay = 1000) {
    let retries = 0;
    while (retries < maxRetries) {
        try {
            return await fn();
        } catch (error) {
            if (error.message.includes("429") || error.message.includes("500")) {
                retries++;
                if (retries >= maxRetries) throw error;
                const delay = initialDelay * Math.pow(2, retries);
                console.log(`Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                throw error;
            }
        }
    }
}

export async function generateQuiz(subject: string, content: string) {
    const prompt = `Generate a single multiple-choice quiz question about ${subject} based on the following content: "${content}". The question should be unique and not repetitive. Provide the question, four answer options (A, B, C, D), and indicate the correct answer. Format the response as JSON with the following structure:
  {
    "question": "...",
    "options": {
      "A": "...",
      "B": "...",
      "C": "...",
      "D": "..."
    },
    "correctAnswer": "..."
  }`;

    return retryWithExponentialBackoff(async () => {
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        const cleanedText = text.replace(/```json\n|\n```/g, '').trim();

        try {
            return JSON.parse(cleanedText);
        } catch (error) {
            console.error("Failed to parse JSON:", cleanedText);
            throw new Error("Failed to generate a valid quiz question. Please try again.");
        }
    });
}

export async function generateAIFeedback(quizData, selectedAnswers, score) {
    const prompt = `You are an AI tutor. Based on the following quiz results, provide constructive feedback to the student. Here's the quiz data and the student's answers:

  ${quizData.map((q, i) => `
  Question ${i + 1}: ${q.question}
  Correct Answer: ${q.options[q.correctAnswer]}
  Student's Answer: ${q.options[selectedAnswers[i]]}
  `).join('\n')}

  Overall Score: ${score.percentage.toFixed(2)}%

  Please provide feedback on the student's performance, highlighting areas of strength and suggesting improvements where needed. Keep the feedback encouraging and constructive do not use "" or bold text and ... just provide normal text`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
}