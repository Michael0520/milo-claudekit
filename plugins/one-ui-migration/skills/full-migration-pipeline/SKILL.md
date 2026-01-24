---
name: full-migration-pipeline
description: Complete MX-ROS migration pipeline that orchestrates all migration skills in sequence.
---

# Full Migration Pipeline

自動化執行完整的 MX-ROS 遷移流程，串接所有相關 skills。

## Arguments

- `$ARGUMENTS` - Format: `--from <source_path> --to <target_path>` 或 `--page <page_name>`
  - `--from`: 舊專案路徑 (e.g., `/Users/jayden/f2e-networking-jayden/apps/mx-ros-web/src/app/pages/account`)
  - `--to`: 新專案路徑 (e.g., `libs/mx-ros/account-page`)
  - `--page`: GitLab 頁面名稱 (e.g., `time`, `account`) - 使用此參數時自動從 GitLab 取得源碼

## Pipeline 流程

```
┌─────────────────────────────────────────────────────────────────┐
│                    FULL MIGRATION PIPELINE                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Phase 1: 分析階段                                               │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 1.1 執行 migrate-mx-ros-page (分析 + 產出文件)           │    │
│  │ 1.2 執行 form-extraction (提取表單結構)                  │    │
│  │     產出: MIGRATION-ANALYSIS.md                          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                           ↓                                      │
│  Phase 2: 實作階段 (手動)                                        │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 2.1 建立 Domain Layer (model, api, store, helper)       │    │
│  │ 2.2 建立 UI Layer (tables, forms)                        │    │
│  │ 2.3 建立 Features Layer (page, dialogs)                  │    │
│  │ 2.4 建立 Shell Layer (routes)                            │    │
│  │     [等待用戶確認完成]                                    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                           ↓                                      │
│  Phase 3: 品質檢查階段                                           │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 3.1 執行 mx-ros-lint (合規性檢查 + 自動修復)             │    │
│  │ 3.2 執行 migration-review (遷移完整性檢查)               │    │
│  │ 3.3 執行 compare-i18n-keys (翻譯 key 比對)               │    │
│  │ 3.4 執行 check-barrel-files (檢查冗餘 barrel)            │    │
│  └─────────────────────────────────────────────────────────┘    │
│                           ↓                                      │
│  Phase 4: QA 驗證階段                                            │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 4.1 執行 generate-qa-test-cases (生成測試案例)           │    │
│  │ 4.2 執行 verify-legacy-with-qa-testcases (驗證舊程式碼)  │    │
│  │     產出: QA-TEST-CASES.md, LEGACY-VERIFICATION-REPORT.md│    │
│  └─────────────────────────────────────────────────────────┘    │
│                           ↓                                      │
│  Phase 5: 最終報告                                               │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 產出 MIGRATION-SUMMARY.md (彙整所有階段結果)             │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 執行流程

### Phase 1: 分析階段

**自動執行：**

1. **判斷來源類型**
   - 如果提供 `--page`：使用 GitLab API 取得源碼
   - 如果提供 `--from`：使用本地檔案

2. **執行遷移分析**
   ```
   根據來源類型執行：
   - /migrate-mx-ros-page --from={source} --to={target}
   - /migrate-mx-ros-page-gitlab --page={page_name}
   ```

3. **提取表單結構**（輔助分析）
   - 讀取源碼中的表單定義
   - 列出所有 formControlName, validators

**產出：**
- `{target}/domain/src/lib/docs/MIGRATION-ANALYSIS.md`

**詢問用戶：**
> Phase 1 分析完成。是否開始 Phase 2 實作階段？

---

### Phase 2: 實作階段

**提供實作指引：**

顯示待實作項目清單（根據 MIGRATION-ANALYSIS.md）：

```markdown
## 實作檢查清單

### Domain Layer
- [ ] 建立 `{feature}.model.ts` - API types, view models
- [ ] 建立 `{feature}.api.ts` - API service (URL 直接 inline，不要用常數)
- [ ] 建立 `{feature}.store.ts` - SignalStore
- [ ] 建立 `{feature}.helper.ts` - Pure functions (如需要)

