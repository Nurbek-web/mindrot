import { NextRequest, NextResponse } from "next/server";
import firebase_app from "@/lib/firebase/config";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";

const db = getFirestore(firebase_app);

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    topic,
    selectedVideo,
    selectedMusic,
    selectedDuration,
    userId,
    selectedCharacter,
  } = body;

  try {
    // Check if user has any pending videos that are not in ERROR or COMPLETED state
    const pendingVideosQuery = query(
      collection(db, "pending-videos"),
      where("userId", "==", userId),
      where("status", "not-in", ["COMPLETED", "ERROR"])
    );

    const pendingVideosSnapshot = await getDocs(pendingVideosQuery);

    if (!pendingVideosSnapshot.empty) {
      return NextResponse.json(
        {
          error:
            "You have pending videos in progress. Please wait for them to complete before creating a new one.",
        },
        { status: 400 }
      );
    }

    // If no pending videos in progress, proceed with creating a new one
    const docRef = await addDoc(collection(db, "pending-videos"), {
      title: topic,
      background: selectedVideo,
      music: selectedMusic,
      fps: 40,
      duration: selectedDuration,
      status: "pending",
      createdAt: new Date().toISOString(),
      process_id: -1,
      clean_srt: true,
      userId: userId,
      progress: 0,
      showImages: true,
      character: selectedCharacter,
    });

    return NextResponse.json({
      id: docRef.id,
      message: "Document added successfully",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
