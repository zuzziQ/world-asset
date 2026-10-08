# StoryMee World Asset Management (WAM) Studio

> **Hệ Thống Chỉ Huy Kịch Bản & Quản Trị Tài Sản Điện Ảnh AI**  
> Tích hợp trực tiếp với **Flow Architect Engine** | Độc lập hoàn toàn với AIkid

---

## 1. Bản Sắc & Định Vị Hệ Thống (Domain Boundary)

**World Asset Management (WAM)** là hệ thống Studio chuyên nghiệp dành cho việc tiền kỳ kịch bản, thiết lập thế giới quan (World Bible), quản trị DNA nhân vật và điều phối sản xuất phim hoạt hình/điện ảnh AI.

### ⚠️ Nguyên Tắc Phân Tách Tuyệt Đối (Strict Isolation)
* **KHÔNG liên quan tới AIkid**: AIkid là sản phẩm ứng dụng di động/học tập dành cho trẻ em 3–15 tuổi (thuộc domain `mobile` và `core-lms-api`). WAM không chứa logic trẻ em, family PIN hay lớp học.
* **ĐỒNG HÀNH cùng Flow Architect**: WAM là trung tâm dữ liệu và điều phối (Command Center) kết nối trực tiếp với **Flow Architect** (`1-Harness-Apps/flow-architect`), nơi cung cấp Canvas trực quan hóa các Shots, phân rã kịch bản và nối node storyboard.

---

## 2. Các Trụ Cột Tính Năng Lõi (Core Capabilities)

| Module | Route | Mô tả chức năng |
|---|---|---|
| **Project Command Center** | `/` | Bảng điều khiển dự án, quản lý tập phim (Episodes), dàn nhân vật (Cast) và dải Timeline Storyboard. |
| **Storyboard Studio** | `/tools/storyboard` | Không gian làm việc chi tiết cho đạo diễn, bảng phân cảnh, hiệu chỉnh phong cách (Calibration) và camera. |
| **World Bible Matrix** | `/world-bible` | Quản trị quy tắc thế giới quan, Style DNA, Visual Rules và tài sản bối cảnh/đạo cụ. |
| **Character Builder** | `/character/[id]` | Universal Asset Builder, tổng hợp Prompt từ DNA tags và theo dõi render realtime. |
| **Asset X-Ray Decoder** | `/tools/xray` | Phân tích HAR, giải mã phong cách ảnh, tự động trích xuất Reverse Prompt và DNA. |
| **Orchestrator** | `/orchestrator` | Hệ thống điều hướng truy vấn tài sản theo 4 Tier Fallback và Semantic Dictionary. |
| **Jobs Manager** | `/jobs` | Giám sát trạng thái hàng đợi tạo ảnh/video trên Gateway và GPU Workers. |

---

## 3. Kiến Trúc Tích Hợp (Architecture & Gateway)

* **Frontend Framework**: Next.js 16 (App Router), React 19, TailwindCSS v4, Zustand.
* **Flow Architect Bridge**: 
  - Local Dev: `http://localhost:5173`
  - Production Vercel: `https://storyboard-workflow.vercel.app`
  - Biến môi trường: `NEXT_PUBLIC_FLOW_ARCHITECT_URL`
* **Backend Gateway**: Kết nối qua StoryMee Hub Gateway (:5100 / `https://dev-hub.storymee.com`).
  - Prefix Asset Service: `/internal/v1/asset/world/*` (Backend `core-asset-api` :4505).
  - Prefix Jobs Service: `/internal/v1/jobs/*` (Backend `core-job-api` :4504 / :4506).

---

## 4. Hướng Dẫn Cài Đặt & Vận Hành (Getting Started)

### Biến Môi Trường (.env.local)
```bash
NEXT_PUBLIC_CORE_API_URL=https://dev-hub.storymee.com
NEXT_PUBLIC_HUB_GATEWAY_URL=https://dev-hub.storymee.com
NEXT_PUBLIC_HUB_API_KEY=sk-hub-...
NEXT_PUBLIC_FLOW_ARCHITECT_URL=http://localhost:5173
```

### Lệnh Khởi Chạy
```bash
# Cài đặt thư viện
npm install

# Chạy môi trường phát triển (Port 3002)
npm run dev

# Kiểm tra chất lượng mã nguồn
npm run lint

# Build production
npm run build
```
