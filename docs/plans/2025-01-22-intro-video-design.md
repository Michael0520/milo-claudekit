# ClaudeKit Intro Video Design

## Overview

A 30-second promotional video introducing ClaudeKit and its key plugins.

## Specifications

| Item | Value |
|------|-------|
| Duration | 30 seconds (900 frames) |
| Resolution | 1920x1080 (1080p) |
| FPS | 30 |
| Format | MP4 |
| Style | Screen recordings with dynamic annotations |

## Timeline

| Time | Content |
|------|---------|
| 0-3s | Opening: ClaudeKit logo + tagline |
| 3-8s | Plugin 1: git commit hook blocking oversized commit |
| 8-13s | Plugin 2: rubric auto code standards check |
| 13-18s | Plugin 3: superpowers TDD/debugging workflow |
| 18-23s | Plugin 4: worktree-manager parallel development |
| 23-27s | Plugin 5: chrome-devtools-mcp browser automation |
| 27-30s | Ending: install command + GitHub link |

## Scene Details

### Opening (0-3s)
- Dark background
- ClaudeKit text fades in
- Tagline: "Supercharge your Claude Code"
- Subtle particle/glow animation

### Plugin Demos (3-27s)

| Plugin | Screen Content | Annotation |
|--------|----------------|------------|
| git | Terminal showing commit blocked by hook | Highlight "10 files / 500 lines limit" |
| rubric | Claude Code running rubric check, showing pass/fail | "Auto code review ✓" |
| superpowers | TDD flow: red → green → refactor | "Built-in workflows" |
| worktree-manager | Terminal worktree list, multiple branches | "Parallel development" |
| chrome-devtools | Browser auto-clicking/screenshot | "Browser automation" |

### Ending (27-30s)
- Install command fades in: `/plugin marketplace add Michael0520/milo-claudekit`
- GitHub icon + link

## Project Structure

```
remotion-video/
├── src/
│   ├── Root.tsx              # Register composition
│   ├── ClaudekitIntro.tsx    # Main video component
│   ├── scenes/
│   │   ├── Opening.tsx       # Opening animation
│   │   ├── PluginDemo.tsx    # Reusable plugin showcase component
│   │   └── Ending.tsx        # Ending
│   └── components/
│       ├── Highlight.tsx     # Highlight annotation animation
│       └── TypeWriter.tsx    # Typewriter effect
└── public/
    └── recordings/           # Screen recording assets
```

## Required Assets

### Screen Recordings (5 clips, ~10-15s raw each)
1. git hook blocking commit - terminal
2. rubric check execution - Claude Code
3. superpowers TDD flow
4. worktree-manager operations - terminal
5. chrome-devtools-mcp browser automation

### Static Assets
- ClaudeKit logo (or text-generated)
- GitHub icon
