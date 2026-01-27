#!/usr/bin/env node
import fs, { existsSync, mkdirSync, readdirSync, writeFileSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import fsAsync from "fs/promises";

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
function stop(isPass = true, reason) {
	return JSON.stringify({
		decision: isPass ? void 0 : BlockDecision,
		reason
	});
}

//#endregion
//#region src/learn.ts
const DEFAULT_OUTPUT_DIR = join(homedir(), ".claude", "learned");
const DEFAULT_MIN_SESSION_LENGTH = 10;
const config = await loadConfig();
const learningConfig = config.learning;
if (!learningConfig?.enabled) {
	console.log(stop(true));
	process.exit(0);
}
const hook = await loadHook();
if (hook.stopHookActive) {
	console.log(stop(true));
	process.exit(0);
}
const transcript = hook.transcript || [];
const sessionLength = transcript.length;
const minLength = learningConfig.minSessionLength ?? DEFAULT_MIN_SESSION_LENGTH;
if (sessionLength < minLength) {
	console.log(stop(true, `Session too short for learning extraction (${sessionLength}/${minLength} messages)`));
	process.exit(0);
}
const outputDir = learningConfig.outputDir ?? DEFAULT_OUTPUT_DIR;
if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });
const patterns = extractPatterns(transcript, learningConfig.categories);
if (patterns.length === 0) {
	console.log(stop(true, "No learnable patterns detected in this session"));
	process.exit(0);
}
const savedFiles = savePatterns(patterns, outputDir);
console.log(stop(true, `📚 Learned ${patterns.length} pattern(s) from this session:\n${savedFiles.map((f) => `  • ${f}`).join("\n")}`));
function extractPatterns(transcript$1, categories) {
	const patterns$1 = [];
	const defaultCategories = [
		"error-resolution",
		"framework-workaround",
		"debugging",
		"convention"
	];
	const activeCategories = categories ?? defaultCategories;
	if (activeCategories.includes("error-resolution")) {
		const errorPatterns = findErrorResolutions(transcript$1);
		patterns$1.push(...errorPatterns);
	}
	if (activeCategories.includes("framework-workaround")) {
		const workaroundPatterns = findWorkarounds(transcript$1);
		patterns$1.push(...workaroundPatterns);
	}
	if (activeCategories.includes("debugging")) {
		const debugPatterns = findDebuggingPatterns(transcript$1);
		patterns$1.push(...debugPatterns);
	}
	if (activeCategories.includes("convention")) {
		const conventionPatterns = findConventionPatterns(transcript$1);
		patterns$1.push(...conventionPatterns);
	}
	return patterns$1;
}
function findErrorResolutions(transcript$1) {
	const patterns$1 = [];
	for (let i = 0; i < transcript$1.length - 1; i++) {
		const msg = transcript$1[i];
		const nextMsg = transcript$1[i + 1];
		if (!msg || !nextMsg) continue;
		const errorIndicators = [
			"error:",
			"Error:",
			"ERROR",
			"failed",
			"Failed",
			"exception",
			"Exception"
		];
		const hasError = errorIndicators.some((ind) => msg.content?.includes(ind));
		const hasResolution = nextMsg.role === "assistant" && (nextMsg.content?.includes("fix") || nextMsg.content?.includes("solution") || nextMsg.content?.includes("resolve"));
		if (hasError && hasResolution) {
			const errorMatch = msg.content?.match(/(?:error|Error|ERROR)[:\s]+([^\n]+)/);
			const errorType = errorMatch?.[1]?.slice(0, 50) || "Unknown Error";
			patterns$1.push({
				category: "error-resolution",
				title: `Fix: ${errorType}`,
				content: nextMsg.content?.slice(0, 500) || "",
				context: msg.content?.slice(0, 200) || ""
			});
		}
	}
	return patterns$1.slice(0, 3);
}
function findWorkarounds(transcript$1) {
	const patterns$1 = [];
	const workaroundKeywords = [
		"workaround",
		"instead of",
		"alternative",
		"hack",
		"trick"
	];
	for (const msg of transcript$1) {
		if (msg.role !== "assistant" || !msg.content) continue;
		const hasWorkaround = workaroundKeywords.some((kw) => msg.content.toLowerCase().includes(kw));
		if (hasWorkaround) patterns$1.push({
			category: "framework-workaround",
			title: "Workaround Pattern",
			content: msg.content.slice(0, 500),
			context: ""
		});
	}
	return patterns$1.slice(0, 2);
}
function findDebuggingPatterns(transcript$1) {
	const patterns$1 = [];
	const debugKeywords = [
		"debug",
		"investigate",
		"root cause",
		"the issue is",
		"found the problem"
	];
	for (const msg of transcript$1) {
		if (msg.role !== "assistant" || !msg.content) continue;
		const hasDebug = debugKeywords.some((kw) => msg.content.toLowerCase().includes(kw));
		if (hasDebug && msg.content.length > 200) patterns$1.push({
			category: "debugging",
			title: "Debugging Approach",
			content: msg.content.slice(0, 500),
			context: ""
		});
	}
	return patterns$1.slice(0, 2);
}
function findConventionPatterns(transcript$1) {
	const patterns$1 = [];
	const conventionKeywords = [
		"convention",
		"best practice",
		"pattern",
		"standard",
		"should always",
		"never use"
	];
	for (const msg of transcript$1) {
		if (msg.role !== "assistant" || !msg.content) continue;
		const hasConvention = conventionKeywords.some((kw) => msg.content.toLowerCase().includes(kw));
		if (hasConvention) patterns$1.push({
			category: "convention",
			title: "Convention/Best Practice",
			content: msg.content.slice(0, 500),
			context: ""
		});
	}
	return patterns$1.slice(0, 2);
}
function savePatterns(patterns$1, outputDir$1) {
	const savedFiles$1 = [];
	const timestamp = new Date().toISOString().slice(0, 10);
	const existingFiles = existsSync(outputDir$1) ? readdirSync(outputDir$1) : [];
	let counter = existingFiles.length + 1;
	for (const pattern of patterns$1) {
		const filename = `${timestamp}-${pattern.category}-${counter}.md`;
		const filepath = join(outputDir$1, filename);
		const content = `---
category: ${pattern.category}
date: ${timestamp}
---

# ${pattern.title}

## Context

${pattern.context || "N/A"}

## Solution

${pattern.content}
`;
		writeFileSync(filepath, content);
		savedFiles$1.push(filename);
		counter++;
	}
	return savedFiles$1;
}

//#endregion