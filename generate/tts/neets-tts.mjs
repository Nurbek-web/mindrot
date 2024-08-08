import fetch from "node-fetch";
import fs from "fs";
import dotenv from "dotenv";

import { fileURLToPath } from "url";
import path, { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "..", ".env") });

// andrew-tate, joe-rogan, donald-trump, mark-zuckerberg, alex-jones, bill-gates

export async function generateAudioNeets(character, script) {
  let voice_id = "andrew-tate";
  switch (character) {
    case 1:
      voice_id = "andrew-tate";
      break;
    case 2:
      voice_id = "ben-shapiro";
      break;
    case 3:
      voice_id = "donald-trump";
      break;
    case 4:
      voice_id = "kanye-west";
      break;
    case 5:
      voice_id = "tucker-carlson";
      break;
    case 6:
      voice_id = "elon-musk";
      break;
    case 7:
      voice_id = "jordan-peterson";
      break;
    case 8:
      voice_id = "50-cent";
      break;
  }

  const response = await fetch("https://api.neets.ai/v1/tts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": process.env.NEETS_API_KEY,
    },
    body: JSON.stringify({
      text: script,
      voice_id: voice_id,
      params: {
        model: "ar-diff-50k",
      },
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Server responded with status code ${response.status}, ${response.statusText}`
    );
  }
  const audioStream = fs.createWriteStream(`public/voice/voice.mp3`);
  response.body.pipe(audioStream);

  return new Promise((resolve, reject) => {
    audioStream.on("finish", () => {
      resolve("Audio file saved as public/voice/voice.mp3");
    });
    audioStream.on("error", reject);
  });
}

// (async () => {
//   await generateAudioNeets(
//     "andrew-tate",
//     "Welcome back to our Summer College Planning Series, this time we're talking all things Financial Aid"
//   );
// })();
