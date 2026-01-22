import { interpolate, useCurrentFrame, spring, useVideoConfig } from "remotion";

interface HighlightProps {
  text: string;
  startFrame?: number;
  style?: React.CSSProperties;
  backgroundColor?: string;
}

export const Highlight: React.FC<HighlightProps> = ({
  text,
  startFrame = 0,
  style,
  backgroundColor = "rgba(59, 130, 246, 0.3)",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const adjustedFrame = Math.max(0, frame - startFrame);

  const scale = spring({
    frame: adjustedFrame,
    fps,
    config: {
      damping: 12,
      stiffness: 200,
    },
  });

  const opacity = interpolate(adjustedFrame, [0, 10], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 12px",
        backgroundColor,
        borderRadius: 6,
        transform: `scale(${scale})`,
        opacity,
        ...style,
      }}
    >
      {text}
    </span>
  );
};
