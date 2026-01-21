# Agent Skills Specification vs ClaudeKit Plugin Architecture

## Overview

This document compares the **Agent Skills Open Standard** (agentskills.io) with the **ClaudeKit Plugin Architecture**, helping understand the design principles and implementation differences between the two approaches.

---

## 1. What is Agent Skills?

### Definition

Agent Skills are folders containing **instructions, scripts, and resources** that enable agents to complete tasks more accurately and efficiently.

### Problems Solved

- Agents are becoming more powerful but lack the **context** needed to complete real work
- Skills provide:
  - **Procedural knowledge** and team/company-specific context
  - **On-demand loaded extended capabilities**
  - **Portable, version-controlled organizational knowledge packages**

### Three Target Audiences

| Audience | Value |
|----------|-------|
| Skill Authors | Build once, deploy across multiple agent products |
| Compatible Agents | Enable users to give agents new capabilities out-of-box |
| Teams/Enterprises | Package organizational knowledge into portable bundles |

---

## 2. Skill Structure

### Basic Directory Structure

```
my-skill/
├── SKILL.md          # Required: instructions + metadata
├── scripts/          # Optional: executable code
├── references/       # Optional: documentation
└── assets/           # Optional: templates, resources
```

### SKILL.md File Format

```markdown
---
name: pdf-processing
description: Extract text and tables from PDF files, fill forms, merge documents.
---

# PDF Processing

## When to use this skill
Use this skill when the user needs to work with PDF files...

## How to extract text
1. Use pdfplumber for text extraction...
```

---

## 3. Specification Details

### Required Fields

| Field | Constraints |
|-------|-------------|
| `name` | Max 64 characters. Only lowercase letters, numbers, hyphens. Cannot start/end with hyphen, no consecutive hyphens. Must match parent directory name |
| `description` | Max 1024 characters. Should describe what the skill does and when to use it |

### Optional Fields

| Field | Description |
|-------|-------------|
| `license` | License name or reference |
| `compatibility` | Max 500 characters. Environment requirements (system packages, network access, etc.) |
| `metadata` | Arbitrary key-value string pairs |
| `allowed-tools` | Space-separated list of pre-approved tools (experimental) |

### Complete Example

```yaml
---
name: pdf-processing
description: Extract text and tables from PDF files, fill forms, merge documents.
license: Apache-2.0
compatibility: Requires git, docker, jq, and access to the internet
metadata:
  author: example-org
  version: "1.0"
allowed-tools: Bash(git:*) Bash(jq:*) Read
---
```

### Name Validation Rules

```yaml
# Valid
name: pdf-processing
name: data-analysis
name: code-review

# Invalid
name: PDF-Processing  # No uppercase
name: -pdf            # Cannot start with hyphen
name: pdf--processing # No consecutive hyphens
```

---

## 4. Operating Mechanism: Progressive Disclosure

Skills use progressive disclosure to effectively manage context:

```
┌─────────────────────────────────────────────────────────┐
│  1. Discovery                                           │
│     Load only name and description at startup           │
│     (~100 tokens per skill)                             │
├─────────────────────────────────────────────────────────┤
│  2. Activation                                          │
│     When task matches skill description, read full      │
│     SKILL.md instructions (<5000 tokens recommended)    │
├─────────────────────────────────────────────────────────┤
│  3. Execution                                           │
│     Load files from scripts/, references/, assets/      │
│     on-demand                                           │
└─────────────────────────────────────────────────────────┘
```

**Recommendations**:
- Keep main SKILL.md under 500 lines
- Move detailed references to separate files
- Keep file references one level deep, avoid deep nesting

---

## 5. Integrating Skills into Agents

### Integration Methods

#### 1. File System-Based Agents

- Operate in computer environments (bash/unix)
- Most powerful option
- Activate via shell commands: `cat /path/to/my-skill/SKILL.md`

#### 2. Tool-Based Agents

- Don't require dedicated computer environments
- Implement tools to let models trigger skills and access resources

### Integration Steps

1. **Discover**: Scan configured directories for skills
2. **Load metadata**: Parse only frontmatter at startup
3. **Match**: Match user tasks to relevant skills
4. **Activate**: Load full instructions
5. **Execute**: Run scripts, access resources

### Injection into System Prompt (Claude Format)

```xml
<available_skills>
  <skill>
    <name>pdf-processing</name>
    <description>Extracts text and tables from PDF files...</description>
    <location>/path/to/skills/pdf-processing/SKILL.md</location>
  </skill>
</available_skills>
```

### Security Considerations

- **Sandboxing**: Execute scripts in isolated environments
- **Allowlisting**: Only execute scripts from trusted skills
- **Confirmation**: Ask user before executing dangerous operations
- **Logging**: Log all script executions for auditing

