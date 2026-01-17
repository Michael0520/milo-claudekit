# 從 pnpm 遷移到 bun（套件管理器）

## 目標

將套件管理器從 pnpm 換成 bun，保持 monorepo workspace 功能。未來可逐步評估是否採用 bun 的其他內建功能（test runner、bundler）。

## 變更範圍

### 1. 根目錄 package.json

- 移除 `"packageManager": "pnpm@10.15.1"`
- 將 scripts 中的 `pnpm -r run` 改為 `bun run --filter '*'`
- 新增 `"workspaces": ["packages/*", "plugins/*"]`

### 2. Workspace 設定

- 刪除 `pnpm-workspace.yaml`
- Workspace 定義移至根目錄 `package.json`

### 3. 子 package 的 catalog 依賴

將 `"catalog:"` 替換成實際版本號：

| 套件 | 版本 |
|------|------|
| @types/node | 25.0.6 |
| prettier | 3.7.4 |
| rolldown | ^1.0.0-beta.59 |
| typescript | 5.9.3 |
| vitest | 4.0.16 |

需更新的檔案：
- `packages/config/package.json`
- `packages/hook/package.json`
- `plugins/git/package.json`
- `plugins/rubric/package.json`

### 4. workspace 依賴

`"workspace:*"` 保持不變，bun 原生支援。

### 5. Lock 檔案

- 刪除 `pnpm-lock.yaml`
- 執行 `bun install` 生成 `bun.lockb`

### 6. 文件更新

- `CLAUDE.md` - 更新 pnpm 相關指令為 bun
- `plugins/milo-core/CLAUDE.md` - 更新相關指令
- `plugins/worktree-manager/skills/worktree-manager/SKILL.md` - 更新相關指令

## 實作步驟

1. 更新根目錄 package.json
2. 更新子 package 的 catalog 依賴（4 個檔案）
3. 刪除 pnpm 檔案
4. 執行 bun install
5. 驗證 build
6. 更新文件
7. 提交變更

## 風險與注意事項

- **Rolldown 相容性** - Rolldown 用 Node.js 執行，bun 作為套件管理器應該沒問題，但需驗證
- **TypeScript 執行** - tsc 仍使用 Node.js，不受影響
- **CI/CD** - 如果有 GitHub Actions 或其他 CI，需要更新安裝步驟
