import axios from "axios";
import fs from "fs";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path, { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "..", ".env") });

export async function generateAudioUnrealSpeech(script) {
  console.log("Generating audio with unreal speech");

  const options = {
    method: "POST",
    url: "https://api.v7.unrealspeech.com/speech",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      Authorization: `Bearer ${process.env.UNREAL_SPEECH_API_KEY}`,
    },
    data: {
      Text: script, // Up to 1000 characters
      VoiceId: "Will", // Dan, Will, Scarlett, Liv, Amy
      Bitrate: "64k", // 320k, 256k, 192k, ...
      Speed: "0.15", // -1.0 to 1.0
      Pitch: "1", // -0.5 to 1.5
      TimestampType: "sentence",
    },
  };

  try {
    const response = await axios.request(options);
    console.log(response.data);

    const audioUrl = response.data.OutputUri;

    // Download the audio file
    const audioResponse = await axios({
      method: "get",
      url: audioUrl,
      responseType: "stream",
    });

    const audioPath = "public/voice/voice.mp3";
    const writer = fs.createWriteStream(audioPath, {
      encoding: "binary",
    });

    await new Promise((resolve, reject) => {
      audioResponse.data.pipe(writer);
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    console.log("Audio file saved as voice.mp3");
  } catch (error) {
    console.error("Failed while generating audio in UNREAL SPEECH", error);
  }
}
