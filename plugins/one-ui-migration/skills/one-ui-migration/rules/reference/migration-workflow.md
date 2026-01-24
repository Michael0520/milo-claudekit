# MX-ROS Migration Workflow

完整的 MX-ROS 遷移工作流程說明，包含 Skills 使用方式和最佳實踐。

## Skills 分類總覽

| 類別             | Skills                                                                                              | 用途               |
| ---------------- | --------------------------------------------------------------------------------------------------- | ------------------ |
| **自動化流程**   | `full-migration-pipeline`                                                                           | 一鍵執行完整遷移   |
| **主要遷移流程** | `migrate-mx-ros-page`, `migrate-mx-ros-page-gitlab`                                                 | 執行完整遷移       |
| **核心參考**     | `mx-ros-migration`, `mx-ros-patterns`                                                               | 遷移原則與模式查詢 |
| **品質檢查**     | `mx-ros-lint`, `migration-review`                                                                   | 程式碼合規性檢查   |
| **QA 驗證**      | `generate-qa-test-cases`, `verify-legacy-with-qa-testcases`                                         | 測試案例生成與驗證 |
| **輔助工具**     | `form-extraction`, `compare-i18n-keys`, `icon-replacement`, `ui-layout-guide`, `check-barrel-files` | 特定任務輔助       |

## 遷移工作流程圖

```mermaid
flowchart TB
    subgraph Phase1["Phase 1: 分析階段"]
        START([開始遷移]) --> MIGRATE["/migrate-mx-ros-page\n或\n/migrate-mx-ros-page-gitlab"]
        MIGRATE --> ANALYSIS["生成 MIGRATION-ANALYSIS.md"]
        ANALYSIS --> FORM_EXT["/form-extraction\n提取表單控制項"]
        ANALYSIS --> I18N_EXT["提取翻譯 keys"]
    end

    subgraph Phase2["Phase 2: 實作階段"]
        FORM_EXT --> DOMAIN["建立 Domain Layer\n- *.model.ts\n- *.api.ts\n- *.store.ts"]
        I18N_EXT --> DOMAIN
        DOMAIN --> UI["建立 UI Layer\n- Tables\n- Forms"]
        UI --> FEATURES["建立 Features Layer\n- Page Component\n- Dialogs"]
        FEATURES --> SHELL["建立 Shell Layer\n- Routes"]
    end

    subgraph Phase3["Phase 3: 品質檢查階段"]
        SHELL --> LINT["/mx-ros-lint\n合規性檢查 + 自動修復"]
        LINT --> REVIEW["/migration-review\n遷移完整性檢查"]
        REVIEW --> I18N_CMP["/compare-i18n-keys\n翻譯 key 比對"]
        I18N_CMP --> BARREL["/check-barrel-files\n檢查冗餘 barrel"]
    end

    subgraph Phase4["Phase 4: QA 驗證階段"]
        BARREL --> QA_GEN["/generate-qa-test-cases\n生成 QA 測試案例"]
        QA_GEN --> QA_VERIFY["/verify-legacy-with-qa-testcases\n驗證舊程式碼"]
        QA_VERIFY --> DONE([遷移完成])
    end

    subgraph Support["輔助 Skills (隨時可用)"]
        PATTERNS["/mx-ros-patterns\n查詢遷移模式"]
        ICONS["/icon-replacement\n圖示替換"]
        LAYOUT["/ui-layout-guide\nUI 版面指南"]
    end

    DOMAIN -.->|查詢| PATTERNS
    UI -.->|查詢| PATTERNS
    UI -.->|查詢| ICONS
    UI -.->|查詢| LAYOUT
    FEATURES -.->|查詢| PATTERNS

    style Phase1 fill:#e1f5fe
    style Phase2 fill:#fff3e0
    style Phase3 fill:#f3e5f5
    style Phase4 fill:#e8f5e9
    style Support fill:#fafafa
```

## Skills 依賴關係圖

```mermaid
graph LR
    subgraph Core["核心知識庫"]
        MIG["mx-ros-migration\n(核心原則)"]
        PAT["mx-ros-patterns\n(模式查詢)"]
    end

    subgraph MainFlow["主流程 Skills"]
        MP["migrate-mx-ros-page"]
        MG["migrate-mx-ros-page-gitlab"]
    end

    subgraph QualityCheck["品質檢查 Skills"]
        LINT["mx-ros-lint"]
        REV["migration-review"]
    end

    subgraph QATools["QA 工具 Skills"]
        GEN["generate-qa-test-cases"]
        VER["verify-legacy-with-qa-testcases"]
    end

    subgraph Helpers["輔助 Skills"]
        FORM["form-extraction"]
        I18N["compare-i18n-keys"]
        ICON["icon-replacement"]
        UI["ui-layout-guide"]
        BARREL["check-barrel-files"]
    end

    MIG -->|參考| MP
    MIG -->|參考| MG
    MIG -->|參考| LINT
    MIG -->|參考| REV
    PAT -->|提供查詢| MP
    PAT -->|提供查詢| MG

    FORM -->|被引用| REV
    FORM -->|被引用| LINT

    GEN -->|產出| VER

    MP --> REV
    MG --> REV
    REV --> LINT
```