---

## 6. Validation Tools

Use the `skills-ref` reference library:

```bash
# Validate skill directory
skills-ref validate ./my-skill

# Generate <available_skills> XML
skills-ref to-prompt <path>...
```

---

## 7. Key Advantages

| Advantage | Description |
|-----------|-------------|
| **Self-documenting** | Easy to read, audit, and improve |
| **Extensible** | Can extend from plain text instructions to executable code, assets, and templates |
| **Portable** | Just files - easy to edit, version control, and share |
| **Interoperable** | Same skill can be reused across different agent products |

---

## 8. Resource Links

- **GitHub Repository**: https://github.com/agentskills/agentskills
- **Example Skills**: https://github.com/anthropics/skills
- **Reference Library**: https://github.com/agentskills/agentskills/tree/main/skills-ref
- **Best Practices**: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

---

# Part 2: ClaudeKit vs Agent Skills Comparison

## 1. Overall Architecture Comparison

| Aspect | Agent Skills (Open Standard) | ClaudeKit Plugin Architecture |
|--------|------------------------------|-------------------------------|
| **Positioning** | Single skill format standard | Complete plugin ecosystem |
| **Core Unit** | Skill (one directory) | Plugin (can contain multiple skills/commands/hooks) |
| **Manifest** | No separate manifest, metadata in SKILL.md | `.claude-plugin/plugin.json` |
| **Discovery Mechanism** | Scan SKILL.md files | Scan plugin.json + skills/ + commands/ |
| **Distribution** | File copying | Git repository + Marketplace |

## 2. Directory Structure Comparison

### Agent Skills Standard

```
skill-name/
└── SKILL.md              # Required: single entry point
├── scripts/              # Optional
├── references/           # Optional
└── assets/               # Optional
```

### ClaudeKit Plugin

```
plugin-name/
├── .claude-plugin/
│   └── plugin.json       # Required: plugin manifest
├── skills/               # Optional: can contain multiple skills
│   ├── skill-a/
│   │   └── SKILL.md
│   └── skill-b/
│       └── SKILL.md
├── commands/             # Optional: procedural instructions
│   └── command.md
├── hooks/                # Optional: event interception
│   └── hooks.json
├── src/                  # Optional: TypeScript source
└── dist/                 # Optional: compiled output (tracked in git)
```

**Key Differences**:

- Agent Skills has a **flat structure**, one directory = one skill
- ClaudeKit has a **hierarchical structure**, one plugin can contain multiple skills, commands, hooks

## 3. SKILL.md Frontmatter Comparison

### Agent Skills Standard Fields

| Field | Required | Constraints |
|-------|----------|-------------|
| `name` | Yes | Max 64 chars, lowercase + numbers + hyphens, must match directory name |
| `description` | Yes | Max 1024 chars |
| `license` | No | License information |
| `compatibility` | No | Max 500 chars, environment requirements |
| `metadata` | No | Arbitrary key-value pairs |
| `allowed-tools` | No | Space-separated tool list (experimental) |

### ClaudeKit Actual Usage

```yaml
# Example: one-ui-migration/SKILL.md
---
name: one-ui-migration
description: Migrating Angular 16 to 20 with DDD architecture...
allowed-tools: Read, Bash, Edit, Write, Glob, Grep
---

# Example: chrome-devtools-mcp/SKILL.md
---
name: chrome-devtools-mcp
description: Testing UI and automating browsers via Chrome DevTools MCP...
allowed-tools: mcp__chrome-devtools__*
---
```

**ClaudeKit Features**:

- `allowed-tools` supports glob patterns (e.g., `mcp__chrome-devtools__*`)
- Does not use `license`, `compatibility`, `metadata` fields
- Actually only uses 3 fields: `name`, `description`, `allowed-tools`

## 4. Name Validation Rules Comparison

| Rule | Agent Skills Standard | ClaudeKit Actual |
|------|----------------------|------------------|
| Case | Lowercase only | Lowercase (compliant) |
| Characters | Letters + numbers + hyphens | Same |
| Hyphen rules | No start/end, no consecutive | Same |
| Match directory name | Required | Yes (compliant) |
| Max length | 64 characters | No explicit limit |

**Conclusion**: ClaudeKit fully complies with Agent Skills naming conventions.

## 5. Extension Mechanisms Comparison

### Agent Skills Extension

- `scripts/` - Executable scripts
- `references/` - Reference documentation
- `assets/` - Static resources

### ClaudeKit Extension

- `rules/` - Rule files (e.g., one-ui-migration has 17 rule files)
  - `rules/tools/` - Tool usage guides
  - `rules/guides/` - Implementation guides
  - `rules/reference/` - Reference materials
