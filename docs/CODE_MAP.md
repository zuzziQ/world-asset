---
type: docs
title: CODE MAP
description: OKF standardized document for CODE MAP in project world-asset-management.
tags: [world-asset-management]
related_files: [file:///C:/storymee/1-Harness-Apps/world-asset-management/docs/CODE_MAP.md]
---

# Bản đồ Cấu trúc Source Code (Code Map)

Dự án **World Asset Management** được xây dựng trên nền tảng **Next.js App Router** và sử dụng **TailwindCSS/Vanilla CSS** cho giao diện người dùng. Dưới đây là kiến trúc các thư mục và file lõi của dự án.

---

## 1. Bản đồ Thư mục (Directory Structure)

```text
world-asset-management/
├── docs/                           # Thư mục tài liệu kỹ thuật & cấu hình
│   ├── CONFIG_REFERENCE.md         # API Keys và biến môi trường
│   ├── API_SURFACE.md              # Tài liệu các đầu API tích hợp
│   └── CODE_MAP.md                 # Bản đồ source code hiện tại
├── public/                         # Assets tĩnh (images, icons)
└── src/
    ├── app/                        # Next.js App Router Pages
    │   ├── character/
    │   │   └── [id]/
    │   │       └── page.tsx        # Trực quan hóa & Builder Workspace chính cho Character
    │   ├── layout.tsx              # Layout tổng của app (Providers, Global CSS)
    │   └── page.tsx                # Dashboard chính (Danh sách Universe & Character)
    ├── components/                 # Các components tái sử dụng
    │   └── GlobalSettingsButton.tsx # Nút cấu hình tham số AI & Credentials
    └── lib/
        └── api.ts                  # API client quản lý các kết nối HTTP fetch & map dữ liệu
```

---

## 2. Các File Lõi cần chú ý (Core Components)

### 2.1. Builder Workspace (`src/app/character/[id]/page.tsx`)
* **Chức năng**: Đây là màn hình Universal Asset Builder chính. Chứa toàn bộ logic:
  * Trực quan hóa Character, cấu hình Active Composition (ghép các tag).
  * NLP Prompt Generator: Tự động tổng hợp Prompt từ các tag đang chọn và Style của Universe.
  * Trigger job tạo ảnh, theo dõi trạng thái Realtime của Job (Đã gửi job -> Đang tạo -> Hoàn tất).
  * Quản lý Custom Tag (Thêm, Xóa, Sửa, Click chọn tag Property).

### 2.2. API Client Linker (`src/lib/api.ts`)
* **Chức năng**: Điểm tập trung tất cả các hàm gọi API REST tới Gateway.
  * Tự động tiêm Token Bearer `NEXT_PUBLIC_HUB_API_KEY` vào Header.
  * Chứa mapper `fetchCustomTags` để đồng bộ `tagId` từ DB thành `id` dùng ở UI.
  * Chứa các wrapper gửi/xóa/sửa tag.
