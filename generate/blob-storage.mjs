import { BlobServiceClient } from "@azure/storage-blob";
import dotenv from "dotenv";
import { access } from "fs/promises";

dotenv.config();

export async function uploadVideo(videoPath, videoName) {
  console.log(`Starting upload process for ${videoName}`);

  try {
    // Check if the file exists before attempting to upload
    await access(videoPath);
  } catch (error) {
    console.error(`File not found at ${videoPath}: ${error.message}`);
    throw new Error(`Video file not found: ${error.message}`);
  }

  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING

  if (!connectionString) {
    console.error("Azure Storage connection string is not set");
    throw new Error("Azure Storage connection string is not set");
  }

  try {
    const blobServiceClient =
      BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient("videos");
    const blockBlobClient = containerClient.getBlockBlobClient(videoName);

    console.log(`Uploading ${videoName} to Azure Blob storage`);
    await blockBlobClient.uploadFile(videoPath);
    console.log(`Video "${videoName}" uploaded successfully`);

    return blockBlobClient.url;
  } catch (error) {
    console.error(`Error uploading video ${videoName}: ${error.message}`);
    throw new Error(`Failed to upload video: ${error.message}`);
  }
}
