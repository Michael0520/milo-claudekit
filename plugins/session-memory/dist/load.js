#!/usr/bin/env node
import fs, { existsSync, readFileSync, readdirSync, statSync } from "fs";
import { basename, join } from "path";
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
//#region src/load.ts
const DEFAULT_STORAGE_DIR = join(homedir(), ".claude", "sessions");
const config = await loadConfig();
const memoryConfig = config.sessionMemory;
if (!memoryConfig?.enabled) {
	console.log(JSON.stringify({ context: null }));
	process.exit(0);
}
const storageDir = memoryConfig.storageDir ?? DEFAULT_STORAGE_DIR;
const projectName = basename(process.cwd());
const session = findLatestSession(storageDir, projectName);
if (!session) {
	console.log(JSON.stringify({
		context: null,
		message: "No previous session found"
	}));
	process.exit(0);
}
const output = {
	context: session,
	message: `📂 Restored session from ${session.timestamp}`
};
console.log(JSON.stringify(output));
const contextLines = [];
if (session.cwd) contextLines.push(`Working directory: ${session.cwd}`);
if (session.gitBranch) contextLines.push(`Git branch: ${session.gitBranch}`);
if (session.recentFiles && session.recentFiles.length > 0) contextLines.push(`Recently modified files:\n  • ${session.recentFiles.join("\n  • ")}`);
if (contextLines.length > 0) console.error(`\n📂 Previous Session Context:\n${contextLines.join("\n")}\n`);
function findLatestSession(dir, project) {
	if (!existsSync(dir)) return null;
	const files = readdirSync(dir).filter((f) => f.startsWith(project) && f.endsWith(".json")).map((f) => ({
		name: f,
		path: join(dir, f),
		mtime: statSync(join(dir, f)).mtime
	})).sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
	if (files.length === 0) return null;
	const latestFile = files[0];
	if (!latestFile) return null;
	try {
		const content = readFileSync(latestFile.path, "utf-8");
		return JSON.parse(content);
	} catch {
		return null;
	}
}

//#endregion