import { AbsoluteFill, interpolate, useCurrentFrame, spring, useVideoConfig } from "remotion";

export const Opening: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Logo animation - letter by letter
  const logoText = "ClaudeKit";
  const letterAnimations = logoText.split("").map((_, i) => {
    const delay = i * 3;
    const scale = spring({
      frame: Math.max(0, frame - delay),
      fps,
      config: { damping: 8, stiffness: 150, mass: 0.8 },
    });
    const opacity = interpolate(frame, [delay, delay + 10], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const y = interpolate(frame, [delay, delay + 15], [-50, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    return { scale, opacity, y };
  });

  // Pulse waves
  const pulseWaves = Array.from({ length: 3 }, (_, i) => {
    const delay = 20 + i * 15;
    const progress = Math.max(0, frame - delay) / 40;
    const scale = interpolate(progress, [0, 1], [0, 3], { extrapolateRight: "clamp" });
    const opacity = interpolate(progress, [0, 0.3, 1], [0, 0.6, 0], { extrapolateRight: "clamp" });
    return { scale, opacity };
  });

  // Light rays
  const rays = Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * 360;
    const length = interpolate(frame, [10, 40], [0, 800], { extrapolateRight: "clamp" });
    const opacity = interpolate(frame, [10, 25, 60, 90], [0, 0.4, 0.3, 0], {
      extrapolateRight: "clamp",
    });
    const rotation = angle + frame * 0.3;
    return { rotation, length, opacity };
  });

  // Floating particles - more and varied
  const particles = Array.from({ length: 30 }, (_, i) => {
    const seed = i * 137.5;
    const angle = (seed % 360) * (Math.PI / 180);
    const baseRadius = 200 + (seed % 300);
    const radius = baseRadius + Math.sin(frame / 15 + i) * 40;
    const x = Math.cos(angle + frame / (40 + (i % 20))) * radius;
    const y = Math.sin(angle + frame / (40 + (i % 20))) * radius * 0.6;
    const size = 2 + (i % 4);
    const opacity = interpolate(frame, [5 + (i % 20), 25 + (i % 20)], [0, 0.3 + (i % 3) * 0.2], {
      extrapolateRight: "clamp",
    });
    const color = i % 3 === 0 ? "#3b82f6" : i % 3 === 1 ? "#8b5cf6" : "#ec4899";
    return { x, y, size, opacity, color };
  });

  // Sparkles
  const sparkles = Array.from({ length: 15 }, (_, i) => {
    const seed = i * 97.3;
    const x = ((seed * 7) % 1600) - 800;
    const y = ((seed * 11) % 800) - 400;
    const twinkle = Math.sin(frame / 5 + i * 2) * 0.5 + 0.5;
    const size = 3 + (i % 3);
    const opacity = interpolate(frame, [15 + (i % 10) * 2, 30 + (i % 10) * 2], [0, twinkle * 0.8], {
      extrapolateRight: "clamp",
    });
    return { x, y, size, opacity };
  });

  // Background glow
  const glowOpacity = interpolate(frame, [0, 20, 45, 90], [0, 0.9, 0.7, 0.5], {
    extrapolateRight: "clamp",
  });
  const glowScale = interpolate(frame, [0, 30], [0.3, 1.2], { extrapolateRight: "clamp" });

  // Tagline
  const taglineY = spring({
    frame: Math.max(0, frame - 35),
    fps,
    config: { damping: 12, stiffness: 100 },
  });
  const taglineOpacity = interpolate(frame, [35, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Badge animation
  const badges = ["9 Plugins", "Hooks", "Commands", "Skills"];
  const badgeAnimations = badges.map((_, i) => {
    const delay = 55 + i * 5;
    const scale = spring({
      frame: Math.max(0, frame - delay),
      fps,
      config: { damping: 10, stiffness: 150 },
    });
    const opacity = interpolate(frame, [delay, delay + 10], [0, 1], {
      extrapolateRight: "clamp",
    });
    return { scale, opacity };
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
      {/* Deep background gradient */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          background: "radial-gradient(ellipse at center, #1a1a3a 0%, #0a0a1a 70%)",
        }}
      />

      {/* Light rays */}
      {rays.map((ray, i) => (
        <div
          key={`ray-${i}`}
          style={{
            position: "absolute",
            width: ray.length,
            height: 2,
            background: `linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, ${ray.opacity}) 50%, transparent 100%)`,
            transform: `rotate(${ray.rotation}deg)`,
            transformOrigin: "left center",
          }}
        />
      ))}

      {/* Pulse waves */}
      {pulseWaves.map((wave, i) => (
        <div
          key={`wave-${i}`}
          style={{
            position: "absolute",
            width: 300,
            height: 300,
            borderRadius: "50%",
            border: "2px solid rgba(59, 130, 246, 0.5)",
            opacity: wave.opacity,
            transform: `scale(${wave.scale})`,
          }}
        />
      ))}

      {/* Main glow */}
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(59, 130, 246, 0.6) 0%, rgba(139, 92, 246, 0.3) 40%, rgba(236, 72, 153, 0.1) 70%, transparent 100%)",
          opacity: glowOpacity,
          transform: `scale(${glowScale})`,
          filter: "blur(100px)",
        }}
      />

      {/* Secondary moving glows */}
      <div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(236, 72, 153, 0.5) 0%, transparent 70%)",
          opacity: glowOpacity * 0.6,
          transform: `translate(${Math.sin(frame / 30) * 100 + 250}px, ${Math.cos(frame / 25) * 80 - 150}px)`,
          filter: "blur(80px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 350,
          height: 350,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(34, 211, 238, 0.4) 0%, transparent 70%)",
          opacity: glowOpacity * 0.5,
          transform: `translate(${Math.cos(frame / 35) * 120 - 300}px, ${Math.sin(frame / 30) * 100 + 100}px)`,
          filter: "blur(70px)",
        }}
      />

      {/* Floating particles */}
      {particles.map((particle, i) => (
        <div
          key={`particle-${i}`}
          style={{
            position: "absolute",
            width: particle.size,
            height: particle.size,
            borderRadius: "50%",
            backgroundColor: particle.color,
            opacity: particle.opacity,
            transform: `translate(${particle.x}px, ${particle.y}px)`,
            boxShadow: `0 0 ${particle.size * 4}px ${particle.color}`,
          }}
        />
      ))}

      {/* Sparkles */}
      {sparkles.map((sparkle, i) => (
        <div
          key={`sparkle-${i}`}
          style={{
            position: "absolute",
            width: sparkle.size,
            height: sparkle.size,
            opacity: sparkle.opacity,
            transform: `translate(${sparkle.x}px, ${sparkle.y}px)`,
          }}
        >
          <div
            style={{
              position: "absolute",
              width: "100%",
              height: 1,
              backgroundColor: "#ffffff",
              top: "50%",
              transform: "translateY(-50%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 1,
              height: "100%",
              backgroundColor: "#ffffff",
              left: "50%",
              transform: "translateX(-50%)",
            }}
          />
        </div>
      ))}

      {/* Logo - letter by letter animation */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {logoText.split("").map((letter, i) => (
          <span
            key={i}
            style={{
              fontSize: 150,
              fontWeight: 800,
              color: i >= 6 ? "#3b82f6" : "#ffffff",
              opacity: letterAnimations[i].opacity,
              transform: `scale(${letterAnimations[i].scale}) translateY(${letterAnimations[i].y}px)`,
              display: "inline-block",
              textShadow: `0 0 80px ${i >= 6 ? "rgba(59, 130, 246, 0.8)" : "rgba(255, 255, 255, 0.5)"}`,
              letterSpacing: -4,
            }}
          >
            {letter}
          </span>
        ))}
      </div>

      {/* Tagline */}
      <div
        style={{
          position: "absolute",
          bottom: 280,
          opacity: taglineOpacity,
          transform: `translateY(${(1 - taglineY) * 40}px)`,
        }}
      >
        <p
          style={{
            fontSize: 40,
            color: "#e2e8f0",
            margin: 0,
            fontWeight: 500,
            letterSpacing: 2,
            textShadow: "0 0 30px rgba(59, 130, 246, 0.5)",
          }}
        >
          Supercharge your Claude Code
        </p>
      </div>

      {/* Badges */}
      <div
        style={{
          position: "absolute",
          bottom: 190,
          display: "flex",
          gap: 20,
        }}
      >
        {badges.map((text, i) => (
          <div
            key={text}
            style={{
              padding: "10px 24px",
              backgroundColor: "rgba(59, 130, 246, 0.15)",
              borderRadius: 25,
              border: "1px solid rgba(59, 130, 246, 0.4)",
              boxShadow: "0 0 20px rgba(59, 130, 246, 0.2)",
              opacity: badgeAnimations[i].opacity,
              transform: `scale(${badgeAnimations[i].scale})`,
            }}
          >
            <span
              style={{
                fontSize: 18,
                color: "#60a5fa",
                fontWeight: 600,
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
