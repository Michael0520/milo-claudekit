import { AbsoluteFill, interpolate, useCurrentFrame, spring, useVideoConfig } from "remotion";

export const Ending: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Firework particles
  const createFirework = (centerX: number, centerY: number, startFrame: number, color: string) => {
    const particles = Array.from({ length: 12 }, (_, i) => {
      const angle = (i / 12) * Math.PI * 2;
      const progress = Math.max(0, frame - startFrame) / 30;
      const distance = interpolate(progress, [0, 1], [0, 150], { extrapolateRight: "clamp" });
      const opacity = interpolate(progress, [0, 0.2, 1], [0, 1, 0], { extrapolateRight: "clamp" });
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      return { x, y, opacity, color };
    });
    return particles;
  };

  const fireworks = [
    ...createFirework(300, 200, 10, "#3b82f6"),
    ...createFirework(1600, 300, 20, "#ec4899"),
    ...createFirework(500, 700, 30, "#8b5cf6"),
    ...createFirework(1400, 800, 40, "#22d3ee"),
    ...createFirework(960, 150, 50, "#f59e0b"),
  ];

  // Sparkles
  const sparkles = Array.from({ length: 40 }, (_, i) => {
    const seed = i * 73.7;
    const x = ((seed * 11) % 1920);
    const y = ((seed * 13) % 1080);
    const twinkle = Math.sin(frame / 4 + i * 3) * 0.5 + 0.5;
    const size = 2 + (i % 4);
    const delay = (i % 15) * 2;
    const opacity = interpolate(frame, [delay, delay + 15], [0, twinkle * 0.9], {
      extrapolateRight: "clamp",
    });
    const color = i % 3 === 0 ? "#ffffff" : i % 3 === 1 ? "#3b82f6" : "#8b5cf6";
    return { x, y, size, opacity, color };
  });

  // Rising particles
  const risingParticles = Array.from({ length: 15 }, (_, i) => {
    const x = 100 + (i * 130);
    const speed = 2 + (i % 3);
    const y = 1100 - ((frame * speed + i * 50) % 1200);
    const size = 3 + (i % 3);
    const opacity = interpolate(y, [0, 200, 800, 1080], [0, 0.6, 0.6, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const color = i % 2 === 0 ? "#3b82f6" : "#8b5cf6";
    return { x, y, size, opacity, color };
  });

  // Background glow animation
  const glowOpacity = interpolate(frame, [0, 30], [0, 0.7], {
    extrapolateRight: "clamp",
  });
  const glowScale = interpolate(frame, [0, 30], [0.8, 1.1], {
    extrapolateRight: "clamp",
  });

  // Title animation
  const titleY = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 80 },
  });
  const titleOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });
  const titleGlow = interpolate(Math.sin(frame / 8), [-1, 1], [0.5, 1]);

  // Command box animation
  const commandScale = spring({
    frame: Math.max(0, frame - 12),
    fps,
    config: { damping: 12, stiffness: 100 },
  });
  const commandOpacity = interpolate(frame, [12, 25], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Typing animation
  const commandText = "/plugin marketplace add Michael0520/milo-claudekit";
  const charsToShow = Math.min(
    commandText.length,
    Math.floor(Math.max(0, frame - 22) / 1)
  );
  const displayedCommand = commandText.slice(0, charsToShow);
  const isTyping = charsToShow < commandText.length;
  const cursorOpacity = isTyping && Math.floor(frame / 6) % 2 === 0 ? 1 : 0;

  // GitHub link animation
  const linkScale = spring({
    frame: Math.max(0, frame - 55),
    fps,
    config: { damping: 12, stiffness: 150 },
  });
  const linkOpacity = interpolate(frame, [55, 70], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Pulsing ring
  const ringScale = interpolate(frame, [0, 90], [0.5, 2], {
    extrapolateRight: "clamp",
  });
  const ringOpacity = interpolate(frame, [0, 30, 90], [0, 0.3, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0a0a1a",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Background gradient */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          background: "radial-gradient(ellipse at center, #1a1a3a 0%, #0a0a1a 70%)",
        }}
      />

      {/* Main glow */}
      <div
        style={{
          position: "absolute",
          width: 1200,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(59, 130, 246, 0.4) 0%, rgba(139, 92, 246, 0.2) 40%, transparent 70%)",
          opacity: glowOpacity,
          transform: `scale(${glowScale})`,
          filter: "blur(120px)",
        }}
      />

      {/* Pulsing ring */}
      <div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          border: "2px solid rgba(59, 130, 246, 0.5)",
          opacity: ringOpacity,
          transform: `scale(${ringScale})`,
        }}
      />

      {/* Firework particles */}
      {fireworks.map((particle, i) => (
        <div
          key={`fw-${i}`}
          style={{
            position: "absolute",
            left: particle.x,
            top: particle.y,
            width: 6,
            height: 6,
            borderRadius: "50%",
            backgroundColor: particle.color,
            opacity: particle.opacity,
            boxShadow: `0 0 10px ${particle.color}`,
          }}
        />
      ))}

      {/* Sparkles */}
      {sparkles.map((sparkle, i) => (
        <div
          key={`sparkle-${i}`}
          style={{
            position: "absolute",
            left: sparkle.x,
            top: sparkle.y,
            width: sparkle.size,
            height: sparkle.size,
            opacity: sparkle.opacity,
          }}
        >
          <div
            style={{
              position: "absolute",
              width: "100%",
              height: 1,
              backgroundColor: sparkle.color,
              top: "50%",
              transform: "translateY(-50%)",
              boxShadow: `0 0 ${sparkle.size}px ${sparkle.color}`,
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 1,
              height: "100%",
              backgroundColor: sparkle.color,
              left: "50%",
              transform: "translateX(-50%)",
              boxShadow: `0 0 ${sparkle.size}px ${sparkle.color}`,
            }}
          />
        </div>
      ))}

      {/* Rising particles */}
      {risingParticles.map((particle, i) => (
        <div
          key={`rise-${i}`}
          style={{
            position: "absolute",
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            borderRadius: "50%",
            backgroundColor: particle.color,
            opacity: particle.opacity,
            boxShadow: `0 0 ${particle.size * 3}px ${particle.color}`,
          }}
        />
      ))}

      {/* Get started text */}
      <div
        style={{
          textAlign: "center",
          opacity: titleOpacity,
          transform: `translateY(${(1 - titleY) * 50}px)`,
        }}
      >
        <p
          style={{
            fontSize: 52,
            color: "#ffffff",
            margin: 0,
            fontWeight: 700,
            letterSpacing: 2,
            textShadow: `0 0 ${40 * titleGlow}px rgba(59, 130, 246, 0.8)`,
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
          padding: "28px 56px",
          backgroundColor: "#0d1117",
          borderRadius: 20,
          border: "1px solid #30363d",
          boxShadow: "0 0 60px rgba(59, 130, 246, 0.2), 0 20px 60px rgba(0,0,0,0.5)",
          position: "relative",
        }}
      >
        {/* Glowing border */}
        <div
          style={{
            position: "absolute",
            inset: -1,
            borderRadius: 20,
            background: "linear-gradient(135deg, rgba(59, 130, 246, 0.4) 0%, transparent 50%, rgba(139, 92, 246, 0.3) 100%)",
            padding: 1,
            zIndex: -1,
          }}
        />
        <code
          style={{
            fontSize: 30,
            fontFamily: "SF Mono, Monaco, Consolas, monospace",
          }}
        >
          <span style={{ color: "#7ee787" }}>❯</span>
          <span style={{ color: "#e6edf3" }}> {displayedCommand}</span>
          {isTyping && (
            <span style={{ opacity: cursorOpacity, color: "#3b82f6" }}>▋</span>
          )}
        </code>
      </div>

      {/* GitHub link */}
      <div
        style={{
          position: "absolute",
          bottom: 150,
          display: "flex",
          alignItems: "center",
          gap: 16,
          opacity: linkOpacity,
          transform: `scale(${linkScale})`,
          padding: "14px 28px",
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          borderRadius: 35,
          border: "1px solid rgba(255, 255, 255, 0.15)",
          boxShadow: "0 0 30px rgba(59, 130, 246, 0.15)",
        }}
      >
        <svg width="36" height="36" viewBox="0 0 24 24" fill="#ffffff">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
        <span style={{ fontSize: 22, color: "#e6edf3", fontWeight: 500 }}>
          github.com/Michael0520/milo-claudekit
        </span>
        <span style={{ fontSize: 24, color: "#3b82f6" }}>→</span>
      </div>

      {/* Star badge with animation */}
      <div
        style={{
          position: "absolute",
          bottom: 85,
          opacity: linkOpacity,
          transform: `scale(${linkScale})`,
        }}
      >
        <span
          style={{
            fontSize: 18,
            color: "#fbbf24",
            textShadow: "0 0 20px rgba(251, 191, 36, 0.5)",
          }}
        >
          ⭐ Star us on GitHub
        </span>
      </div>
    </AbsoluteFill>
  );
};
