// Clean-room constants and helpers extracted from xray page.tsx to optimize size and architecture

// Premium Drama Art Styles library
export const INITIAL_DRAMA_ART_STYLES = [
  {
    id: "3d_american",
    name: "Disney Pixar",
    category: "3d",
    emoji: "🧸",
    description: "Bright colors, cute expressive eyes, soft textures",
    token: "Disney Pixar style 3D animation, expressive character design, large eyes, subsurface scattering skin, vibrant colors, warm lighting, cute, 3d render, cgsociety"
  },
  {
    id: "3d_xuanhuan",
    name: "3D Chinese Fantasy",
    category: "3d",
    emoji: "🐉",
    description: "Chinese Xianxia style, Unreal Engine 5 render, flowing silk",
    token: "stunning stylized 3D Chinese animation character render, Unreal Engine 5 style, cinematic lighting, soft volumetric fog, smooth porcelain skin texture, intricate traditional Chinese fabric details, flowing robes, ethereal atmosphere"
  },
  {
    id: "3d_render_2d",
    name: "Genshin Toon",
    category: "3d",
    emoji: "✨",
    description: "Anime cel-shaded 3D model, clean outline",
    token: "cel shaded 3D, Genshin Impact style, anime style 3d rendering, clean lines, vibrant anime colors, toon shading"
  },
  {
    id: "3d_realistic",
    name: "3D Unreal 5",
    category: "3d",
    emoji: "🎮",
    description: "Hyper-realistic 3D, ray tracing, cinematic",
    token: "photorealistic 3D render, hyperrealistic details, Unreal Engine 5, cinematic lighting, ray tracing, highly detailed texture, pores, imperfections, sharp focus"
  },
  {
    id: "3d_q_version",
    name: "3D Blind Box",
    category: "3d",
    emoji: "📦",
    description: "Pop Mart style, plastic toy material, C4D",
    token: "Pop Mart blind box style, chibi 3d rendering, Oc render, soft studio lighting, plastic material, smooth texture, cute, c4d render"
  },
  {
    id: "2d_ghibli",
    name: "Ghibli Watercolor",
    category: "2d",
    emoji: "🌳",
    description: "Hayao Miyazaki watercolor aesthetic, fresh nature",
    token: "Studio Ghibli style, Hayao Miyazaki, hand painted watercolor background, peaceful nature atmosphere, soft colors, charming characters"
  },
  {
    id: "2d_movie",
    name: "Makoto Shinkai",
    category: "2d",
    emoji: "🌌",
    description: "Cinematic sky, sentimental glow",
    token: "Makoto Shinkai style, breathtaking cinematic lighting, highly detailed background, clouds, starry sky, sentimental atmosphere, anime movie still"
  },
  {
    id: "2d_korean",
    name: "Manhwa Webtoon",
    category: "2d",
    emoji: "📕",
    description: "Premium digital coloring, sharp handsome features",
    token: "premium Webtoon style, sharp handsome facial features, detailed digital coloring, manhwa aesthetic"
  },
  {
    id: "2d_american",
    name: "Cartoon Network",
    category: "2d",
    emoji: "📺",
    description: "Bold thick outlines, exaggerated expressions",
    token: "Cartoon Network style, bold thick outlines, exaggerated expressions, western cartoon aesthetic, flat colors, energetic"
  },
  {
    id: "clay_stop_motion",
    name: "Claymation",
    category: "stop_motion",
    emoji: "🥎",
    description: "Aardman style playdough, fingerprint textures",
    token: "Aardman style claymation, plasticine material, visible fingerprints and imperfections, soft clay texture, handmade, cute"
  }
];

