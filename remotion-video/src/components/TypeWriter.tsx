import { interpolate, useCurrentFrame } from "remotion";

interface TypeWriterProps {
  text: string;
  startFrame?: number;
  speed?: number;
  style?: React.CSSProperties;
}

export const TypeWriter: React.FC<TypeWriterProps> = ({
  text,
  startFrame = 0,
  speed = 2,
  style,
}) => {
  const frame = useCurrentFrame();
  const adjustedFrame = Math.max(0, frame - startFrame);

  const charsToShow = Math.floor(adjustedFrame / speed);
  const displayedText = text.slice(0, charsToShow);

  const cursorOpacity = Math.floor(frame / 15) % 2 === 0 ? 1 : 0;
  const showCursor = charsToShow < text.length;

  return (
    <span style={style}>
      {displayedText}
      {showCursor && (
        <span style={{ opacity: cursorOpacity }}>|</span>
      )}
    </span>
  );
};
