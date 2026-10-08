---
type: docs
title: CODE MAP
description: Bản đồ cấu trúc source code của World Asset Management Studio và tích hợp Flow Architect
tags: [world-asset-management, flow-architect, code-map]
related_files: [file:///C:/storymee/1-Harness-Apps/world-asset-management/docs/CODE_MAP.md]
---

# Bản đồ Cấu trúc Source Code (Code Map)

Dự án **World Asset Management (WAM) Studio** được xây dựng trên nền tảng **Next.js 16 App Router** (React 19, TailwindCSS v4, Zustand) theo mô hình **Feature-Driven Architecture**. Hệ thống đóng vai trò là Command Center tiền kỳ điện ảnh, tích hợp trực tiếp với **Flow Architect Engine** và hoàn toàn độc lập với AIkid.

---

## 1. Bản đồ Thư mục Chi tiết (Directory Structure)

```text
world-asset-management/
├── docs/                           # Thư mục tài liệu kỹ thuật & kiến trúc
│   ├── CONFIG_REFERENCE.md         # API Keys và biến môi trường
│   ├── API_SURFACE.md              # Tài liệu các đầu API tích hợp
│   └── CODE_MAP.md                 # Bản đồ source code hiện tại
├── public/                         # Assets tĩnh (images, icons)
├── scratch/                        # Scripts tạm thời & legacy scripts
└── src/
    ├── app/                        # Next.js App Router (Page, Layout, Route Handlers)
    │   ├── api/xray/               # API route phân tích HAR & reverse prompt
    │   ├── character/[id]/         # Builder Workspace chính cho Character DNA
    │   ├── jobs/                   # Jobs Manager theo dõi tiến độ tạo ảnh/video
    │   ├── orchestrator/           # Điều phối Fallback Tiers & Semantic Dictionary
    │   ├── tools/
    │   │   ├── storyboard/         # Storyboard Studio chuyên sâu
    │   │   └── xray/               # Asset X-Ray Decoder & Analyzer
    │   ├── world-bible/            # World Bible Matrix & Universe DNA
    │   ├── layout.tsx              # Root Layout, Providers & Font config
    │   └── page.tsx                # Project Command Center (Dashboard trung tâm)
    ├── components/                 # Components giao diện hệ thống
    │   ├── ClientLayoutShell.tsx   # Shell layout bao bọc Sidebar và Main content
    │   ├── Sidebar.tsx             # Thanh điều hướng chính (Script, Storyboard, World Bible, Jobs, X-Ray)
    │   ├── ExtensionStatusButton.ts# Trạng thái kết nối Universal AI Extension
    │   └── GlobalSettingsButton.tsx# Thiết lập cấu hình kết nối Gateway / VPS
    ├── features/                   # Feature-Driven Core Modules
    │   ├── project-dashboard/      # Quản lý Project, Episode, Cast, và Storyboard Timeline
    │   ├── storyboard/             # Không gian Storyboard, Camera, Style Calibration, Script Editor
    │   ├── world-bible/            # Quản trị World Bible Matrix, Quy tắc hình ảnh, Entity tags
    │   └── xray/                   # X-Ray Workspace, DNA Decoder, Style Analysis
    ├── hooks/                      # Global Hooks (useJobStatus, useGFlowExtension)
    ├── lib/                        # Thư viện dùng chung
    │   ├── api.ts                  # REST API Client kết nối Hub Gateway (:5100)
    │   ├── projectStore.ts         # Global Zustand Store cho Projects, Episodes, Assets
    │   ├── globalJobSubscriber.ts  # SSE/Polling subscriber cho realtime AI jobs
    │   └── cinematic-engine/       # Thuật toán điện ảnh (Camera, Cut Planner, Shot Structure, Audio)
    └── proxy.ts                    # Next.js 16 Proxy rewrite tới backend VPS
```

---

## 2. Các Phân Vùng Lõi & Điểm Tích Hợp (Core Modules)

### 2.1. Project Command Center (`src/app/page.tsx`)
* Quản lý danh sách Universe/Projects và Episodes.
* Hiển thị dàn nhân vật (`CinematicOverview`), chi tiết tạo hình (`CharacterProfileStudio`).
* Tích hợp dải cuộn ngang **Storyboard Timeline** dưới đáy màn hình, kết nối 1-click sang **Flow Architect Engine** (`http://localhost:5173` hoặc Vercel).

### 2.2. Storyboard Workspace (`src/features/storyboard/`)
* Module đạo diễn kịch bản: phân cảnh theo Shot, chọn cỡ cảnh (Shot Size), góc máy (Camera Angle), động tác máy (Camera Movement).
* Style Calibration Panel: Hiệu chuẩn phong cách hình ảnh và nhất quán nhân vật.
* Video Sequence Panel & Script Evaluation.

### 2.3. World Bible Matrix (`src/features/world-bible/`)
* Quản lý DNA gốc của nhân vật, bối cảnh, đạo cụ.
* Biên tập bộ quy tắc thế giới quan (Visual Rules, Lighting, Palette).

### 2.4. Flow Architect Integration Bridge
* Link trigger từ `StoryboardTimeline.tsx` gọi `getStoryboardFlowUrl()`.
* Đọc biến môi trường `NEXT_PUBLIC_FLOW_ARCHITECT_URL` (hỗ trợ cả dev local `:5173` lẫn production Vercel).
* Dữ liệu kịch bản và shots được đồng bộ 2 chiều qua `core-asset-api` (`/internal/v1/asset/world/episodes/:id/storyboard-assets`).

---

## 3. Ranh Giới Độc Lập Với AIkid (Strict Boundary)

* **Không chia sẻ Auth/JWT trẻ em**: WAM dùng Hub API Key (`HUB_API_KEY`) hoặc Bearer token của Creator Studio; không sử dụng Family PIN hay Classroom Auth.
* **Không chia sẻ UI Components**: Toàn bộ UI của WAM thiết kế theo Dark Slate/Cyber Cinematic theme mật độ cao, phục vụ Đạo diễn/Creator chuyên nghiệp.
