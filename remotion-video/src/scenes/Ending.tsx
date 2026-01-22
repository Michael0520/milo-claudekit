import { AbsoluteFill, interpolate, useCurrentFrame, spring, useVideoConfig } from "remotion";

export const Ending: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Background glow animation
  const glowOpacity = interpolate(frame, [0, 30], [0, 0.6], {
    extrapolateRight: "clamp",
  });

  const glowScale = interpolate(frame, [0, 30], [0.8, 1], {
    extrapolateRight: "clamp",
  });

  // Title animation
  const titleY = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  const titleOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Command box animation
  const commandScale = spring({
    frame: Math.max(0, frame - 15),
    fps,
    config: { damping: 15, stiffness: 120 },
  });

  const commandOpacity = interpolate(frame, [15, 30], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Typing animation for command
  const commandText = "/plugin marketplace add Michael0520/milo-claudekit";
  const charsToShow = Math.min(
    commandText.length,
    Math.floor(Math.max(0, frame - 25) / 1.2)
  );
  const displayedCommand = commandText.slice(0, charsToShow);
  const isTyping = charsToShow < commandText.length;
  const cursorOpacity = isTyping && Math.floor(frame / 8) % 2 === 0 ? 1 : 0;

  // GitHub link animation
  const linkScale = spring({
    frame: Math.max(0, frame - 60),
    fps,
    config: { damping: 12, stiffness: 150 },
  });

  const linkOpacity = interpolate(frame, [60, 75], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Floating particles (simpler than opening)
  const particles = Array.from({ length: 6 }, (_, i) => {
    const angle = (i / 6) * Math.PI * 2;
    const radius = 400 + Math.sin(frame / 25 + i) * 30;
    const x = Math.cos(angle + frame / 80) * radius;
    const y = Math.sin(angle + frame / 80) * radius * 0.4;
    const size = 3 + Math.sin(frame / 20 + i) * 1.5;
    const opacity = interpolate(frame, [20 + i * 5, 40 + i * 5], [0, 0.4], {
      extrapolateRight: "clamp",
    });

    return { x, y, size, opacity };
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0f172a",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          width: 1000,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(59, 130, 246, 0.3) 0%, rgba(139, 92, 246, 0.1) 50%, transparent 70%)",
          opacity: glowOpacity,
          transform: `scale(${glowScale})`,
          filter: "blur(100px)",
        }}
      />

      {/* Floating particles */}
      {particles.map((particle, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: particle.size,
            height: particle.size,
            borderRadius: "50%",
            backgroundColor: "#3b82f6",
            opacity: particle.opacity,
            transform: `translate(${particle.x}px, ${particle.y}px)`,
            boxShadow: `0 0 ${particle.size * 3}px #3b82f6`,
          }}
        />
      ))}

      {/* Get started text */}
      <div
        style={{
          textAlign: "center",
          opacity: titleOpacity,
          transform: `translateY(${(1 - titleY) * 40}px)`,
        }}
      >
        <p
          style={{
            fontSize: 42,
            color: "#ffffff",
            margin: 0,
            fontWeight: 600,
            letterSpacing: 1,
          }}
        >
          Get Started
        </p>
      </div>

      {/* Install command box */}
      <div
        style={{
          marginTop: 50,
          opacity: commandOpacity,
          transform: `scale(${commandScale})`,
          padding: "24px 48px",
          backgroundColor: "#0d1117",
          borderRadius: 16,
          border: "1px solid #30363d",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(59, 130, 246, 0.1)",
        }}
      >
        <code
          style={{
            fontSize: 26,
            fontFamily: "SF Mono, Monaco, Consolas, monospace",
          }}
        >
          <span style={{ color: "#7ee787" }}>❯</span>
          <span style={{ color: "#e6edf3" }}> {displayedCommand}</span>
          {isTyping && (
            <span
              style={{
                opacity: cursorOpacity,
                color: "#3b82f6",
              }}
            >
              ▋
            </span>
          )}
        </code>
      </div>

      {/* GitHub link */}
      <div
        style={{
          position: "absolute",
          bottom: 140,
          display: "flex",
          alignItems: "center",
          gap: 16,
          opacity: linkOpacity,
          transform: `scale(${linkScale})`,
          padding: "12px 24px",
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          borderRadius: 30,
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        {/* GitHub icon SVG */}
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="#ffffff"
        >
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
        <span
          style={{
            fontSize: 20,
            color: "#e6edf3",
            fontWeight: 500,
          }}
        >
          github.com/Michael0520/milo-claudekit
        </span>
        <span
          style={{
            fontSize: 20,
            color: "#3b82f6",
          }}
        >
          →
        </span>
      </div>

      {/* Star badge */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          opacity: linkOpacity,
          transform: `scale(${linkScale})`,
        }}
      >
        <span
          style={{
            fontSize: 16,
            color: "#8b949e",
          }}
        >
          ⭐ Star us on GitHub
        </span>
      </div>
    </AbsoluteFill>
  );
};
