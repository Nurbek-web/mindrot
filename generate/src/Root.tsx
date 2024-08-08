import { Composition, staticFile } from "remotion";
import { AudioGramSchema, AudiogramComposition } from "./Composition";
import "./style.css";
import { videoFileName, fps, showImages } from "./tmp/context";
import { getAudioDuration } from "@remotion/media-utils";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Video"
        component={AudiogramComposition}
        fps={fps}
        width={1080}
        height={1920}
        schema={AudioGramSchema}
        defaultProps={{
          // Audio settings
          audioOffsetInSeconds: 0,
          showImages: showImages,
          // Title settings
          audioFileName: staticFile(`voice/voice.mp3`),
          titleText: "Back propagation",
          titleColor: "rgba(186, 186, 186, 0.93)",

          // Subtitles settings
          videoFileName,
          subtitlesTextColor: "rgba(255, 255, 255, 0.93)",
          subtitlesLinePerPage: 6,
          subtitlesZoomMeasurerSize: 10,
          subtitlesLineHeight: 128,

          // Wave settings
          waveFreqRangeStartIndex: 7,
          waveLinesToDisplay: 30,
          waveNumberOfSamples: "256", // This is string for Remotion controls and will be converted to a number
          mirrorWave: true,
          durationInSeconds: 60,
        }}
        // Determine the length of the video based on the duration of the audio file
        calculateMetadata={async ({ props }) => {
          const duration =
            (await getAudioDuration(staticFile(`voice/voice.mp3`))) + 3;
          return {
            durationInFrames: Math.ceil(duration * fps),
            props,
          };
        }}
      />
    </>
  );
};
