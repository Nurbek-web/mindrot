"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { UserAuth } from "@/context/AuthContext";
import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  limit,
} from "firebase/firestore";
import firebase_app from "@/lib/firebase/config";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Loading from "@/components/loading";

const db = getFirestore(firebase_app);

interface Video {
  id: string;
  title: string;
  status: string;
  progress: number | string;
  createdAt: string;
}

const Dashboard: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router: any = useRouter();

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const setupRealtimeListener = () => {
      setIsLoading(true);
      setError(null);

      const videosRef = collection(db, "pending-videos");
      const q = query(
        videosRef,
        where("status", "==", "COMPLETED"),
        orderBy("createdAt", "desc"),
        limit(20)
      );

      unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const updatedVideos: Video[] = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Video[];
          setVideos(updatedVideos);
          setIsLoading(false);
        },
        (error) => {
          console.error("Error in Firestore listener:", error);
          setError("Failed to fetch videos. Please try again later.");
          setIsLoading(false);
        }
      );
    };

    setupRealtimeListener();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Global Videos</CardTitle>
        <CardDescription></CardDescription>
      </CardHeader>
      <CardContent>
        {videos.length === 0 ? (
          <p>No pending videos found.</p>
        ) : (
          <div className="w-full overflow-auto">
            <table className="w-full table-auto">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground md:px-6">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground md:px-6">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground md:px-6">
                    Progress
                  </th>
                </tr>
              </thead>
              <tbody>
                {videos.map((video) => (
                  <React.Fragment key={video.id}>
                    <tr
                      className="border-b border-muted/20 last:border-b-0"
                      onClick={() => router.push(`dashboard/${video.id}`)}
                    >
                      <td className="px-4 py-4 text-sm font-medium text-foreground md:px-6">
                        <Link href={`dashboard/${video.id}`}>
                          {video.title}
                        </Link>
                      </td>
                      <td className="px-4 py-4 text-sm text-muted-foreground md:px-6">
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
                        >
                          {video.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-right text-sm text-foreground md:px-6">
                        {typeof video.progress === "number" ? (
                          <Progress
                            value={video.progress}
                            className="h-2 rounded-full"
                          />
                        ) : (
                          video.progress
                        )}
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Dashboard;
