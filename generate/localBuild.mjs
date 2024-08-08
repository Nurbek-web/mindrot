import transcribeFunction from "./transcribe.mjs";
import path from "path";
import { exec } from "child_process";
import { rm, mkdir, unlink } from "fs/promises";
import { uploadVideo } from "./blob-storage.mjs";

export const PROCESS_ID = 0;

async function cleanupResources() {
  try {
    await rm(path.join("public", "srt"), { recursive: true, force: true });
    await rm(path.join("public", "voice"), { recursive: true, force: true });
    await rm(path.join("public", "images"), { recursive: true, force: true });

    await unlink(path.join("src", "tmp", "context.tsx")).catch((e) =>
      console.error(e)
    );
    await mkdir(path.join("public", "srt"), { recursive: true });
    await mkdir(path.join("public", "voice"), { recursive: true });
    await mkdir(path.join("public", "images"), { recursive: true });
  } catch (err) {
    console.error(`Error during cleanup: ${err}`);
  }
}

async function main() {
  const videoTopic = "Archimedes' principle"; //human in the loop
  const fps = 30;
  const duration = 1; //minute
  //MINECRAFT or TRUCK or GTA
  const background = "GTA";
  const music = "WII_SHOP_CHANNEL_TRAP";
  const cleanSrt = true;
  const saveInCloudStorage = false;
  const showImages = true;
  const local = true;
  const character = 1;

  await transcribeFunction(
    videoTopic,
    character,
    fps,
    duration,
    background,
    music,
    cleanSrt,
    showImages,
    local
  );

  console.log("Rendering video");
  // run in the command line `npm run build`
  exec("yarn build", async (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);

    if (saveInCloudStorage) {
      // upload video into Azure Blob storage
      const videoPath = "./out/video.mp4";
      const videoName = `${videoTopic}-${Date.now()}.mp4`;
      const videoUrl = await uploadVideo(videoPath, videoName);
      console.log("Successfully saved in Azure Blob Storage", videoUrl);
    }

    cleanupResources();
  });
}

(async () => {
  await main();
})();
