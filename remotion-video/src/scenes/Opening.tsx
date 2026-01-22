import { AbsoluteFill, interpolate, useCurrentFrame, spring, useVideoConfig } from "remotion";

export const Opening: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Logo scale with bounce
  const logoScale = spring({
    frame,
    fps,
    config: {
      damping: 10,
      stiffness: 80,
      mass: 1.2,
    },
  });

  // Logo opacity
  const logoOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Tagline animation
  const taglineY = spring({
    frame: Math.max(0, frame - 25),
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  const taglineOpacity = interpolate(frame, [25, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Glow pulse animation
  const glowScale = interpolate(
    frame,
    [0, 45, 90],
    [0.5, 1.2, 1],
    { extrapolateRight: "clamp" }
  );

  const glowOpacity = interpolate(
    frame,
    [0, 20, 45, 90],
    [0, 0.8, 0.6, 0.4],
    { extrapolateRight: "clamp" }
  );

  // Floating particles
  const particles = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * Math.PI * 2;
    const radius = 300 + Math.sin(frame / 20 + i) * 50;
    const x = Math.cos(angle + frame / 60) * radius;
    const y = Math.sin(angle + frame / 60) * radius;
    const size = 4 + Math.sin(frame / 15 + i * 2) * 2;
    const opacity = interpolate(frame, [10 + i * 3, 30 + i * 3], [0, 0.6], {
      extrapolateRight: "clamp",
    });

    return { x, y, size, opacity };
  });

  // Plugin count animation
  const countOpacity = interpolate(frame, [50, 65], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const countY = spring({
    frame: Math.max(0, frame - 50),
    fps,
    config: { damping: 12, stiffness: 100 },
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
      {/* Background glow effect */}
      <div
        style={{
          position: "absolute",
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(59, 130, 246, 0.5) 0%, rgba(139, 92, 246, 0.2) 50%, transparent 70%)",
          opacity: glowOpacity,
          transform: `scale(${glowScale})`,
          filter: "blur(80px)",
        }}
      />

      {/* Secondary glow */}
      <div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(236, 72, 153, 0.3) 0%, transparent 70%)",
          opacity: glowOpacity * 0.5,
          transform: `scale(${glowScale * 0.8}) translateX(200px) translateY(-100px)`,
          filter: "blur(60px)",
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
            backgroundColor: i % 2 === 0 ? "#3b82f6" : "#8b5cf6",
            opacity: particle.opacity,
            transform: `translate(${particle.x}px, ${particle.y}px)`,
            boxShadow: `0 0 ${particle.size * 2}px ${i % 2 === 0 ? "#3b82f6" : "#8b5cf6"}`,
          }}
        />
      ))}

      {/* Logo */}
      <div
        style={{
          transform: `scale(${logoScale})`,
          opacity: logoOpacity,
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: 140,
            fontWeight: 800,
            color: "#ffffff",
            margin: 0,
            letterSpacing: -4,
            textShadow: "0 0 60px rgba(59, 130, 246, 0.5)",
          }}
        >
          Claude<span style={{ color: "#3b82f6" }}>Kit</span>
        </h1>
      </div>

      {/* Tagline */}
      <div
        style={{
          position: "absolute",
          bottom: 280,
          opacity: taglineOpacity,
          transform: `translateY(${(1 - taglineY) * 30}px)`,
        }}
      >
        <p
          style={{
            fontSize: 38,
            color: "#94a3b8",
            margin: 0,
            fontWeight: 500,
            letterSpacing: 1,
          }}
        >
          Supercharge your Claude Code
        </p>
      </div>

      {/* Plugin count badge */}
      <div
        style={{
          position: "absolute",
          bottom: 200,
          opacity: countOpacity,
          transform: `translateY(${(1 - countY) * 20}px)`,
          display: "flex",
          gap: 24,
        }}
      >
        {["9 Plugins", "Hooks", "Commands", "Skills"].map((text, i) => (
          <div
            key={text}
            style={{
              padding: "8px 20px",
              backgroundColor: "rgba(59, 130, 246, 0.15)",
              borderRadius: 20,
              border: "1px solid rgba(59, 130, 246, 0.3)",
            }}
          >
            <span
              style={{
                fontSize: 18,
                color: "#60a5fa",
                fontWeight: 500,
              }}
            >
              {text}
            </span>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
