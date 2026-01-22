import { AbsoluteFill, Sequence } from "remotion";
import { Opening } from "./scenes/Opening";
import { PluginDemo } from "./scenes/PluginDemo";
import { Ending } from "./scenes/Ending";

// Timeline configuration (30 fps)
// 0-90: Opening (3s)
// 90-240: git (5s)
// 240-390: rubric (5s)
// 390-540: superpowers (5s)
// 540-690: worktree-manager (5s)
// 690-810: chrome-devtools (4s)
// 810-900: Ending (3s)

const PLUGINS = [
  {
    name: "git",
    annotation: "10 files / 500 lines limit",
    icon: "󰊢",
    accentColor: "#f97316",
    startFrame: 90,
    duration: 150,
  },
  {
    name: "rubric",
    annotation: "Auto code review ✓",
    icon: "󰄬",
    accentColor: "#22c55e",
    startFrame: 240,
    duration: 150,
  },
  {
    name: "superpowers",
    annotation: "Built-in workflows",
    icon: "⚡",
    accentColor: "#a855f7",
    startFrame: 390,
    duration: 150,
  },
  {
    name: "worktree",
    annotation: "Parallel development",
    icon: "󰘬",
    accentColor: "#06b6d4",
    startFrame: 540,
    duration: 150,
  },
  {
    name: "chrome-devtools",
    annotation: "Browser automation",
    icon: "󰖟",
    accentColor: "#eab308",
    startFrame: 690,
    duration: 120,
  },
];

export const ClaudekitIntro: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0f172a" }}>
      {/* Opening sequence */}
      <Sequence from={0} durationInFrames={90}>
        <Opening />
      </Sequence>

      {/* Plugin demos */}
      {PLUGINS.map((plugin) => (
        <Sequence
          key={plugin.name}
          from={plugin.startFrame}
          durationInFrames={plugin.duration}
        >
          <PluginDemo
            pluginName={plugin.name}
            annotation={plugin.annotation}
            icon={plugin.icon}
            accentColor={plugin.accentColor}
          />
        </Sequence>
      ))}

      {/* Ending sequence */}
      <Sequence from={810} durationInFrames={90}>
        <Ending />
      </Sequence>
    </AbsoluteFill>
  );
};
