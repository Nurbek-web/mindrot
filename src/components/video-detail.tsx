"use client";

import { useEffect, useState } from "react";
import { getFirestore, doc, onSnapshot } from "firebase/firestore";
import firebase_app from "@/lib/firebase/config";
import { UserAuth } from "@/context/AuthContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const db = getFirestore(firebase_app);

export default function VideoDetail({ initialVideo }: { initialVideo: any }) {
  const [video, setVideo] = useState<any>(initialVideo);
  const [error, setError] = useState<string | null>(null);
  const { user }: any = UserAuth();

  useEffect(() => {
    if (!user || !video) return;

    const unsubscribe = onSnapshot(
      doc(db, "pending-videos", video.id),
      (doc) => {
        if (doc.exists()) {
          setVideo({ id: doc.id, ...doc.data() });
        } else {
          setError("Video not found or you don't have permission to view it.");
        }
      },
      (error) => {
        console.error("Error in Firestore listener:", error);
        setError("Failed to fetch video details. Please try again later.");
      }
    );

    return () => unsubscribe();
  }, [user, video?.id]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center text-red-500">{error}</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">No video found.</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{video.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex justify-center">
            <video
              src={video.video_url}
              controls
              poster={video.thumbnailUrl}
              className="w-full max-w-[400px] max-h-[800px] object-contain bg-black"
            >
              Your browser does not support the video tag.
            </video>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <strong>Status:</strong>{" "}
              <Badge
                variant={
                  video.status === "pending"
                    ? "secondary"
                    : video.status == "ERROR"
                    ? "destructive"
                    : video.status == "COMPLETED"
                    ? "default"
                    : "outline"
                }
                className="ml-2"
              >
                {video.status}
              </Badge>
            </div>
            <div>
              <strong>Created At:</strong>{" "}
              <span className="ml-2">
                {new Date(video.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <a href={video.video_url} download={video.title}>
              <Button variant="default">Download Video</Button>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