### Features Layer (先實作)
- [ ] 建立 Page component
- [ ] 建立 Dialog components (如有)
- [ ] 確認注入 store

### UI Layer (從 Features 提取)
- [ ] 提取 Table components 到 UI layer
- [ ] 提取 Form components 到 UI layer
- [ ] 確認使用 input()/output()，無 store 注入

### Shell Layer
- [ ] 建立 routes
- [ ] 註冊到 app.routes.ts
```

#### ⚠️ 重要：Form/Table 提取到 UI Layer

**實作順序：**
1. 先在 Features Layer 完成頁面功能
2. 再將 Form 和 Table 提取到 UI Layer
3. Features Layer 只保留 orchestration code

**提取標準：**
- `<form>` 內有 `<mat-form-field>` → 提取到 UI
- 表格 → 優先使用 `common-table` pattern（參考 `libs/mx-ros/shared/ui/src/lib/common-table`）
- Dialog 保留在 Features（但 Dialog 內的 form 可提取到 UI）

**Table 實作方式：**
- 優先使用 `CommonTableComponent` 搭配 `MxColumnDef[]` 定義欄位
- 若有複雜客製需求才建立獨立的 table component 到 UI layer

**不需提取的例外：**
- 極簡單的頁面（如只有 radio group 無表單驗證）
- 僅供單一頁面使用且無複雜表單邏輯

#### ⚠️ 不要使用的 Pattern

```typescript
// ❌ 不要使用 TRANSLOCO_SCOPE
providers: [{ provide: TRANSLOCO_SCOPE, useValue: { scope: 'xxx' } }]

// ❌ 不要使用 endpoint 常數
readonly #ENDPOINTS = { API: '/api/xxx' };

// ✅ 直接 inline URL
this.#rest.get('/api/xxx');
```

#### 分塊遷移技巧 (降低遺漏風險)

**原則：由大到小，逐塊完成**

```
頁面結構分析：
┌─────────────────────────────────────┐
│ Page                                │
│ ┌─────────────────────────────────┐ │
│ │ mat-tab-group                   │ │
│ │ ┌───────────┬───────────┐       │ │
│ │ │  Tab 1    │  Tab 2    │       │ │
│ │ ├───────────┴───────────┤       │ │
│ │ │ mat-card / section 1  │       │ │
│ │ ├───────────────────────┤       │ │
│ │ │ mat-card / section 2  │       │ │
│ │ └───────────────────────┘       │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Step 1: 以 `mat-tab` 為區塊**
- 先識別頁面有幾個 tab
- 每個 tab 獨立處理，完成一個再做下一個
- 建立 tab 對應的 checklist

**Step 2: 以 `mat-card` / `content-wrapper` 切塊**
- 在每個 tab 內，識別所有 card/section
- 每個 card 視為一個獨立單元遷移
- 完成一個 card 後立即驗證

**Step 3: 逐一遷移並驗證**
- 遷移順序：由上到下、由左到右
- 每完成一個區塊，執行 `/mx-ros-lint` 檢查
- 比對舊程式碼確認無遺漏

**範例 Checklist：**
```markdown
## 分塊遷移進度

### Tab 1: General Settings
- [x] Card 1.1: Basic Info
- [x] Card 1.2: Network Config
- [ ] Card 1.3: Advanced Options

### Tab 2: Security
- [ ] Card 2.1: Authentication
- [ ] Card 2.2: Certificates
```

**生成 library 結構：**
```bash
nx g @one-ui/one-plugin:library mx-ros {page-name} all
```

**等待用戶確認：**
> 請完成上述實作後輸入 "done" 或 "繼續" 進入 Phase 3。
> 如需查詢模式，可使用 /mx-ros-patterns <keyword>

---

### Phase 3: 品質檢查階段

**自動執行：**

