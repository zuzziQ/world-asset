---
type: docs
title: API SURFACE
description: OKF standardized document for API SURFACE in project world-asset-management.
tags: [world-asset-management]
related_files: [file:///C:/storymee/1-Harness-Apps/world-asset-management/docs/API_SURFACE.md]
---

# Tích hợp API (API Surface & Integration Reference)

Dự án **World Asset Management** giao tiếp trực tiếp với Core API thông qua cổng Hub Gateway. Dưới đây là các đầu API chính đang được sử dụng trong phân hệ này.

---

## 1. Xác thực Request (Headers)
Mọi Request gửi lên API đều phải kèm theo Header xác thực như sau:
```http
Authorization: Bearer sk-hub-[your-actual-api-key]
Content-Type: application/json
```

---

## 2. Danh sách API Endpoints tích hợp

### 2.1. Phân tích Style Ảnh (AI Vision)
Dùng để mô tả phong cách nghệ thuật, ánh sáng, màu sắc của Master Style Image nhằm áp dụng đồng bộ cho toàn bộ Universe.
* **Endpoint**: `POST /world-asset/analyze-style`
* **Payload**:
  ```json
  {
    "imageUrl": "https://url-anh-ref-style.com/image.png"
  }
  ```
* **Response (Success)**:
  ```json
  {
    "status": "success",
    "data": {
      "stylePrompt": "3d claymation style, pastel color palette, soft warm studio lighting, whimsical cozy bedroom vibe, masterpiece"
    }
  }
  ```

### 2.2. Trích xuất Action/Variant Tags từ Ảnh nhân vật
Dùng để tự động bóc tách trạng thái biểu cảm (emotion), hành động (action), góc máy (camera) từ ảnh gốc để phân loại tag.
* **Endpoint**: `POST /world-asset/analyze-variant-tags`
* **Payload**:
  ```json
  {
    "imageUrl": "https://url-anh-character.com/ref.png"
  }
  ```
* **Response (Success)**:
  ```json
  {
    "status": "success",
    "data": {
      "tags": ["Happy", "Dancing", "Full Body", "Pastel anime-style"]
    }
  }
  ```

### 2.3. Tạo Mẫu Ảnh / Gửi Job sinh ảnh (GFlow Media API)
Gửi job sinh ảnh tới hàng đợi BullMQ để GFlow Extension Worker kéo về thực hiện vẽ trên Google Labs.
* **Endpoint**: `POST /world-asset/jobs`
* **Payload**:
  ```json
  {
    "characterId": "f00a3c98-5274-4e14-8036-57ea76dec74e",
    "prompt": "(Base Character: Bé Mai), Happy, Dancing, Full Body, soft warm morning sunlight...",
    "stylePrompt": "Pastel anime-style illustration, cozy whimsical childlike bedroom vibe...",
    "config": {
      "model_id": "gflow-xray",
      "aspect_ratio": "1:1"
    }
  }
  ```
* **Response (Success)**:
  ```json
  {
    "status": "queued",
    "jobId": "79510a93-be70-496d-ba52-2ce30a19f238"
  }
  ```
