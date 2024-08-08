import { generateTranscriptAudio } from "./audio.mjs";
import getAudioDuration from "./audioduration.mjs";
import { writeFile, readFile } from "fs/promises";
import { generateCleanSrt } from "./cleanSrt.mjs";
import { updateStatusVideo } from "./firebase.mjs";
import { downloadImages, generateImagePrompts } from "./images.mjs";

async function parseSRT(filePath) {
  const content = await readFile(filePath, "utf8");
  const entries = content.split("\n\n");
  return entries.map((entry) => {
    const [id, time, ...textLines] = entry.split("\n");
    const [start, end] = time.split(" --> ");
    return {
      id: parseInt(id),
      start: start,
      end: end,
      text: textLines.join(" "),
    };
  });
}

const transcribeAudio = async () => {
  const retryDelays = [1000, 2000, 3000]; // Retry delays in milliseconds
  let retryCount = 0;

  while (retryCount < retryDelays.length) {
    try {
      const response = await fetch("http://127.0.0.1:5000/transcribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ audio_path: "public/voice/voice.mp3" }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(
        `Error transcribing audio (attempt ${retryCount + 1}):`,
        error
      );

      if (retryCount < retryDelays.length - 1) {
        const delay = retryDelays[retryCount];
        console.log(`Retrying in ${delay / 1000} second(s)...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw error;
      }

      retryCount++;
    }
  }
};

function srtTimeToSeconds(srtTime) {
  const [hours, minutes, secondsAndMillis] = srtTime.split(":");
  const [seconds, milliseconds] = secondsAndMillis.split(",");
  return (
    Number(hours) * 3600 +
    Number(minutes) * 60 +
    Number(seconds) +
    Number(milliseconds) / 1000
  );
}

function secondsToSrtTime(seconds) {
  const pad = (num, size) => String(num).padStart(size, "0");
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const millis = Math.round((seconds % 1) * 1000);
  return `${pad(hrs, 2)}:${pad(mins, 2)}:${pad(secs, 2)},${pad(millis, 3)}`;
}

export default async function transcribeFunction(
  topic,
  character,
  fps,
  duration,
  background,
  music,
  cleanSrt,
  showImages,
  local,
  videoId
) {
  try {
    const transcript = await generateTranscriptAudio(
      topic,
      character,
      fps,
      duration,
      background,
      music,
      local,
      videoId,
      showImages
    );

    if (!local) {
      updateStatusVideo(videoId, "Transcribing video ...", 35);
    }
    // Transcribing audio
    console.log("Transcribing audio");
    const transcription = await transcribeAudio();
    console.log("Finished transcribing");

    let srtIndex = 1; // SRT index starts at 1

    // Initialize SRT content
    let srtContent = "";

    const words = transcription.segments.flatMap((segment) => segment.words);
    for (let j = 0; j < words.length; j++) {
      const word = words[j];
      const nextWord = words[j + 1];

      // Set the start time to the word's start time
      const startTime = secondsToSrtTime(word.start);

      // If there's a next word, the end time is the next word's start time
      // Otherwise, use the current word's end time
      const endTime = nextWord
        ? secondsToSrtTime(nextWord.start)
        : secondsToSrtTime(word.end);

      // Append the formatted SRT entry to the content
      srtContent += `${srtIndex}\n${startTime} --> ${endTime}\n${word.text}\n\n`;
      srtIndex++;
    }

    const lines = srtContent.split("\n");

    const incrementedSrtLines = lines.map((line) => {
      const timeMatch = line.match(
        /(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/
      );
      if (timeMatch) {
        const startTime = srtTimeToSeconds(timeMatch[1]);
        const endTime = srtTimeToSeconds(timeMatch[2]);
        const incrementedStartTime = secondsToSrtTime(startTime);
        const incrementedEndTime = secondsToSrtTime(endTime);
        return `${incrementedStartTime} --> ${incrementedEndTime}`;
      }
      return line;
    });

    const incrementedSrtContent = incrementedSrtLines.join("\n");

    // The name of the SRT file is based on the audio file but with the .srt extension
    const srtFileName = "public/srt/voice.srt";

    const uncleanSrtContent = incrementedSrtContent;

    // const audioDuration = await getAudioDuration("public/voice/voice.mp3");

    if (!local) {
      updateStatusVideo(videoId, "Cleaning srt ...", 51);
    }
    // Uncomment if you want to clean the SRT files
    if (cleanSrt) {
      // cleanSrt
      // Cleaning subtitle srt files
      console.log("Cleaning SRT");
      await generateCleanSrt(transcript, {
        content: uncleanSrtContent,
        fileName: srtFileName,
      });
    } else {
      await writeFile(srtFileName, uncleanSrtContent, "utf8");
    }

    if (showImages) {
      if (!local) {
        updateStatusVideo(videoId, "Generating image prompts...", 60);
      }
      const prompts = await generateImagePrompts(
        transcript,
        "public/voice/voice.mp3"
      );

      if (!local) {
        updateStatusVideo(videoId, "Downloading images...", 70);
      }
      await downloadImages(prompts);
    }
  } catch (error) {
    console.error("Error in transcribeFunction:", error);
  }
}
