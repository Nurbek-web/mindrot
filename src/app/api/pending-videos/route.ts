import { NextRequest, NextResponse } from "next/server";
import firebase_app from "@/lib/firebase/config";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  orderBy,
} from "firebase/firestore";

const db = getFirestore(firebase_app);

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    const videosRef = collection(db, "pending-videos");
    const q = query(
      videosRef
      // where("userId", "==", userId)
      // orderBy("createdAt", "asc")
    );
    const querySnapshot = await getDocs(q);

    const videos = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      videos,
      message: "Videos fetched successfully",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
