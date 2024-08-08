import { getFirestore, doc, getDoc } from "firebase/firestore";
import firebase_app from "@/lib/firebase/config";
import VideoDetail from "@/components/video-detail";

const db = getFirestore(firebase_app);

async function getVideo(videoId: string) {
  const videoRef = doc(db, "pending-videos", videoId);
  const videoSnap = await getDoc(videoRef);

  if (videoSnap.exists()) {
    return { id: videoSnap.id, ...videoSnap.data() };
  }

  return null;
}

export default async function VideoDetailServer({
  params,
}: {
  params: { videoId: string };
}) {
  const video = await getVideo(params.videoId);

  if (!video) {
    return <div>Video not found.</div>;
  }

  return <VideoDetail initialVideo={video} />;
}