- `scripts/` - Scripts (e.g., worktree-manager)
- `templates/` - Template files

**ClaudeKit Unique**:

- **Rules subdirectory organization**: Categorizes rules into tools/guides/reference
- **Router/Index pattern**: SKILL.md acts as a router, pointing to multiple rule files

## 6. Plugin Manifest Comparison

### Agent Skills

**No separate manifest**, all metadata is in SKILL.md frontmatter.

### ClaudeKit plugin.json

```json
{
  "name": "one-ui-migration",
  "description": "Angular 16 to 20 migration with DDD architecture...",
  "version": "1.3.0",
  "author": { "name": "Michael0520" }
}
```

**ClaudeKit Unique Concepts**:

- Version number (semver)
- Author information
- Plugin-level metadata independent from skill

## 7. Progressive Disclosure Comparison

### Agent Skills Standard

```
Metadata (~100 tokens) → Instructions (<5000 tokens) → Resources (on-demand)
```

### ClaudeKit Actual

- **Skill layer**: `name` + `description` loaded at startup
- **Rules layer**: After SKILL.md loads, read `rules/*.md` on demand
- **Three-layer structure**: Plugin → Skill → Rules

**ClaudeKit goes one layer deeper**: rules/ directory provides additional progressive disclosure.

## 8. Unique Features Comparison

### Agent Skills Unique

| Feature | Description |
|---------|-------------|
| `license` field | Explicit license declaration |
| `compatibility` field | Environment requirements description |
| `metadata` field | Arbitrary extension data |
| `skills-ref` CLI | Official validation tool |

### ClaudeKit Unique

| Feature | Description |
|---------|-------------|
| **Commands** (`commands/*.md`) | Procedural instruction definitions |
| **Hooks** (`hooks/hooks.json`) | Event interception system |
| **Built Executables** (`dist/`) | TypeScript compiled output |
| **Marketplace** | Plugin distribution platform |
| **Configuration** (`claudekit.json`) | Project-level configuration |
| **Multi-skill per plugin** | Multiple skills in one plugin |

## 9. Compatibility Analysis

### Are ClaudeKit Skills Agent Skills Standard Compliant?

| Check Item | Result |
|------------|--------|
| SKILL.md exists | Compliant |
| `name` field | Compliant (correct format) |
| `description` field | Compliant |
| `allowed-tools` field | Partially compliant (glob patterns are extensions) |
| Directory structure | Different (uses `rules/` instead of `references/`) |
| Independent skill directory | Non-compliant (skills in `skills/` subdirectory) |

### Conclusion

ClaudeKit skills are **partially compatible** with Agent Skills standard:

- Frontmatter format is compatible
- Directory structure hierarchy differs
- Has additional plugin.json layer

## 10. Design Philosophy Differences

| Aspect | Agent Skills | ClaudeKit |
|--------|-------------|-----------|
| **Goal** | Cross-platform portability | Deep Claude Code integration |
| **Complexity** | Simple (single SKILL.md) | Complete (plugin ecosystem) |
| **Extension Method** | scripts/references/assets | commands/hooks/rules |
| **Validation** | `skills-ref` CLI | No official validation tool |
| **Distribution** | File copying | Git + Marketplace |

## 11. Recommended Alignment Strategy

If aligning ClaudeKit more closely with Agent Skills standard:

### Keep Current Approach (Recommended)

- ClaudeKit already uses compatible SKILL.md frontmatter
- Additional features (commands, hooks) are valuable extensions
- Marketplace provides better distribution experience

### Optional Improvements

1. **Add `license` field** to skill frontmatter
2. **Add `compatibility` field** to describe environment requirements
3. **Rename `rules/` to `references/`** to match standard
4. **Implement `skills-ref` validation** to ensure standard compatibility

## 12. Summary

```
┌─────────────────────────────────────────────────────────────┐
│                    Agent Skills Standard                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  SKILL.md Format                     │   │
│  │  - name, description (required)                     │   │
│  │  - license, compatibility, metadata (optional)      │   │
│  │  - allowed-tools (experimental)                     │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    ClaudeKit Extension
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    ClaudeKit Plugin                          │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │   Skills     │ │   Commands   │ │    Hooks     │        │
│  │  SKILL.md    │ │  command.md  │ │  hooks.json  │        │
│  │  + rules/    │ │              │ │  + src/*.ts  │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
│                                                             │
│  + plugin.json (version, author)                            │
│  + Marketplace distribution                                 │
│  + claudekit.json configuration                             │
└─────────────────────────────────────────────────────────────┘
```

**Conclusion**: ClaudeKit is a **superset** of the Agent Skills standard, maintaining SKILL.md format compatibility while adding commands, hooks, marketplace, and other Claude Code-specific features.