// Rich camera and character tagging presets
export const CHARACTER_TAGS = {
  emotion: [
    { id: "emo_hap", label: "Happy", emoji: "😊", token: "happy smiling expression, friendly warm look" },
    { id: "emo_smi", label: "Smiling", emoji: "🙂", token: "subtle smiling expression" },
    { id: "emo_lau", label: "Laughing", emoji: "😆", token: "joyful laughing expression, eyes closed laughing" },
    { id: "emo_sad", label: "Sad", emoji: "😢", token: "sad somber look, teary eyes, downcast expression" },
    { id: "emo_ang", label: "Angry", emoji: "😠", token: "angry fierce intense facial expression, furrowed brows" },
    { id: "emo_det", label: "Determined", emoji: "✊", token: "determined confident facial expression, focused look" },
    { id: "emo_smk", label: "Smirking", emoji: "😏", token: "smirking expression, cunning and planning look" },
    { id: "emo_cry", label: "Crying", emoji: "😭", token: "crying with tears streaming down face" },
    { id: "emo_shk", label: "Shocked", emoji: "😲", token: "shocked expression, wide eyes open" },
    { id: "emo_sur", label: "Surprised", emoji: "😮", token: "surprised expression" },
    { id: "emo_cnf", label: "Confused", emoji: "🤔", token: "confused pensive expression" },
  ],
  action: [
    { id: "act_run", label: "Running", emoji: "🏃", token: "running posture, dynamic high-speed motion scene" },
    { id: "act_wlk", label: "Walking", emoji: "🚶", token: "walking posture, natural stride" },
    { id: "act_cmbt", label: "Combat Pose", emoji: "⚔️", token: "dynamic combat action pose, martial arts stance" },
    { id: "act_cast", label: "Magic Cast", emoji: "🔮", token: "casting magical spells, glowing spell circle in hands" },
    { id: "act_prop", label: "Holding Item", emoji: "🎒", token: "holding standard prop tool" },
    { id: "act_fly", label: "Flying", emoji: "🦅", token: "flying posture, gliding through air" },
    { id: "act_slp", label: "Sleeping", emoji: "😴", token: "sleeping peacefully, eyes closed" },
    { id: "act_sit", label: "Sitting", emoji: "🪑", token: "sitting posture, relaxed" },
    { id: "act_jmp", label: "Jumping", emoji: "🦘", token: "jumping in the air, dynamic pose" },
  ],
  camera: [
    { id: "cam_ecu", label: "Extreme Close-up", emoji: "👁️", token: "extreme close-up face shot, focusing on eyes and face details" },
    { id: "cam_cu", label: "Close-up Portrait", emoji: "🧑", token: "close-up head and shoulders portrait shot" },
    { id: "cam_med", label: "Medium Shot", emoji: "👕", token: "medium shot, waist-up composition" },
    { id: "cam_fb", label: "Full Body Shot", emoji: "🚶", token: "full body shot, showing entire character from head to toe" },
    { id: "cam_wid", label: "Wide Angle", emoji: "🏔️", token: "wide angle scenic dynamic shot" },
    { id: "cam_ots", label: "Over-the-shoulder", emoji: "🗣️", token: "over-the-shoulder shot perspective" },
    { id: "cam_low", label: "Low Angle", emoji: "👇", token: "low angle camera perspective looking up, heroic" },
    { id: "cam_high", label: "High Angle", emoji: "👆", token: "high angle camera perspective looking down" },
    { id: "cam_dutch", label: "Dutch Angle", emoji: "📐", token: "cinematic dutch angle tilt shot" },
    { id: "cam_side", label: "Side Profile", emoji: "👤", token: "side profile view shot" },
  ],
  environment: [
    { id: "env_sun", label: "Sunny Day", emoji: "☀️", token: "bright sunny daylight, clear blue sky" },
    { id: "env_ngt", label: "Night Time", emoji: "🌙", token: "night time scene, moody moonlight, stars" },
    { id: "env_rn", label: "Raining", emoji: "🌧️", token: "heavy rain falling, wet ground, dramatic raindrops" },
    { id: "env_ind", label: "Indoor Room", emoji: "🏠", token: "inside a cozy room, indoor setting" },
    { id: "env_frst", label: "Forest", emoji: "🌲", token: "deep inside a dense forest, trees and foliage background" },
    { id: "env_cyb", label: "Cyberpunk City", emoji: "🌃", token: "futuristic cyberpunk city streets, neon lights" },
  ]
};

