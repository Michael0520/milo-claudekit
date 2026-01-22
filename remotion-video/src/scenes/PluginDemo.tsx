import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  spring,
  useVideoConfig,
} from "remotion";
import { Terminal } from "../components/Terminal";
import { pluginTerminalContent } from "../data/terminalContent";

interface PluginDemoProps {
  pluginName: string;
  annotation: string;
  icon: string;
  accentColor?: string;
}

export const PluginDemo: React.FC<PluginDemoProps> = ({
  pluginName,
  annotation,
  icon,
  accentColor = "#3b82f6",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scene transition - slide in from right
  const sceneX = interpolate(frame, [0, 15], [100, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const sceneOpacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Plugin name animation
  const nameScale = spring({
    frame: Math.max(0, frame - 5),
    fps,
    config: { damping: 12, stiffness: 180 },
  });

  const nameOpacity = interpolate(frame, [5, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Content slide in
  const contentX = interpolate(frame, [10, 30], [80, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const contentOpacity = interpolate(frame, [10, 25], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Annotation pop in with glow
  const annotationScale = spring({
    frame: Math.max(0, frame - 50),
    fps,
    config: { damping: 10, stiffness: 150 },
  });

  // Scan line effect
  const scanLineY = (frame * 4) % 700;

  // Background particles
  const particles = Array.from({ length: 20 }, (_, i) => {
    const seed = i * 123.7;
    const x = ((seed * 13) % 1920);
    const y = ((seed * 17) % 1080);
    const size = 2 + (i % 3);
    const baseOpacity = 0.1 + (i % 3) * 0.1;
    const twinkle = Math.sin(frame / 10 + i * 2) * 0.5 + 0.5;
    const opacity = baseOpacity * twinkle;
    return { x, y, size, opacity };
  });

  // Grid lines
  const gridOpacity = 0.03;

  // Floating orbs
  const orbs = Array.from({ length: 3 }, (_, i) => {
    const baseX = 1400 + i * 150;
    const baseY = 300 + i * 200;
    const x = baseX + Math.sin(frame / 25 + i * 2) * 30;
    const y = baseY + Math.cos(frame / 30 + i * 2) * 20;
    const size = 100 + i * 50;
    const opacity = 0.1 + (i * 0.05);
    return { x, y, size, opacity };
  });

  // Get terminal content
  const terminalLines = pluginTerminalContent[pluginName] || [];

  // Icon glow pulse
  const iconGlow = interpolate(
    Math.sin(frame / 10),
    [-1, 1],
    [0.3, 0.8]
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0a0a1a",
        fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif",
        overflow: "hidden",
        opacity: sceneOpacity,
        transform: `translateX(${sceneX}px)`,
      }}
    >
      {/* Background gradient */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          background: `radial-gradient(ellipse at 30% 50%, ${accentColor}15 0%, transparent 50%), radial-gradient(ellipse at 70% 50%, ${accentColor}10 0%, transparent 60%)`,
        }}
      />

      {/* Grid pattern */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          backgroundImage: `
            linear-gradient(rgba(255,255,255,${gridOpacity}) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,${gridOpacity}) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Floating orbs */}
      {orbs.map((orb, i) => (
        <div
          key={`orb-${i}`}
          style={{
            position: "absolute",
            left: orb.x,
            top: orb.y,
            width: orb.size,
            height: orb.size,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${accentColor}40 0%, transparent 70%)`,
            opacity: orb.opacity,
            filter: "blur(40px)",
          }}
        />
      ))}

      {/* Background particles */}
      {particles.map((particle, i) => (
        <div
          key={`particle-${i}`}
          style={{
            position: "absolute",
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            borderRadius: "50%",
            backgroundColor: accentColor,
            opacity: particle.opacity,
            boxShadow: `0 0 ${particle.size * 3}px ${accentColor}`,
          }}
        />
      ))}

      {/* Left side - Plugin info */}
      <div
        style={{
          position: "absolute",
          left: 100,
          top: "50%",
          transform: "translateY(-50%)",
          width: 450,
        }}
      >
        {/* Plugin icon and name */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            opacity: nameOpacity,
            transform: `scale(${nameScale})`,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              backgroundColor: accentColor,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: 40,
              boxShadow: `0 0 ${40 * iconGlow}px ${accentColor}, 0 8px 32px rgba(0,0,0,0.4)`,
              border: `2px solid ${accentColor}80`,
            }}
          >
            {icon}
          </div>
          <h2
            style={{
              fontSize: 56,
              fontWeight: 700,
              color: "#ffffff",
              margin: 0,
              textShadow: `0 0 40px ${accentColor}60`,
            }}
          >
            {pluginName}
          </h2>
        </div>

        {/* Annotation badge */}
        <div
          style={{
            marginTop: 50,
            transform: `scale(${annotationScale})`,
          }}
        >
          <div
            style={{
              display: "inline-block",
              padding: "12px 28px",
              backgroundColor: `${accentColor}20`,
              borderRadius: 30,
              border: `1px solid ${accentColor}50`,
              boxShadow: `0 0 30px ${accentColor}30`,
            }}
          >
            <span
              style={{
                fontSize: 26,
                fontWeight: 600,
                color: "#ffffff",
              }}
            >
              {annotation}
            </span>
          </div>
        </div>
      </div>

      {/* Right side - Terminal */}
      <div
        style={{
          position: "absolute",
          right: 80,
          top: "50%",
          transform: `translateY(-50%) translateX(${contentX}px)`,
          opacity: contentOpacity,
          width: 1000,
          height: 620,
          borderRadius: 20,
          border: `1px solid ${accentColor}40`,
          overflow: "hidden",
          boxShadow: `0 0 60px ${accentColor}20, 0 20px 60px rgba(0,0,0,0.5)`,
        }}
      >
        {/* Terminal glow border */}
        <div
          style={{
            position: "absolute",
            inset: -1,
            borderRadius: 20,
            background: `linear-gradient(135deg, ${accentColor}40 0%, transparent 50%, ${accentColor}20 100%)`,
            padding: 1,
            zIndex: -1,
          }}
        />

        <Terminal
          lines={terminalLines}
          title={`${pluginName} — Claude Code`}
          typingSpeed={1.2}
          startFrame={20}
        />

        {/* Scan line effect */}
        <div
          style={{
            position: "absolute",
            top: scanLineY,
            left: 0,
            right: 0,
            height: 2,
            background: `linear-gradient(90deg, transparent 0%, ${accentColor}30 50%, transparent 100%)`,
            pointerEvents: "none",
          }}
        />

        {/* Corner accents */}
        <div
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            width: 20,
            height: 20,
            borderTop: `2px solid ${accentColor}60`,
            borderRight: `2px solid ${accentColor}60`,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 10,
            left: 10,
            width: 20,
            height: 20,
            borderBottom: `2px solid ${accentColor}60`,
            borderLeft: `2px solid ${accentColor}60`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