1. **合規性檢查 + 自動修復**
   ```
   /mx-ros-lint {target}
   ```
   - 自動修復：mat-raised-button → mat-flat-button
   - 自動修復：*ngIf → @if
   - 自動修復：Validators → OneValidators
   - 產出合規報告

2. **遷移完整性檢查**
   ```
   /migration-review --from={source} --to={target}
   ```
   - 比對 form controls
   - 比對 validators
   - 比對 translation keys
   - 比對 event bindings

3. **翻譯 key 比對**（針對主要 HTML 檔案）
   ```
   /compare-i18n-keys --from={source}/*.html --to={target}/**/*.html
   ```

4. **檢查冗餘 barrel files**
   ```
   /check-barrel-files {target}
   ```

**產出：**
- 各檢查的報告（顯示在對話中）
- 自動修復的變更清單

**詢問用戶：**
> Phase 3 品質檢查完成。發現 X 個問題已自動修復，Y 個問題需手動處理。
> 是否繼續 Phase 4 QA 驗證階段？

---

### Phase 4: QA 驗證階段

**自動執行：**

1. **生成 QA 測試案例**
   ```
   /generate-qa-test-cases {target}
   ```
   - 從新程式碼提取測試案例
   - 產出繁體中文報告

2. **驗證舊程式碼**
   ```
   /verify-legacy-with-qa-testcases {source}
   ```
   - 用測試案例驗證舊程式碼
   - 確認功能一致性

**產出：**
- `{target}/domain/src/lib/docs/QA-TEST-CASES.md`
- `{target}/domain/src/lib/docs/LEGACY-VERIFICATION-REPORT.md`

---

### Phase 5: 最終報告

**自動產出 MIGRATION-SUMMARY.md：**

```markdown
# {Feature Name} 遷移總結報告

**遷移日期：** {date}
**來源：** {source_path}
**目標：** {target_path}

## 遷移狀態

| 階段 | 狀態 | 備註 |
|------|------|------|
| Phase 1: 分析 | ✅ 完成 | |
| Phase 2: 實作 | ✅ 完成 | |
| Phase 3: 品質檢查 | ✅ 完成 | 自動修復 X 項 |
| Phase 4: QA 驗證 | ✅ 完成 | |

## 產出文件

- [x] MIGRATION-ANALYSIS.md
- [x] QA-TEST-CASES.md
- [x] LEGACY-VERIFICATION-REPORT.md
- [x] MIGRATION-SUMMARY.md (本文件)

## 合規性報告摘要

### 自動修復項目
{列出已自動修復的項目}

### 需手動處理項目
{列出需手動處理的項目}

## 遷移完整性

| 類別 | 來源 | 目標 | 完整度 |
|------|------|------|--------|
| Form Controls | X | X | 100% |
| Validators | X | X | 100% |
| Translation Keys | X | X | 100% |
| Event Bindings | X | X | 100% |

## 下一步

1. [ ] 執行完整測試
2. [ ] Code Review
3. [ ] 合併到主分支
```

**產出位置：** `{target}/domain/src/lib/docs/MIGRATION-SUMMARY.md`

---

## 使用範例

### 從本地源碼遷移

```bash
/full-migration-pipeline --from=/Users/jayden/f2e-networking-jayden/apps/mx-ros-web/src/app/pages/account --to=libs/mx-ros/account-page
```

### 從 GitLab 遷移

```bash
/full-migration-pipeline --page=account
```

## 中斷與恢復

如果流程中斷，可以從特定階段繼續：

```bash
# 只執行 Phase 3 品質檢查
/mx-ros-lint libs/mx-ros/account-page

# 只執行 Phase 4 QA 驗證
/generate-qa-test-cases libs/mx-ros/account-page
/verify-legacy-with-qa-testcases /path/to/legacy
```

## 輔助 Skills

在 Pipeline 執行過程中，可隨時使用：

| Skill | 用途 |
|-------|------|
| `/mx-ros-patterns <keyword>` | 查詢遷移模式 |
| `/icon-replacement <icon>` | 查找替代圖示 |
| `/ui-layout-guide <query>` | UI 版面指南 |