export const LOCATION_TAGS = {
  time: [
    { id: "tim_day", label: "Daylight", emoji: "☀️", token: "bright daylight lighting" },
    { id: "tim_ngt", label: "Night Time", emoji: "🌙", token: "mysterious night setting, glowing accent lights" },
    { id: "tim_gld", label: "Golden Hour", emoji: "🌅", token: "golden hour warm sunlight, beautiful sunset glow" },
    { id: "tim_twi", label: "Twilight Dusk", emoji: "🌆", token: "twilight dusk blue hour atmospheric lighting" },
  ],
  weather: [
    { id: "wth_clr", label: "Clear Sky", emoji: "🌌", token: "clear atmospheric sky" },
    { id: "wth_rn", label: "Heavy Rain", emoji: "🌧️", token: "heavy rain pouring down, moody environment" },
    { id: "wth_snw", label: "Snowing", emoji: "❄️", token: "snow falling, ground covered in white snow" },
  ],
  atmosphere: [
    { id: "atm_cyb", label: "Cyberpunk", emoji: "💜", token: "cyberpunk aesthetic, glowing hologram details" },
    { id: "atm_crp", label: "Creepy/Horror", emoji: "💀", token: "creepy horror atmosphere, eerie shadow play" },
    { id: "atm_pcl", label: "Peaceful", emoji: "🍃", token: "peaceful tranquil calm environment" },
  ],
  camera: [
    { id: "cam_est", label: "Establishing Shot", emoji: "🏠", token: "grand establishing shot of the entire location" },
    { id: "cam_brd", label: "Bird's-eye View", emoji: "🦅", token: "top-down bird's-eye panoramic view" },
    { id: "cam_low_loc", label: "Low Angle", emoji: "👇", token: "low angle cinematic perspective looking up" },
    { id: "cam_high_loc", label: "High Angle", emoji: "👆", token: "high angle panoramic layout looking down" },
  ]
};

export const PROP_TAGS = {
  condition: [
    { id: "con_new", label: "Brand New", emoji: "✨", token: "brand new polished pristine condition" },
    { id: "con_brk", label: "Broken/Damaged", emoji: "💥", token: "broken damaged cracked pieces" },
  ],
  material: [
    { id: "mat_mtl", label: "Metallic", emoji: "🪙", token: "metallic polished texture, reflective" },
    { id: "mat_wdn", label: "Wooden", emoji: "🪵", token: "organic weathered wooden material" },
    { id: "mat_glo", label: "Glowing Energy", emoji: "🔋", token: "glowing magical energy core, pulsating light" },
  ],
  perspective: [
    { id: "per_iso", label: "Isometric", emoji: "📐", token: "isometric 3d angle view" },
  ]
};

// Helper function to compress large uploaded images to prevent Gateway 413 Payload Too Large
export const compressImage = (base64Str: string, maxDimension = 800, quality = 0.75): Promise<string> => {
  return new Promise((resolve) => {
    if (!base64Str.startsWith("data:image/")) {
      resolve(base64Str);
      return;
    }
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      } else {
        resolve(base64Str);
      }
    };
    img.onerror = () => {
      resolve(base64Str);
    };
  });
};

// Helper function to normalize internal / docker URLs into public gateway URLs to prevent broken image renders
export const normalizeImageUrl = (url: string | null | undefined): string => {
  if (!url) return "";
  
  // Tránh xử lý base64 data URLs
  if (url.startsWith("data:image/")) {
    return url;
  }
  
  // Lấy API Gateway domain làm domain public chuẩn
  const rawUrl = process.env.NEXT_PUBLIC_CORE_API_URL || "https://dev-hub.storymee.com";
  const cleanUrl = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;
  const gatewayBaseUrl = cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
  const publicOrigin = new URL(gatewayBaseUrl).origin; // Ví dụ: "https://dev-hub.storymee.com"
  
  // 1. Kiểm tra xem URL có chứa domain Docker nội bộ hoặc domain riêng tư không
  // Ví dụ: "https://dev-hub.storymee.com/public/uploads/..." hoặc "http://core-api:4500/public/uploads/..."
  if (url.includes("dev-hub.storymee.com") || url.includes("core-api:4500") || url.includes("localhost:4500") || url.includes("127.0.0.1:4500") || url.includes("127.0.0.1") || url.includes("core-api")) {
    // Trích xuất path phía sau domain nội bộ (ví dụ: "/public/uploads/1779355801754-706837430.jpeg")
    const match = url.match(/(?:\/public\/uploads\/.*|\/uploads\/.*)/);
    if (match) {
      // Xoá bỏ "/api" thừa thãi, trả về đúng gốc public của server
      return `${publicOrigin}${match[0].startsWith('/public') ? '' : '/public'}${match[0]}`;
    }
  }
  
  // 2. Nếu là đường dẫn tương đối (relative path)
  if (url.startsWith("/public/uploads/") || url.startsWith("/uploads/")) {
    return `${publicOrigin}${url.startsWith('/public') ? '' : '/public'}${url}`;
  }
  
  return url;
};
