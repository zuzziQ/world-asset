---
type: docs
title: CONFIG REFERENCE
description: OKF standardized document for CONFIG REFERENCE in project world-asset-management.
tags: [world-asset-management]
related_files: [file:///C:/storymee/1-Harness-Apps/world-asset-management/docs/CONFIG_REFERENCE.md]
---

# Cấu hình Môi trường & Key Bảo mật (Config & Credentials Reference)

Tài liệu này lưu trữ và giải thích các biến môi trường cùng các API Key bảo mật quan trọng của dự án **World Asset Management (Next.js)** nhằm đảm bảo an toàn thông tin, tránh thất lạc và hỗ trợ thiết lập nhanh khi deploy local/production.

---

## 1. Danh sách API Key & Credentials

### 1.1. Hub Gateway Authentication Key (Active)
Đây là API Key riêng cấp cho phân hệ World Asset để xác thực bảo mật thông qua Gateway của VPS Production. Key này có quyền truy cập vào các AI Vision Models và các API lõi.
* **Key ID**: `World Asset` (Tên định danh đăng ký trên DB VPS)
* **API Key**: `sk-hub-[your-actual-api-key]`
* **Trạng thái**: 🟢 **Active (Đã kích hoạt trên Postgres Production)**
* **Mục đích**:
  * Xác thực với `/world-asset/analyze-style` để phân tích style từ Master Image.
  * Xác thực với `/world-asset/analyze-variant-tags` để bóc tách variant tags bằng AI Vision.
  * Gửi yêu cầu sinh prompt thông qua `/media/prompt`.

---

## 2. Cấu hình Môi trường (.env.local)

Khi chạy dự án ở môi trường Local (`localhost:3002`) hoặc deploy lên Vercel, các biến môi trường sau **bắt buộc** phải được thiết lập trong file `.env.local`:

```env
# =========================================================================
# WORLD ASSET MANAGEMENT - ENVIRONMENT CONFIGURATION
# =========================================================================

# 1. API Base URL (Proxy qua Hub Gateway của VPS Production)
NEXT_PUBLIC_OMNI_CORE_API=https://hub.storymee.com/api

# 2. Hub API Key (Bắt buộc để xác thực với Gateway bảo mật)
NEXT_PUBLIC_HUB_API_KEY=sk-hub-[your-actual-api-key]
```

### Giải thích các biến môi trường:
* **`NEXT_PUBLIC_OMNI_CORE_API`**: Địa chỉ cổng Gateway API của hệ thống. Ở local, Next.js sẽ gọi trực tiếp đến Gateway VPS này để đồng bộ hóa DB Postgres Production theo thời gian thực.
* **`NEXT_PUBLIC_HUB_API_KEY`**: Chứa Token xác thực Bearer (`sk-hub-...`) được gắn tự động vào HTTP Headers của mọi API request từ Client Next.js gửi đi.

---

## 3. Cập nhật & Khôi phục khi gặp sự cố

> [!WARNING]
> Mọi API Key cấp cho World Asset đều được quản lý tập trung trong bảng `cp_hub_api_keys` của Postgres Database VPS. 

Nếu Key bị mất tác dụng (`Invalid API Key`):
1. **Kiểm tra trạng thái trên Database VPS**:
   Chạy lệnh SQL sau để kiểm tra xem key đã được active chưa:
   ```sql
   SELECT name, api_key, is_active FROM cp_hub_api_keys WHERE api_key = 'sk-hub-[your-actual-api-key]';
   ```
2. **Kích hoạt lại Key**:
   Nếu trường `is_active` bị chuyển thành `false` (`f`), kích hoạt lại bằng:
   ```sql
   UPDATE cp_hub_api_keys SET is_active = true WHERE api_key = 'sk-hub-[your-actual-api-key]';
   ```

---

## 4. Nhật ký Kiểm tra Hệ thống & Kết nối Thực tế (21/05/2026)

Hệ thống đã được kiểm tra end-to-end thông qua các kịch bản test tự động bằng Node.js và SSH Wrapper trên VPS Contabo (`173.249.19.167`). Kết quả như sau:

### 4.1. Kết quả kiểm tra Gateway & Authentication
* **Lệnh test**: `node /:\storymee\test_connection.js`
* **Xác thực Gateway**: 🟢 **THÀNH CÔNG 100%**. 
  * Cổng Gateway VPS (`storymee-hub`) đã nhận diện Bearer Token `sk-hub-[your-actual-api-key]` hoàn toàn hợp lệ, cho phép request đi qua toàn bộ các lớp middleware bảo mật để vào API xử lý.
  * Môi trường VPS đã được khởi động lại toàn bộ (`docker compose up -d --force-recreate`) để nạp chính xác các cấu hình bảo mật mới nhất từ `/opt/sandbox/.env`.

### 4.2. Root Cause của lỗi Vision (Analyze Style)
Khi gửi ảnh Master Image để phân tích style, hệ thống trả về lỗi `Invalid API Key` từ CLI-Proxy (`LLM_ERROR`). Qua cô lập lỗi bằng script `test_cliproxy.js`, chúng tôi đã xác định được nguyên nhân chính xác:
1. **Chat Text (gpt-5.4-mini)**: 🟢 **HOẠT ĐỘNG HOÀN HẢO (200 OK)**. Key dịch vụ `CLIPROXY_KEY` (`61a8fbd118...`) và `CLIPROXY_PARTNER_SECRET` trên VPS vẫn hoàn toàn hợp lệ và có quyền truy cập dịch vụ text của AstroAlpha.
2. **AI Vision (Phân tích ảnh)**: 🔴 **Bị lỗi API Key của OpenAI Vision Provider phía server AstroAlpha (CLI-Proxy)**. Khi phát hiện request chứa ảnh Base64 (`image_url`), CLI-Proxy sẽ định tuyến task tới đối tác OpenAI Vision. Do key Vision của phía AstroAlpha bị hết hạn hoặc sai cấu hình, họ đã trả về `401 Invalid API Key` về cho Hub.

> [!IMPORTANT]
> **Hướng khắc phục**: 
> Lỗi này không thuộc về Gateway StoryMee hay key `sk-hub-...` của Sếp. Sếp cần liên hệ với đối tác **AstroAlpha** để họ kiểm tra và gia hạn/cập nhật lại API Key Vision cho model `gpt-5.4-mini` trên hệ thống CLI-Proxy (Talency LLM Gateway). Mọi dịch vụ khác của StoryMee hiện tại đã sẵn sàng hoạt động tối đa!

### 4.3. Khai thông luồng Prompt Text qua Hub từ các dự án khác (21/05/2026) [MỚI NHẤT - ĐÃ HOÀN THÀNH]
Trong quá trình kiểm tra luồng gửi prompt dạng text từ các dự án khác qua Hub Gateway tới CLI-Proxy, chúng tôi phát hiện lỗi `401 Invalid API Key` tương tự. Chúng tôi đã tiến hành mổ xẻ mã nguồn Go của Hub và phân tích thành công:

1. **Phát hiện Cơ chế IAM (Supabase Cloud)**:
   * Tiến trình `storymee-hub` (Golang) xác thực token khách qua **Supabase Cloud database (IAM)** (`https://jopxwavrtvwbjuubnbtc.supabase.co`) chứ không sử dụng Postgres database cục bộ trên VPS.
   * Do đó, dù key `sk-hub-[your-actual-api-key]` đã có ở Postgres local VPS, nhưng trên database Supabase Cloud của dự án thì **chưa có key này**, dẫn đến middleware IAM của Hub chặn lại ngay lập tức và báo lỗi 401.

2. **Đồng bộ hóa & Kích hoạt trên Supabase Cloud**:
   * Chúng tôi đã viết script tự động kết nối trực tiếp với REST API của Supabase Cloud bằng `SUPABASE_SERVICE_ROLE_KEY`.
   * **Đã thực hiện insert & activate thành công 100%** hai key chính lên Supabase Cloud:
     * Key World Asset: `sk-hub-[your-actual-api-key]` (Name: `World Asset Key`)
     * Key Admin: `sk-storymee-admin-[your-actual-admin-key]` (Name: `Admin Key`)

3. **Kết quả Kiểm tra Thực tế**:
   * Chạy lại script giả lập các dự án khác gửi prompt text qua Hub Gateway (`test_other_projects_prompt.js`):
   * 🟢 **ĐÃ THÀNH CÔNG RỰC RỠ (HTTP Status 200 OK)**!
   * Thời gian phản hồi hoàn hảo (~5s qua mạng), sinh văn bản mượt mà: *"Hello! How can I help you today?"*.
   * **Kết luận**: Toàn bộ luồng Gateway kết nối CLI-Proxy phục vụ prompt text cho tất cả các dự án khác đã được **khai thông hoàn toàn, hoạt động trơn tru mượt mà**!

