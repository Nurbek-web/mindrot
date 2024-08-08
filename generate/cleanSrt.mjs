import { OpenAI } from "openai";
import dotenv from "dotenv";
import { writeFile } from "fs/promises";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateCleanSrt(transcript, srt) {
  try {
    const response = await cleanSrt(transcript, srt.content);
    if (response && response.content) {
      await writeFile(srt.fileName, response.content, "utf8");
    }
  } catch (error) {
    console.error("Error in generateCleanSrt:", error);
  }
}

async function cleanSrt(transcript, srt) {
  try {
    const chat_completion = await client.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `You are an AI assistant specialized in correcting SRT (SubRip Subtitle) files. Your task is to clean up and improve the provided SRT file based on the given transcript, while adhering to strict guidelines. Please follow these instructions carefully:

1. Maintain the original timing and numbering of the SRT file exactly as provided.
2. Keep each word or small phrase on a separate line, as in the original SRT file.
3. Correct spelling mistakes and add any missing words that appear in the transcript.
4. Do not alter the format or structure of the SRT file.
5. Do not add any explanations, comments, or extra words not present in the transcript.

Here is the transcript:
${transcript}

Here is the SRT file that needs to be corrected:
${srt}

Please provide the corrected SRT file, maintaining its original format with separate words or short phrases per line. Only output the corrected SRT file, without any additional comments or explanations.`,
        },
      ],
      model: "gpt-4o-mini",
    });

    const { choices } = chat_completion;
    if (choices && choices.length > 0 && choices[0].message) {
      const content = extractSrtContent(choices[0].message.content);
      return { content };
    } else {
      throw new Error("Invalid response from OpenAI API");
    }
  } catch (error) {
    console.error("Error in cleanSrt:", error);
    return { content: srt }; // Return the original srt content if there's an error
  }
}

function extractSrtContent(responseContent) {
  const srtStart = responseContent.indexOf("1\n");
  const srtEnd = responseContent.lastIndexOf("\n\n");
  if (srtStart !== -1 && srtEnd !== -1) {
    return responseContent.substring(srtStart, srtEnd).trim();
  }
  return responseContent;
}
