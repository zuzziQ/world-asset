import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const urlParam = req.nextUrl.searchParams.get("url");
  if (!urlParam) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80";

  try {
    // 1. If it's a legacy upload (/public/uploads/), fetch from Ubuntu VPS core-media-api via dev-hub
    if (urlParam.includes("/public/uploads/")) {
      const filename = urlParam.split("/public/uploads/").pop()?.split("?")[0];
      if (filename) {
        const ubuntuUrl = `https://dev-hub.storymee.com/internal/v1/media/public/uploads/${filename}`;
        const uRes = await fetch(ubuntuUrl, { cache: "force-cache" });
        if (uRes.ok) {
          const contentType = uRes.headers.get("content-type") || "image/jpeg";
          const buffer = await uRes.arrayBuffer();
          return new NextResponse(buffer, {
            headers: {
              "Content-Type": contentType,
              "Cache-Control": "public, max-age=31536000, immutable"
            }
          });
        }
      }
    }

    // 2. If it's storage.storymee.com, fetch from Germany VPS MinIO first, then fallback to Cloudflare R2
    if (urlParam.includes("storage.storymee.com")) {
      const urlObj = new URL(urlParam);
      const deVpsUrl = `http://173.249.19.167${urlObj.pathname}${urlObj.search}`;
      
      try {
        const deRes = await fetch(deVpsUrl, {
          headers: {
            "Host": "storage.storymee.com"
          },
          cache: "force-cache"
        });

        if (deRes.ok) {
          const contentType = deRes.headers.get("content-type") || "image/jpeg";
          const buffer = await deRes.arrayBuffer();
          return new NextResponse(buffer, {
            headers: {
              "Content-Type": contentType,
              "Cache-Control": "public, max-age=31536000, immutable"
            }
          });
        }
      } catch (deErr) {
        console.warn("[ImageProxy] Germany VPS fetch error, falling back to R2:", deErr);
      }
    }

    // 3. Direct fetch from external URL (or Cloudflare R2)
    if (!urlParam.includes("flow-content.google")) {
      const extRes = await fetch(urlParam, {
        cache: "force-cache"
      });

      if (extRes.ok) {
        const contentType = extRes.headers.get("content-type") || "image/jpeg";
        const buffer = await extRes.arrayBuffer();
        return new NextResponse(buffer, {
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=31536000, immutable"
          }
        });
      }
    }

    // 4. Fallback for expired links (like flow-content.google or missing remote)
    return NextResponse.redirect(FALLBACK_IMAGE);
  } catch (err) {
    console.error("[ImageProxy] Failed to fetch image:", urlParam, err);
    return NextResponse.redirect(FALLBACK_IMAGE);
  }
}
