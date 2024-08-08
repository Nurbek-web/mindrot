import dotenv from 'dotenv';
dotenv.config();
import Groq from 'groq-sdk/index.mjs';

const groq = new Groq({
	apiKey: process.env.GROQ_API_KEY,
});

export default async function transcriptFunction(topic, duration) {
	const completion = await groq.chat.completions.create({
		messages: [
			{
				role: 'user',
				content: `
			Generate a dynamic, concise transcript video that fits exactly into ${duration} minute.
			The script should be fast-paced, engaging, and captivating to maintain viewer attention throughout.
			Avoid any meaningless filler content, greetings and use minimal extra words.
			Should be energetic and fun, with quick transitions and catchy phrases.
			The output should be a continuous block of text without any section headers, extra formatting, or hashtags.
			Ensure the script is precise and fits perfectly into a ${duration}-minute duration or less.
			The topic - ${topic}.
			The JSON format WHICH MUST BE ADHERED TO ALWAYS is as follows:
			{ transcript: "transcipt here"}
			`,
			},
		],
		response_format: { type: 'json_object' },
		model: 'llama3-70b-8192',
		temperature: 0.5,
		max_tokens: 4096,
		top_p: 1,
		stop: null,
		stream: false,
	});

	const script = JSON.parse(
		completion.choices[0]?.message?.content || ''
	).transcript;

	return script;
}
