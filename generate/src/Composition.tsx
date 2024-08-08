import React, { useEffect, useState } from "react";
import {
  AbsoluteFill,
  Audio,
  continueRender,
  delayRender,
  Img,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { PaginatedSubtitles } from "./Subtitles";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import { music } from "./tmp/context";

type SubtitleEntry = {
  index: string;
  startTime: number;
  endTime: number;
  text: string;
  srt: string;
};

type ImageData = {
  prompt: string;
  timestamp: number;
  localPath: string;
};

const srtTimeToSeconds = (srtTime: string) => {
  const [hours, minutes, secondsAndMillis] = srtTime.split(":");
  const [seconds, milliseconds] = secondsAndMillis.split(",");
  return (
    Number(hours) * 3600 +
    Number(minutes) * 60 +
    Number(seconds) +
    Number(milliseconds) / 1000
  );
};

const parseSRT = (srtContent: string): SubtitleEntry[] => {
  const blocks = srtContent.split("\n\n");
  return blocks
    .map((block) => {
      const lines = block.split("\n");
      const indexLine = lines[0];
      const timeLine = lines[1];

      if (!indexLine || !timeLine || lines.length < 3) {
        return null;
      }

      const [startTime, endTime] = timeLine
        .split(" --> ")
        .map(srtTimeToSeconds);

      const textLines = lines.slice(2).join(" ");

      return {
        index: indexLine,
        startTime,
        endTime,
        text: textLines,
        srt: block,
      };
    })
    .filter((entry): entry is SubtitleEntry => entry !== null);
};

export const AudioGramSchema = z.object({
  videoFileName: z.string(),
  showImages: z.boolean(),
  durationInSeconds: z.number().positive(),
  audioOffsetInSeconds: z.number().min(0),
  audioFileName: z.string(),
  titleText: z.string(),
  titleColor: zColor(),
  subtitlesTextColor: zColor(),
  subtitlesLinePerPage: z.number().int().min(0),
  subtitlesLineHeight: z.number().int().min(0),
  subtitlesZoomMeasurerSize: z.number().int().min(0),
  mirrorWave: z.boolean(),
  waveLinesToDisplay: z.number().int().min(0),
  waveFreqRangeStartIndex: z.number().int().min(0),
  waveNumberOfSamples: z.enum(["32", "64", "128", "256", "512"]),
});

type AudiogramCompositionSchemaType = z.infer<typeof AudioGramSchema>;

export const AudiogramComposition: React.FC<AudiogramCompositionSchemaType> = ({
  audioFileName,
  showImages,
  subtitlesLinePerPage,
  waveNumberOfSamples,
  waveFreqRangeStartIndex,
  waveLinesToDisplay,
  subtitlesZoomMeasurerSize,
  subtitlesLineHeight,
  mirrorWave,
  audioOffsetInSeconds,
  videoFileName,
}) => {
  const { durationInFrames, fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const [subtitlesData, setSubtitlesData] = useState<SubtitleEntry[]>([]);
  const [currentSubtitle, setCurrentSubtitle] = useState<SubtitleEntry | null>(
    null
  );
  const [handle, setHandle] = useState<number | null>(null);
  const [currentSrtContent, setCurrentSrtContent] = useState<string>("");

  const [imageData, setImageData] = useState<ImageData[]>([]);
  const [currentImage, setCurrentImage] = useState<ImageData | null>(null);

  useEffect(() => {
    const fetchImageData = async () => {
      if (showImages) {
        try {
          const response = await fetch(staticFile("/images/imageData.json"));
          if (!response.ok) {
            throw new Error(
              `Failed to fetch image data: ${response.statusText}`
            );
          }
          const data = await response.json();
          // Sort the image data by timestamp
          const sortedData = data.sort(
            (a: ImageData, b: ImageData) => a.timestamp - b.timestamp
          );
          setImageData(sortedData);
          // console.log("Sorted image data:", sortedData);
        } catch (error) {
          console.error("Error fetching image data:", error);
        }
      }
    };

    fetchImageData();
  }, [showImages]);

  useEffect(() => {
    if (showImages && imageData.length > 0) {
      const currentTime = frame / fps;
      const currentImageIndex = imageData.findIndex((img, index) => {
        const nextImg = imageData[index + 1];
        return (
          currentTime >= img.timestamp &&
          (!nextImg || currentTime < nextImg.timestamp)
        );
      });

      if (currentImageIndex !== -1) {
        const newCurrentImage = imageData[currentImageIndex];
        setCurrentImage(newCurrentImage);
        // console.log(
        //   `Frame ${frame}, Time: ${currentTime.toFixed(2)}, Current Image: ${
        //     newCurrentImage.localPath
        //   }, Index: ${currentImageIndex}`
        // );
      } else {
        console.log(
          `Frame ${frame}, Time: ${currentTime.toFixed(
            2
          )}, No matching image found`
        );
      }
    }
  }, [frame, fps, imageData, showImages]);

  useEffect(() => {
    const fetchSubtitlesData = async () => {
      const handle = delayRender("Loading subtitles", {
        timeoutInMilliseconds: 120000,
      });
      setHandle(handle);
      try {
        const response = await fetch(staticFile("/srt/voice.srt"));
        if (!response.ok) {
          throw new Error(`Failed to fetch SRT file: ${response.statusText}`);
        }
        const text = await response.text();
        const parsedSubtitles = parseSRT(text);
        setSubtitlesData(
          parsedSubtitles.sort((a, b) => a.startTime - b.startTime)
        );
        continueRender(handle);
      } catch (error) {
        console.error("Error fetching subtitles:", error);
        continueRender(handle);
      }
    };

    fetchSubtitlesData();
  }, [fps]);

  useEffect(() => {
    if (subtitlesData.length > 0) {
      const currentTime = frame / fps;
      const current = subtitlesData.find(
        (subtitle) =>
          currentTime >= subtitle.startTime && currentTime < subtitle.endTime
      );
      if (current) {
        setCurrentSubtitle(current);
      }
    }
  }, [frame, fps, subtitlesData]);

  useEffect(() => {
    if (currentSubtitle) {
      setCurrentSrtContent(currentSubtitle.srt);
    }
  }, [currentSubtitle]);

  useEffect(() => {
    return () => {
      if (handle !== null) {
        continueRender(handle);
      }
    };
  }, [handle]);
  const audioOffsetInFrames = Math.round(audioOffsetInSeconds * fps);

  if (showImages) {
    return (
      <AbsoluteFill>
        {showImages && currentImage && (
          <div className="absolute top-0 left-0 w-full h-1/2 overflow-hidden z-10">
            <Img
              key={currentImage.localPath}
              src={staticFile(currentImage.localPath)}
              className="w-full h-full object-cover"
              style={{ objectPosition: "center top" }}
            />
          </div>
        )}
        <Sequence from={-audioOffsetInFrames}>
          <Audio src={audioFileName} volume={1} />
          {music !== "NONE" && <Audio volume={0.12} src={staticFile(music)} />}

          <div className="relative flex flex-col w-full h-full font-bangers">
            <div className="absolute bottom-0 left-0 w-full h-1/2">
              <OffthreadVideo
                muted
                className="h-full w-full object-cover"
                src={staticFile(videoFileName)}
              />
              <div
                style={{
                  lineHeight: `${subtitlesLineHeight}px`,
                  bottom: "70%",
                  position: "absolute",
                  left: 0,
                  right: 0,
                  fontSize: "165px",
                }}
                className="font-bangers z-20 text-center drop-shadow-2xl text-white mx-24"
              >
                <div
                  style={{
                    color: "#FFFFFF",
                    WebkitTextStroke: "4px black",
                    fontWeight: "bold",
                    textShadow: "2px 2px 0px #000000",
                  }}
                >
                  <PaginatedSubtitles
                    subtitles={currentSrtContent.toUpperCase()}
                    startFrame={audioOffsetInFrames}
                    endFrame={audioOffsetInFrames + durationInFrames}
                    linesPerPage={subtitlesLinePerPage}
                    subtitlesZoomMeasurerSize={subtitlesZoomMeasurerSize}
                    subtitlesLineHeight={subtitlesLineHeight}
                  />
                </div>
              </div>
            </div>
          </div>
        </Sequence>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill>
      <Sequence from={-audioOffsetInFrames}>
        <Audio src={audioFileName} />
        {music !== "NONE" && <Audio volume={0.25} src={staticFile(music)} />}
        <div className="relative -z-20 flex flex-col w-full h-full font-remotionFont">
          <div className="w-full h-[100%] relative">
            <OffthreadVideo
              muted
              className="h-full w-full object-cover"
              src={staticFile(videoFileName)}
            />
            <div
              // className=""
              style={{
                color: "#FFFFFF", // White color for the text
                WebkitTextStroke: "4px black", // Thick black stroke for the outline
                fontWeight: "bold", // Make the text bold
                textShadow: "2px 2px 0px #000000", // Additional shadow for more depth
                top: "50%",
              }}
              className="font-bangers z-20 text-center drop-shadow-2xl text-white mx-24 font-remotionFont z-10 absolute text-center text-9xl drop-shadow-2xl text-white mx-24 left-0 right-0"
            >
              <PaginatedSubtitles
                subtitles={currentSrtContent.toUpperCase()}
                startFrame={audioOffsetInFrames}
                endFrame={audioOffsetInFrames + durationInFrames}
                linesPerPage={subtitlesLinePerPage}
                subtitlesZoomMeasurerSize={subtitlesZoomMeasurerSize}
                subtitlesLineHeight={subtitlesLineHeight}
              />
            </div>
          </div>
        </div>
      </Sequence>
    </AbsoluteFill>
  );
};
