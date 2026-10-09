import { NextResponse } from 'next/server';

// API URL và Key của Hub API
const getApiBaseUrl = () => {
  const rawUrl = process.env.NEXT_PUBLIC_CORE_API_URL || 'https://dev-hub.storymee.com';
  return rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;
};
const API_BASE_URL = getApiBaseUrl();
const HUB_API_KEY = process.env.HUB_API_KEY || process.env.NEXT_PUBLIC_HUB_API_KEY || '';

export async function POST(req: Request) {
  const logs: string[] = [];
  logs.push('[System] Khởi động động cơ phân tích Style DNA của Google Flow...');
  
  try {
    const body = await req.json();
    const { imageUrl, brief, assetType, accessToken: clientAccessToken, model } = body;
    
    if (!imageUrl) {
      return NextResponse.json({ error: 'Thiếu URL ảnh neo gốc.' }, { status: 400 });
    }

    let accessToken: string | null = clientAccessToken || null;

    if (accessToken) {
      logs.push('[Extension] Kết nối thành công với GFlow Extension!');
      logs.push('[Extension] Đã nhận được Google Labs OAuth Session Token đang hoạt động.');
    } else {
      logs.push('[Extension] Không tìm thấy GFlow Extension đang hoạt động trên trình duyệt.');
      logs.push('[Direct API] Tự động kích hoạt luồng Phân Tích Trực Tiếp thông qua Core AI Engine...');
    }

    const isCharacter = assetType === 'character';
    const isLocation = assetType === 'location';
    const isProp = assetType === 'prop';
    const hasBrief = brief && brief.trim().length > 0;

    let customSystemInstruction = "";
    let customPrompt = "";

    if (isCharacter) {
      customSystemInstruction = "You are a professional character concept artist and visual DNA analyst. Your job is to strictly analyze the reference character image and synthesize a Character Design Summary based on the Mica framework.";
      customPrompt = `Analyze the character image and extract its core structural design DNA. Combine it with the following Character Bible/Brief if provided:
[CHARACTER BIBLE/BRIEF]:
${brief || "None"}

OUTPUT FORMAT — Return ONLY this markdown structure, nothing else:

## Proportions
[Describe body proportions, build, height, and physical structure. Bold 3 key descriptors.]

## Face & Eyes
[Describe facial features, eye shape/color, expression, and distinct facial marks. Bold 3 key descriptors.]

## Hair Style
[Describe hair style, texture, length, tuft, and color. Bold 3 key descriptors.]

## Outfit & Colors
[Describe the clothing style, layers, specific garments, and dominant outfit colors. Bold 3 key descriptors.]

## Silhouette & Shapes
[Describe the overall silhouette, geometric shapes dominating the design, and visual weight. Bold 3 key descriptors.]

## Do's & Dont's
[List 1-2 critical rules for rendering this character (e.g. Do keep the messy hair, Don't add realistic skin textures). Bold 3 key descriptors.]

FORMATTING RULES:
- Bold exactly 3 single-word keywords per section using **keyword** syntax. The 3 bold keywords MUST be integrated naturally INSIDE the description sentences. Do NOT list or append the bold keywords at the end of the description. For example, write "... **messy** black hair..." instead of "... black hair. messy".`;
    } else if (isLocation) {
      customSystemInstruction = "You are a professional environment designer and visual DNA analyst. Your job is to strictly analyze the reference image and synthesize a structured Location DNA Bible.";
      customPrompt = `Analyze the reference location/environment image and produce an Environment Design Summary based on the 6-Dimension framework. Combine it with the following Environment Bible/Brief if provided:
[ENVIRONMENT BIBLE/BRIEF]:
${brief || "None"}

OUTPUT FORMAT — Return ONLY this markdown structure, nothing else:

## Architecture & Layout
[Describe the architectural style, layout, building type, structures, and spatial elements. Bold 3 key descriptors.]

## Materials & Textures
[Describe the textures, surface materials (e.g., concrete, wood, metallic sheen), and physical composition. Bold 3 key descriptors.]

## Colors & Palette
[Describe the color harmony, dominant tones, and saturation rules. Bold 3 key descriptors.]

## Lighting & Shadows
[Describe the light quality, light sources, direction, and shadow behaviors. Bold 3 key descriptors.]

## Atmosphere & Mood
[Describe the general mood, emotional tone, attitude, and vibe of the space. Bold 3 key descriptors.]

## Do's & Dont's
[List 1-2 critical rules for rendering this location (e.g. Do keep the volumetric fog, Don't use bright daylight). Bold 3 key descriptors.]

FORMATTING RULES:
- Bold exactly 3 single-word keywords per section using **keyword** syntax. The 3 bold keywords MUST be integrated naturally INSIDE the description sentences. Do NOT list or append the bold keywords at the end of the description. For example, write "... **concrete** wall..." instead of "... wall. concrete".`;
    } else if (isProp) {
      customSystemInstruction = "You are a professional 3D prop designer and visual DNA analyst. Your job is to strictly analyze the reference image and synthesize a structured Prop DNA Bible.";
      customPrompt = `Analyze the reference prop/object image and produce a Prop Design Summary based on the 6-Dimension framework. Combine it with the following Prop Bible/Brief if provided:
[PROP BIBLE/BRIEF]:
${brief || "None"}

OUTPUT FORMAT — Return ONLY this markdown structure, nothing else:

## Shapes & Form
[Describe the geometric shapes, overall silhouette, and structural form. Bold 3 key descriptors.]

## Materials & Finish
[Describe the physical materials, surface finish (e.g. glossy, matte, rough), and texture. Bold 3 key descriptors.]

## Functional Details
[Describe functional parts, mechanical joints, buttons, or distinctive design accents. Bold 3 key descriptors.]

## Colors & Wear
[Describe the dominant colors, painted elements, and signs of wear/tear (e.g. scratches, dirt). Bold 3 key descriptors.]

## Scale & Proportions
[Describe the relative scale, weight distribution, and prominent proportional features. Bold 3 key descriptors.]

## Do's & Dont's
[List 1-2 critical rules for rendering this prop (e.g. Do keep the metallic sheen, Don't add modern sci-fi glowing parts). Bold 3 key descriptors.]

FORMATTING RULES:
- Bold exactly 3 single-word keywords per section using **keyword** syntax. The 3 bold keywords MUST be integrated naturally INSIDE the description sentences. Do NOT list or append the bold keywords at the end of the description. For example, write "... **glossy** metallic finish..." instead of "... finish. glossy".`;
    } else {
      customSystemInstruction = `You are a visual design analyst. Your job is to synthesize a cohesive Style Summary from a set of images.
- Be extremely literal and specific about what you observe — avoid generic or vague language.
- Synthesize patterns across ALL images into a unified creative direction, not per-image descriptions.
- Write in a confident, editorial tone appropriate for a creative brief.`;
      customPrompt = `Analyze the reference image and produce a Style Summary. Combine it with the following Style Bible/Brief if provided:
[STYLE BIBLE/BRIEF]:
${brief || "None"}

OUTPUT FORMAT — Return ONLY this markdown structure, nothing else:

## Visual Style
[1-2 sentences describing the overall aesthetic, genre, and visual identity. Bold 3 keywords.]

## Composition
[1-2 sentences on framing, layout, subject placement, and spatial relationships. Bold 3 keywords.]

## Attitude
[1-2 sentences on mood, emotion, tone, and energy conveyed. Bold 3 keywords.]

## Colors
[1-2 sentences on dominant palette, color harmony, saturation, and contrast. Bold 3 keywords.]

## Lighting
[1-2 sentences on light quality, direction, shadow behavior, and temperature. Bold 3 keywords.]

## Camera
[1-2 sentences on lens perspective, depth of field, distance, and angle. Bold 3 keywords.]

FORMATTING RULES:
- Bold exactly 3 single-word keywords per section using **keyword** syntax. The 3 bold keywords MUST be integrated naturally INSIDE the description sentences. Do NOT list or append the bold keywords at the end of the description. For example, write "... overall **cinematic** atmosphere..." instead of "... atmosphere. cinematic".`;
    }

    // Nếu tìm thấy token, thử gửi trực tiếp lên Google API
    if (accessToken) {
      logs.push('[Google Flow] Thiết lập Secure Proxy Tunnel tới aisandbox-pa.googleapis.com...');
      
      // Chuyển ảnh sang Base64
      let base64Image = '';
      let mimeType = 'image/png';

      if (imageUrl.startsWith('data:image')) {
        const match = imageUrl.match(/^data:([^;]+);base64,(.+)$/);
        if (match) {
          mimeType = match[1];
          base64Image = match[2];
        }
      } else {
        try {
          logs.push('[Payload] Đang tải ảnh neo gốc về để mã hóa Base64...');
          const imgRes = await fetch(imageUrl);
          if (imgRes.ok) {
            const buffer = await imgRes.arrayBuffer();
            base64Image = Buffer.from(buffer).toString('base64');
            const contentType = imgRes.headers.get('content-type');
            if (contentType) mimeType = contentType;
          }
        } catch (e) {
          logs.push('[Warning] Không thể tự động convert ảnh sang base64.');
        }
      }

      if (base64Image) {
        logs.push('[Google Flow] Gọi trực tiếp API flow:generateContent...');

        // Payload của Google Flow Style Writer
        const payload = {
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: customPrompt
                },
                {
                  inlineData: {
                    data: base64Image,
                    mimeType: mimeType
                  }
                }
              ]
            }
          ],
          systemInstruction: {
            parts: [
              {
                text: customSystemInstruction
              }
            ]
          },
          requestContext: {
            flowSdkInfo: {
              appletId: "0c1b03b1-d77e-42ff-97fe-5efb35ac9aa7",
              appletVersionId: "6ccc26a2-8443-45be-bd29-8c5ba85ff399"
            }
          }
        };

        try {
          const googleRes = await fetch('https://aisandbox-pa.googleapis.com/v1/flow:generateContent', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`,
              'Origin': 'https://labs.google',
              'Referer': 'https://labs.google/'
            },
            body: JSON.stringify(payload)
          });

          if (googleRes.ok) {
            const googleData = await googleRes.json();
            const textContent = googleData.candidates?.[0]?.content?.parts?.[0]?.text;
            if (textContent) {
              logs.push('[Google Flow] Nhận phản hồi thành công từ Google Labs Style DNA Writer!');
              const cleanText = textContent.replace(/```(markdown|json)?/g, '').replace(/```/g, '').trim();
              return NextResponse.json({
                success: true,
                stylePrompt: cleanText,
                logs: [...logs, '[Success] Đồng bộ hóa Style DNA từ Google Flow thành công 100%!']
              });
            }
          } else {
            logs.push(`[Google Flow] Lỗi xác thực hoặc hết hạn phiên (Status ${googleRes.status}).`);
            logs.push('[Direct API] Tự động chuyển sang luồng Phân Tích Trực Tiếp bằng Core AI Engine...');
          }
        } catch (fetchErr: any) {
          logs.push(`[Google Flow] Lỗi kết nối API Google: ${fetchErr.message}.`);
          logs.push('[Direct API] Tự động chuyển sang luồng Phân Tích Trực Tiếp bằng Core AI Engine...');
        }
      }
    }

    // DIRECT API: Kích hoạt Gemini Vision AI qua Hub API sử dụng bộ prompt & system instruction gốc của Google Flow!
    logs.push('[Direct API] Khởi tạo Core AI Engine với System Instruction gốc của Google Labs Style Writer...');
    logs.push('[AI Vision] Đang tiến hành phân tích style ảnh neo gốc và tự động trích xuất Style DNA...');
    
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (HUB_API_KEY) headers['Authorization'] = `Bearer ${HUB_API_KEY}`;

    const analyzeRes = await fetch(`${API_BASE_URL}/internal/v1/asset/world/analyze-style`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ 
        imageUrl,
        systemInstruction: customSystemInstruction,
        prompt: customPrompt,
        model: model || "google-labs-ultra",
        assetType,
        brief
      })
    });

    if (analyzeRes.ok) {
      const analyzeData = await analyzeRes.json();
      let stylePromptResult = analyzeData.data?.stylePrompt || analyzeData.stylePrompt || '';
      stylePromptResult = stylePromptResult.replace(/```(markdown|json)?/g, '').replace(/```/g, '').trim();
      
      logs.push('[Success] Core AI Engine trích xuất Style DNA thành công!');
      return NextResponse.json({
        success: true,
        stylePrompt: stylePromptResult,
        logs: [...logs, '[Success] Tự động đồng bộ Style DNA về World Asset hoàn tất!']
      });
    } else {
      let errMsg = 'Lỗi kết nối Core AI Engine phân tích DNA.';
      try {
        const errJson = await analyzeRes.json();
        errMsg = errJson.message || errJson.error || errMsg;
      } catch (e) {}
      logs.push(`[Error] Core AI Engine trả về mã lỗi ${analyzeRes.status}: ${errMsg}`);
      return NextResponse.json({
        success: false,
        error: errMsg,
        logs
      }, { status: 500 });
    }

  } catch (err: any) {
    logs.push(`[Error] Lỗi nghiêm trọng trong quá trình xử lý: ${err.message}`);
    return NextResponse.json({
      success: false,
      error: err.message,
      logs
    }, { status: 500 });
  }
}
