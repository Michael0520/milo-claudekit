import { AbsoluteFill, interpolate, useCurrentFrame, spring, useVideoConfig } from "remotion";
import { TypeWriter } from "../components/TypeWriter";

export const Ending: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  const commandOpacity = interpolate(frame, [20, 35], [0, 1], {
    extrapolateRight: "clamp",
  });

  const linkScale = spring({
    frame: Math.max(0, frame - 50),
    fps,
    config: { damping: 12, stiffness: 150 },
  });

  const linkOpacity = interpolate(frame, [50, 60], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0f172a",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "SF Mono, Monaco, Consolas, monospace",
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          width: 800,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />

      {/* Get started text */}
      <div
        style={{
          textAlign: "center",
          opacity: titleOpacity,
        }}
      >
        <p
          style={{
            fontSize: 32,
            color: "#94a3b8",
            margin: 0,
            fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif",
          }}
        >
          Get started
        </p>
      </div>

      {/* Install command */}
      <div
        style={{
          marginTop: 40,
          opacity: commandOpacity,
          padding: "20px 40px",
          backgroundColor: "#1e293b",
          borderRadius: 12,
          border: "1px solid #334155",
        }}
      >
        <code
          style={{
            fontSize: 28,
            color: "#e2e8f0",
          }}
        >
          <span style={{ color: "#94a3b8" }}>/plugin marketplace add </span>
          <span style={{ color: "#3b82f6" }}>Michael0520/milo-claudekit</span>
        </code>
      </div>

      {/* GitHub link */}
      <div
        style={{
          position: "absolute",
          bottom: 120,
          display: "flex",
          alignItems: "center",
          gap: 16,
          opacity: linkOpacity,
          transform: `scale(${linkScale})`,
        }}
      >
        {/* GitHub icon SVG */}
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="#ffffff"
        >
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
        <span
          style={{
            fontSize: 24,
            color: "#94a3b8",
            fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif",
          }}
        >
          github.com/Michael0520/milo-claudekit
        </span>
      </div>
    </AbsoluteFill>
  );
};
