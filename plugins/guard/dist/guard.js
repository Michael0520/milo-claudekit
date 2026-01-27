#!/usr/bin/env node
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
function preToolUse(isPass = true, reason) {
	const output = { decision: isPass ? void 0 : BlockDecision };
	if (reason !== void 0) output.reason = reason;
	return JSON.stringify(output);
}

//#endregion
//#region src/guard.ts
const config = await loadConfig();
const guardConfig = config.guard;
if (!guardConfig?.enabled) {
	console.log(preToolUse(true));
	process.exit(0);
}
const hook = await loadHook();
const toolName = hook.toolName;
const toolInput = hook.toolInput;
const builtInGuards = guardConfig.builtIn ?? {};
const triggeredWarnings = [];
let blocked = false;
let blockReason = "";
if (builtInGuards.gitPushConfirm && toolName === "Bash") {
	const command = toolInput.command || "";
	if (command.includes("git push")) triggeredWarnings.push("⚠️ Git Push: You are about to push changes to remote. Please review your commits before proceeding.");
}
if (builtInGuards.tmuxReminder && toolName === "Bash") {
	const command = toolInput.command || "";
	const longRunningPatterns = [
		"npm install",
		"npm ci",
		"yarn install",
		"pnpm install",
		"bun install",
		"npm run build",
		"npm run test",
		"npm run dev",
		"npm start",
		"yarn build",
		"yarn test",
		"yarn dev",
		"pnpm build",
		"pnpm test",
		"bun run build",
		"bun run test",
		"docker build",
		"docker-compose up"
	];
	const isLongRunning = longRunningPatterns.some((p) => command.toLowerCase().includes(p.toLowerCase()));
	const inTmux = process.env.TMUX !== void 0;
	if (isLongRunning && !inTmux) triggeredWarnings.push("💡 Tmux Reminder: Consider running this long-running command in tmux for better log accessibility.");
}
if (builtInGuards.dangerousRm && toolName === "Bash") {
	const command = toolInput.command || "";
	const dangerousPatterns = [
		/rm\s+-rf\s+\/(?!\w)/,
		/rm\s+-rf\s+~\s*$/,
		/rm\s+-rf\s+\*\s*$/,
		/sudo\s+rm\s+-rf/,
		/rm\s+-rf\s+\.\.?\s*$/
	];
	const isDangerous = dangerousPatterns.some((p) => p.test(command));
	if (isDangerous) {
		blocked = true;
		blockReason = "🚫 BLOCKED: Dangerous rm command detected. This could delete critical files. Please use a safer approach.";
	}
}
const customRules = guardConfig.rules ?? [];
for (const rule of customRules) {
	const matches = matchRule(rule, toolName, toolInput);
	if (matches) if (rule.action === "block") {
		blocked = true;
		blockReason = rule.message;
		break;
	} else triggeredWarnings.push(rule.message);
}
if (blocked) console.log(preToolUse(false, blockReason));
else if (triggeredWarnings.length > 0) console.log(preToolUse(true, triggeredWarnings.join("\n\n")));
else console.log(preToolUse(true));
function matchRule(rule, toolName$1, toolInput$1) {
	const toolRegex = new RegExp(rule.toolPattern, "i");
	if (!toolRegex.test(toolName$1)) return false;
	if (rule.inputPattern) {
		const inputRegex = new RegExp(rule.inputPattern, "i");
		const inputStr = JSON.stringify(toolInput$1);
		if (!inputRegex.test(inputStr)) return false;
	}
	return true;
}

//#endregion