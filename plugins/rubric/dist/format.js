#!/usr/bin/env node
import { exec } from "child_process";
import fsAsync from "fs/promises";
import fs from "fs";

//#region ../../packages/config/src/index.ts
/**
* Paths to search for configuration files, in order of precedence.
*
* NOTE: claudekit is common name for the config file, we may expand to other names in the future.
*/
const CONFIG_SEARCH_PATHS = [
	"claudekit.config.json",
	"claudekit.json",
	".claude/claudekit.config.json",
	".claude/claudekit.json"
];
const LOCAL_CONFIG_SEARCH_PATHS = ["claudekit.local.json", ".claude/claudekit.local.json"];
function isConfigExists(path) {
	return fs.existsSync(path);
}
function deepMerge(target, source) {
	if (Array.isArray(target) && Array.isArray(source)) return source;
	else if (target !== null && typeof target === "object" && source !== null && typeof source === "object") {
		const merged = { ...target };
		for (const key of Object.keys(source)) if (key in target) merged[key] = deepMerge(target[key], source[key]);
		else merged[key] = source[key];
		return merged;
	}
	return source;
}
async function loadConfig() {
	const projectRoot = process.env.CLAUDE_PROJECT_DIR || process.cwd();
	const searchPaths = CONFIG_SEARCH_PATHS.map((p) => `${projectRoot}/${p}`);
	const configPath = searchPaths.find(isConfigExists);
	const localSearchPaths = LOCAL_CONFIG_SEARCH_PATHS.map((p) => `${projectRoot}/${p}`);
	const localConfigPath = localSearchPaths.find(isConfigExists);
	const projectConfig = {};
	if (configPath) try {
		const fileContent = await fsAsync.readFile(configPath, "utf-8");
		Object.assign(projectConfig, JSON.parse(fileContent));
	} catch (error) {
		throw new Error(`Failed to parse config file at ${configPath}: ${error}`);
	}
	const localConfig = {};
	if (localConfigPath) try {
		const fileContent = await fsAsync.readFile(localConfigPath, "utf-8");
		Object.assign(localConfig, JSON.parse(fileContent));
	} catch (error) {
		throw new Error(`Failed to parse local config file at ${localConfigPath}: ${error}`);
	}
	return deepMerge(projectConfig, localConfig);
}

//#endregion
//#region ../../packages/hook/src/input.ts
let HookEventName = /* @__PURE__ */ function(HookEventName$1) {
	HookEventName$1["Stop"] = "Stop";
	HookEventName$1["PreToolUse"] = "PreToolUse";
	HookEventName$1["PostToolUse"] = "PostToolUse";
	HookEventName$1["SessionStart"] = "SessionStart";
	return HookEventName$1;
}({});

//#endregion
//#region ../../packages/hook/src/output.ts
const BlockDecision = "block";

//#endregion
//#region ../../packages/hook/src/index.ts
/**
* Convert snake_case keys to camelCase keys in a deeply nested object or array.
*/
function deepSnakeToCamel(obj) {
	if (Array.isArray(obj)) return obj.map(deepSnakeToCamel);
	else if (obj !== null && typeof obj === "object") return Object.fromEntries(Object.entries(obj).map(([key, value]) => {
		const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
		return [camelKey, deepSnakeToCamel(value)];
	}));
	return obj;
}
/**
* Load and parse JSON input from a readable stream (default: stdin).
*
* @param source - The readable stream to read from. Defaults to process.stdin.
* @returns input - The parsed JSON object with camelCase keys.
*/
async function loadHook(source = process.stdin) {
	return new Promise((resolve, reject) => {
		let data = "";
		source.on("data", (chunk) => {
			data += chunk;
		});
		source.on("end", () => {
			try {
				const parsed = JSON.parse(data);
				const camelCased = deepSnakeToCamel(parsed);
				resolve(camelCased);
			} catch (error) {
				reject(new Error(`Unable to parse input as JSON: ${error}`));
			}
		});
		source.on("error", (error) => {
			reject(new Error(`Error reading input: ${error}`));
		});
	});
}
function postToolUse(isPass = true, reason = "", additionalContext) {
	const output = {
		decision: isPass ? void 0 : BlockDecision,
		reason
	};
	if (additionalContext) output.hookSpecificOutput = {
		hookEventName: HookEventName.PostToolUse,
		additionalContext
	};
	return JSON.stringify(output);
}

//#endregion
//#region src/format.ts
const SUPPORTED_TOOL_NAMES = ["Edit", "Write"];
const hook = await loadHook();
if (!SUPPORTED_TOOL_NAMES.includes(hook.toolName)) process.exit(0);
const config = await loadConfig();
const formatConfig = config.format;
if (!formatConfig?.enabled) {
	console.log(postToolUse(true));
	process.exit(0);
}
const filePath = hook.toolInput.filePath;
const issues = [];
const ext = filePath.split(".").pop()?.toLowerCase() || "";
const runPrettier = formatConfig.prettier ?? true;
const prettierExts = formatConfig.prettierExtensions ?? [
	"ts",
	"tsx",
	"js",
	"jsx",
	"json",
	"css",
	"scss",
	"html",
	"md"
];
if (runPrettier && prettierExts.includes(ext)) {
	const prettierResult = await runCommand(`npx prettier --check "${filePath}"`);
	if (!prettierResult.success) issues.push(`Prettier: File needs formatting. Run: npx prettier --write "${filePath}"`);
}
const runTsc = formatConfig.tsc ?? true;
const tscExts = formatConfig.tscExtensions ?? ["ts", "tsx"];
if (runTsc && tscExts.includes(ext)) {
	const tscResult = await runCommand(`npx tsc --noEmit "${filePath}" 2>&1`);
	if (!tscResult.success && tscResult.output) {
		const errorLines = tscResult.output.split("\n").filter((line) => line.includes("error TS")).slice(0, 3);
		if (errorLines.length > 0) issues.push(`TypeScript errors:\n${errorLines.join("\n")}`);
	}
}
if (issues.length === 0) console.log(postToolUse(true));
else {
	const message = `⚠️ Code quality issues detected:\n\n${issues.join("\n\n")}`;
	const enforce = formatConfig.enforce ?? false;
	if (enforce) console.log(postToolUse(false, message));
	else console.log(postToolUse(true, "Format check completed with warnings.", message));
}
function runCommand(command) {
	return new Promise((resolve) => {
		exec(command, { timeout: 3e4 }, (error, stdout, stderr) => {
			resolve({
				success: !error,
				output: stdout || stderr || ""
			});
		});
	});
}

//#endregion