## 各階段詳細說明

### Phase 1: 分析階段

**目標：** 了解舊程式碼結構，產出遷移分析文件

| 步驟 | Skill                                                | 產出                    |
| ---- | ---------------------------------------------------- | ----------------------- |
| 1    | `/migrate-mx-ros-page --from=<source> --to=<target>` | `MIGRATION-ANALYSIS.md` |
| 2    | `/form-extraction` (輔助)                            | 表單控制項清單          |

**產出文件位置：** `{target}/domain/src/lib/docs/MIGRATION-ANALYSIS.md`

### Phase 2: 實作階段

**目標：** 按照 DDD 架構建立各 Layer

| Layer    | 內容                                                  | 查詢 Skill                                   |
| -------- | ----------------------------------------------------- | -------------------------------------------- |
| Domain   | `*.model.ts`, `*.api.ts`, `*.store.ts`, `*.helper.ts` | `/mx-ros-patterns store`                     |
| UI       | Tables, Forms (input/output only)                     | `/mx-ros-patterns table`, `/ui-layout-guide` |
| Features | Page Component, Dialogs                               | `/mx-ros-patterns dialog`                    |
| Shell    | Routes, Resolvers                                     | -                                            |

### Phase 3: 品質檢查階段

**目標：** 確保程式碼符合遷移規範

| 步驟 | Skill                                                  | 說明                    |
| ---- | ------------------------------------------------------ | ----------------------- |
| 1    | `/mx-ros-lint <path>`                                  | 自動修復 + 產出合規報告 |
| 2    | `/migration-review --from=<old> --to=<new>`            | 比對遷移完整性          |
| 3    | `/compare-i18n-keys --from=<old.html> --to=<new.html>` | 確認翻譯 key 一致       |
| 4    | `/check-barrel-files <path>`                           | 移除冗餘 barrel files   |

### Phase 4: QA 驗證階段

**目標：** 產出測試案例，確認功能一致性

| 步驟 | Skill                                            | 產出                            |
| ---- | ------------------------------------------------ | ------------------------------- |
| 1    | `/generate-qa-test-cases <path>`                 | `QA-TEST-CASES.md`              |
| 2    | `/verify-legacy-with-qa-testcases <legacy-path>` | `LEGACY-VERIFICATION-REPORT.md` |

**產出文件位置：** `{target}/domain/src/lib/docs/`

## 最佳實踐流程 (Sequence)

```mermaid
sequenceDiagram
    participant Dev as 開發者
    participant M as migrate-mx-ros-page
    participant L as mx-ros-lint
    participant R as migration-review
    participant Q as generate-qa-test-cases
    participant V as verify-legacy-with-qa-testcases

    Dev->>M: 1. 執行遷移分析
    M-->>Dev: 產出 MIGRATION-ANALYSIS.md
    Dev->>Dev: 2. 手動實作各 Layer
    Dev->>L: 3. 執行合規性檢查
    L-->>Dev: 自動修復 + 報告
    Dev->>R: 4. 檢查遷移完整性
    R-->>Dev: 缺漏項目報告
    Dev->>Dev: 5. 修復缺漏
    Dev->>Q: 6. 生成 QA 測試案例
    Q-->>Dev: QA-TEST-CASES.md
    Dev->>V: 7. 驗證舊程式碼
    V-->>Dev: LEGACY-VERIFICATION-REPORT.md
    Dev->>Dev: 8. 確認功能一致性
```

## 輔助 Skills 使用時機

| Skill                           | 使用時機                                                                                 |
| ------------------------------- | ---------------------------------------------------------------------------------------- |
| `/mx-ros-patterns <keyword>`    | 任何時候需要查詢遷移模式 (table, form, dialog, layout, button, store, syntax, validator) |
| `/icon-replacement <icon-name>` | 遇到舊圖示需要替換時                                                                     |
| `/ui-layout-guide <query>`      | 建立 UI 版面時查詢最佳實踐                                                               |
| `/form-extraction`              | 需要提取表單結構進行比對時                                                               |

## 備註

- E2E 測試生成、API Mock 生成目前不需要
- 效能檢查以遷移為主，暫緩實作

## 快速指令參考

```bash
# 一鍵執行完整遷移流程 (推薦)
/full-migration-pipeline --from=/path/to/old --to=libs/mx-ros/xxx-page
/full-migration-pipeline --page=xxx  # 從 GitLab

# 手動執行各階段
/migrate-mx-ros-page --from=/path/to/old --to=libs/mx-ros/xxx-page
/mx-ros-lint libs/mx-ros/xxx-page
/migration-review --from=/path/to/old --to=libs/mx-ros/xxx-page
/generate-qa-test-cases libs/mx-ros/xxx-page
/verify-legacy-with-qa-testcases /path/to/old

# 查詢模式
/mx-ros-patterns table
/mx-ros-patterns form
/mx-ros-patterns dialog

# 輔助工具
/icon-replacement settings
/ui-layout-guide card
/check-barrel-files libs/mx-ros/xxx-page
```
