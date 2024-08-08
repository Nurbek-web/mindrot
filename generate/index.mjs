import { exec } from "child_process";
import { promisify } from "util";
import { rm, mkdir, unlink } from "fs/promises";
import path from "path";

import { uploadVideo } from "./blob-storage.mjs";
import transcribeFunction from "./transcribe.mjs";

import db, { updateStatusVideo } from "./firebase.mjs";

const execP = promisify(exec);

const local = false;

export default async function Main() {
  console.log("Starting video processing...");

  while (true) {
    // Poll Firestore for pending videos
    const snapshot = await db
      .collection("pending-videos")
      .where("process_id", "==", -1)
      .get();

    if (snapshot.empty) {
      console.log("No pending videos found. Waiting for 15 seconds...");
      await new Promise((resolve) => setTimeout(resolve, 15000)); // Wait for 30 seconds
      continue;
    }

    const videoDoc = snapshot.docs[0];

    try {
      const videoData = videoDoc.data();
      const videoId = videoDoc.id;

      // Update Firestore to mark the video as being processed
      await db
        .collection("pending-videos")
        .doc(videoDoc.id)
        .update({ process_id: process.env.HOSTNAME || "unknown" });

      // Video processing logic
      const {
        title: videoTopic,
        fps,
        duration,
        background,
        music,
        clean_srt: cleanSrt,
        showImages,
        character,
      } = videoData;

      console.log(`Processing video: ${videoTopic}`);

      await transcribeFunction(
        videoTopic,
        character,
        fps,
        duration,
        background,
        music,
        cleanSrt,
        showImages,
        local,
        videoId
      );

      updateStatusVideo(videoId, "Rendering video", 69);
      console.log("Rendering video");
      const { stdout, stderr } = await execP("yarn build");
      console.log(`Build stdout: ${stdout}`);
      if (stderr) console.error(`Build stderr: ${stderr}`);

      updateStatusVideo(videoId, "Uploading video to cloud storage", 91);
      // Upload video to Azure Blob Storage
      console.log("Uploading video to Azure Blob storage");
      const videoPath = "./out/video.mp4";
      const videoName = `${videoTopic}-${Date.now()}.mp4`;
      const videoUrl = await uploadVideo(videoPath, videoName);
      console.log(`Video uploaded: ${videoUrl}`);

      // Update Firestore with the video URL and status
      await db.collection("pending-videos").doc(videoDoc.id).update({
        status: "COMPLETED",
        progress: 100,
        video_url: videoUrl,
      });

      await cleanupResources();
    } catch (error) {
      console.error(`Error processing video: ${error.stack}`);
      if (videoDoc) {
        await db.collection("pending-videos").doc(videoDoc.id).update({
          status: "ERROR",
          error_message: error.message,
        });
      }
    }
  }
}

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

// Run the main function
Main().catch(console.error);
