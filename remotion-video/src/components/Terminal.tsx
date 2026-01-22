import { interpolate, useCurrentFrame } from "remotion";

interface TerminalLine {
  type: "command" | "output" | "error" | "success";
  text: string;
  delay?: number; // frames before this line starts
}

interface TerminalProps {
  lines: TerminalLine[];
  title?: string;
  typingSpeed?: number; // frames per character
  startFrame?: number;
}

export const Terminal: React.FC<TerminalProps> = ({
  lines,
  title = "Terminal",
  typingSpeed = 1,
  startFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const adjustedFrame = Math.max(0, frame - startFrame);

  // Calculate cumulative delays and when each line starts/ends
  let cumulativeFrame = 0;
  const lineTimings = lines.map((line) => {
    const lineStart = cumulativeFrame + (line.delay || 0);
    const lineEnd = lineStart + line.text.length * typingSpeed;
    cumulativeFrame = lineEnd + 5; // small gap between lines
    return { lineStart, lineEnd, line };
  });

  const getLineColor = (type: TerminalLine["type"]) => {
    switch (type) {
      case "command":
        return "#e2e8f0";
      case "output":
        return "#94a3b8";
      case "error":
        return "#f87171";
      case "success":
        return "#4ade80";
      default:
        return "#e2e8f0";
    }
  };

  const getPrefix = (type: TerminalLine["type"]) => {
    switch (type) {
      case "command":
        return { text: "❯ ", color: "#3b82f6" };
      case "error":
        return { text: "✗ ", color: "#f87171" };
      case "success":
        return { text: "✓ ", color: "#4ade80" };
      default:
        return { text: "  ", color: "transparent" };
    }
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#0d1117",
        borderRadius: 12,
        overflow: "hidden",
        fontFamily: "SF Mono, Monaco, Consolas, monospace",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Title bar */}
      <div
        style={{
          height: 40,
          backgroundColor: "#161b22",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          gap: 8,
        }}
      >
        <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#f87171" }} />
        <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#fbbf24" }} />
        <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#4ade80" }} />
        <span
          style={{
            marginLeft: 12,
            fontSize: 13,
            color: "#6b7280",
          }}
        >
          {title}
        </span>
      </div>

      {/* Terminal content */}
      <div
        style={{
          flex: 1,
          padding: 24,
          overflow: "hidden",
        }}
      >
        {lineTimings.map(({ lineStart, lineEnd, line }, index) => {
          if (adjustedFrame < lineStart) return null;

          const charsToShow = Math.min(
            line.text.length,
            Math.floor((adjustedFrame - lineStart) / typingSpeed)
          );
          const displayedText = line.text.slice(0, charsToShow);
          const isTyping = charsToShow < line.text.length;
          const cursorOpacity = isTyping && Math.floor(frame / 8) % 2 === 0 ? 1 : 0;

          const prefix = getPrefix(line.type);

          return (
            <div
              key={index}
              style={{
                fontSize: 18,
                lineHeight: 1.8,
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
              }}
            >
              <span style={{ color: prefix.color }}>{prefix.text}</span>
              <span style={{ color: getLineColor(line.type) }}>{displayedText}</span>
              {isTyping && line.type === "command" && (
                <span
                  style={{
                    opacity: cursorOpacity,
                    color: "#3b82f6",
                    fontWeight: "bold",
                  }}
                >
                  ▋
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
