import { Composition } from "remotion";
import { ClaudekitIntro } from "./ClaudekitIntro";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ClaudekitIntro"
        component={ClaudekitIntro}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
