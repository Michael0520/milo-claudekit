import { interpolate, useCurrentFrame } from "remotion";

interface FadeInProps {
  children: React.ReactNode;
  startFrame?: number;
  duration?: number;
  style?: React.CSSProperties;
}

export const FadeIn: React.FC<FadeInProps> = ({
  children,
  startFrame = 0,
  duration = 15,
  style,
}) => {
  const frame = useCurrentFrame();
  const adjustedFrame = Math.max(0, frame - startFrame);

  const opacity = interpolate(adjustedFrame, [0, duration], [0, 1], {
    extrapolateRight: "clamp",
  });

  const translateY = interpolate(adjustedFrame, [0, duration], [20, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
