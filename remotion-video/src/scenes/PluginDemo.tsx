import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  spring,
  useVideoConfig,
} from "remotion";
import { Highlight } from "../components/Highlight";
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

  // Plugin name animation
  const nameScale = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 200 },
  });

  const nameOpacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Content slide in
  const contentX = interpolate(frame, [10, 30], [100, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const contentOpacity = interpolate(frame, [10, 25], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Annotation pop in
  const annotationScale = spring({
    frame: Math.max(0, frame - 60),
    fps,
    config: { damping: 10, stiffness: 150 },
  });

  // Get terminal content for this plugin
  const terminalLines = pluginTerminalContent[pluginName] || [];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0f172a",
        fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* Left side - Plugin info */}
      <div
        style={{
          position: "absolute",
          left: 80,
          top: "50%",
          transform: "translateY(-50%)",
          width: 400,
        }}
      >
        {/* Plugin icon and name */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            opacity: nameOpacity,
            transform: `scale(${nameScale})`,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              backgroundColor: accentColor,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: 32,
            }}
          >
            {icon}
          </div>
          <h2
            style={{
              fontSize: 48,
              fontWeight: 600,
              color: "#ffffff",
              margin: 0,
            }}
          >
            {pluginName}
          </h2>
        </div>

        {/* Annotation badge */}
        <div
          style={{
            marginTop: 40,
            transform: `scale(${annotationScale})`,
          }}
        >
          <Highlight
            text={annotation}
            backgroundColor={`${accentColor}33`}
            style={{
              fontSize: 24,
              fontWeight: 500,
              color: "#ffffff",
            }}
          />
        </div>
      </div>

      {/* Right side - Terminal demo */}
      <div
        style={{
          position: "absolute",
          right: 80,
          top: "50%",
          transform: `translateY(-50%) translateX(${contentX}px)`,
          opacity: contentOpacity,
          width: 1000,
          height: 600,
          borderRadius: 16,
          border: `2px solid ${accentColor}44`,
          overflow: "hidden",
        }}
      >
        <Terminal
          lines={terminalLines}
          title={`${pluginName} — Claude Code`}
          typingSpeed={1.5}
          startFrame={20}
        />
      </div>
    </AbsoluteFill>
  );
};
