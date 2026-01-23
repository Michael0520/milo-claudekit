#!/usr/bin/env node
import fs, { existsSync, mkdirSync, readdirSync, statSync, unlinkSync, writeFileSync } from "fs";
import { basename, join } from "path";
import { homedir } from "os";
import { exec } from "child_process";
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
//#region src/save.ts
const DEFAULT_STORAGE_DIR = join(homedir(), ".claude", "sessions");
const DEFAULT_RETENTION_DAYS = 7;
const DEFAULT_MAX_SESSIONS = 50;
const config = await loadConfig();
const memoryConfig = config.sessionMemory;
if (!memoryConfig?.enabled) {
	console.log(stop(true));
	process.exit(0);
}
const hook = await loadHook();
if (hook.stopHookActive) {
	console.log(stop(true));
	process.exit(0);
}
const storageDir = memoryConfig.storageDir ?? DEFAULT_STORAGE_DIR;
const retentionDays = memoryConfig.retentionDays ?? DEFAULT_RETENTION_DAYS;
const maxSessions = memoryConfig.maxSessions ?? DEFAULT_MAX_SESSIONS;
const includeConfig = memoryConfig.include ?? {
	cwd: true,
	gitBranch: true,
	recentFiles: true,
	customContext: false
};
if (!existsSync(storageDir)) mkdirSync(storageDir, { recursive: true });
const sessionContext = await buildSessionContext(includeConfig);
const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const projectName = basename(process.cwd());
const filename = `${projectName}-${timestamp}.json`;
const filepath = join(storageDir, filename);
writeFileSync(filepath, JSON.stringify(sessionContext, null, 2));
cleanupOldSessions(storageDir, retentionDays, maxSessions);
console.log(stop(true, `💾 Session context saved to ${filename}`));
async function buildSessionContext(include) {
	const context = {
		timestamp: new Date().toISOString(),
		project: basename(process.cwd())
	};
	if (include.cwd) context.cwd = process.cwd();
	if (include.gitBranch) context.gitBranch = await getGitBranch();
	if (include.recentFiles) context.recentFiles = await getRecentlyModifiedFiles();
	return context;
}
function getGitBranch() {
	return new Promise((resolve) => {
		exec("git branch --show-current", (error, stdout) => {
			if (error) {
				resolve("");
				return;
			}
			resolve(stdout.trim());
		});
	});
}
function getRecentlyModifiedFiles() {
	return new Promise((resolve) => {
		exec("git diff --name-only HEAD~5 2>/dev/null || git diff --name-only", (error, stdout) => {
			if (error) {
				resolve([]);
				return;
			}
			const files = stdout.split("\n").filter((f) => f.trim() !== "").slice(0, 10);
			resolve(files);
		});
	});
}
function cleanupOldSessions(dir, retentionDays$1, maxSessions$1) {
	if (!existsSync(dir)) return;
	const files = readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => ({
		name: f,
		path: join(dir, f),
		mtime: statSync(join(dir, f)).mtime
	})).sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
	const now = Date.now();
	const retentionMs = retentionDays$1 * 24 * 60 * 60 * 1e3;
	for (const file of files) if (now - file.mtime.getTime() > retentionMs) try {
		unlinkSync(file.path);
	} catch {}
	const remainingFiles = readdirSync(dir).filter((f) => f.endsWith(".json"));
	if (remainingFiles.length > maxSessions$1) {
		const sortedFiles = remainingFiles.map((f) => ({
			name: f,
			path: join(dir, f),
			mtime: statSync(join(dir, f)).mtime
		})).sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
		for (let i = maxSessions$1; i < sortedFiles.length; i++) {
			const file = sortedFiles[i];
			if (file) try {
				unlinkSync(file.path);
			} catch {}
		}
	}
}

//#endregion