import dotenv from "dotenv";
import OpenAI from "openai";
import getAudioDuration from "./audioduration.mjs";
import axios from "axios";
import fs from "fs/promises";
import path from "path";
import PQueue from "p-queue"; // Add this dependency to your project

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Limit concurrency to 7 requests per minute
const queue = new PQueue({
  interval: 60000,
  intervalCap: 7,
});

export async function generateImagePrompts(transcript, audioFilePath) {
  const audioDuration = await getAudioDuration(audioFilePath);
  const imageInterval = 6;
  const numberOfImages = Math.floor(audioDuration / imageInterval);

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are an AI assistant that generates image prompts based on video transcripts. Create ${numberOfImages} distinct, vivid image prompts that capture the main concepts or scenes from the given transcript. Format your response as a JSON array of objects, each with a 'prompt' field.`,
      },
      { role: "user", content: transcript },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  const promptsText = response.choices[0].message.content;
  if (!promptsText) {
    throw new Error("Failed to generate image prompts");
  }

  // Ensure the response is a valid JSON
  let prompts;
  try {
    prompts = JSON.parse(promptsText).prompts;
  } catch (error) {
    console.error("Failed to parse JSON:", promptsText);
    throw new Error("Invalid JSON format from OpenAI response");
  }

  const intervalDuration = audioDuration / prompts.length;

  return prompts.map((p, index) => ({
    prompt: p.prompt,
    timestamp: index * intervalDuration,
  }));
}

async function downloadImage(url, fileName) {
  const response = await axios.get(url, { responseType: "arraybuffer" });
  const buffer = Buffer.from(response.data, "binary");
  const filePath = path.join(process.cwd(), "public", "images", fileName);
  await fs.writeFile(filePath, buffer);
  return `/images/${fileName}`;
}

export async function downloadImages(prompts) {
  const imageData = [];

  // Using a queue to handle concurrency and rate limits
  await Promise.all(
    prompts.map(({ prompt, timestamp }, index) =>
      queue.add(async () => {
        const url = await generateImageWithRetry(prompt);
        const fileName = `image_${index}.png`;
        const localPath = await downloadImage(url, fileName);
        imageData.push({ prompt, timestamp, localPath });
      })
    )
  );

  await fs.writeFile(
    path.join(process.cwd(), "public", "images", "imageData.json"),
    JSON.stringify(imageData)
  );

  return imageData;
}

async function generateImageWithRetry(prompt, retries = 5) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
      });

      const imageUrl = response.data[0]?.url;
      return imageUrl;
    } catch (error) {
      if (error.code === "rate_limit_exceeded" && attempt < retries - 1) {
        console.warn(
          `Rate limit exceeded, retrying in ${Math.pow(2, attempt)} seconds...`
        );
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempt) * 1000)
        );
      } else {
        throw error;
      }
    }
  }
}
