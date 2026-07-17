import { extractCharactersWithAI } from "@/lib/api";

export async function suggestCharacters(rawPremise: string, dbCharacters: string[]): Promise<string[]> {
  let finalNames: string[] = [];
  try {
    finalNames = await extractCharactersWithAI(rawPremise, dbCharacters);
  } catch (err) {
    console.error("LLM character extraction failed, using heuristic fallback", err);
  }

  const lowerPremise = rawPremise.toLowerCase();
  if (lowerPremise.includes("wollfie") || lowerPremise.includes("wolfie") || lowerPremise.includes("wolfi")) {
    if (!finalNames.some(n => n.toLowerCase() === "wolfie")) {
      finalNames.push("Wolfie");
    }
  }
  if (lowerPremise.includes("chole") || lowerPremise.includes("chloe") || lowerPremise.includes("cloe")) {
    if (!finalNames.some(n => n.toLowerCase() === "chloe")) {
      finalNames.push("Chloe");
    }
  }
  if (lowerPremise.includes("kilo") || lowerPremise.includes("killo")) {
    if (!finalNames.some(n => n.toLowerCase() === "kilo")) {
      finalNames.push("Kilo");
    }
  }
  if (lowerPremise.includes("bruno")) {
    if (!finalNames.some(n => n.toLowerCase() === "bruno")) {
      finalNames.push("Bruno");
    }
  }

  if (!finalNames || finalNames.length === 0) {
    const matchedFromDb = dbCharacters.filter(name => {
      const escaped = name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'i');
      return regex.test(rawPremise);
    });

    const bulletMatches: string[] = [];
    const lines = rawPremise.split("\n");
    lines.forEach(line => {
      const match = line.match(/^\s*[-\*•]?\s*([A-Z][a-zA-Z0-9_À-ỹ]+)(?:\s*[\(\:]|\s*$)/);
      if (match && match[1]) {
        const name = match[1].trim();
        const localBlacklist = ["Tôi", "Cảnh", "Phân", "Thám", "Tập", "Hai", "Một", "Chúng", "Khi", "Nhân", "Vật", "Nút", "Thắt", "Cảm", "Xúc", "Bối", "Phim", "Ngắn", "Trinh", "Viết", "Quy", "Kịch", "Thời", "Lượng", "Tuổi", "Nội", "Dung", "Mất", "Tích", "Cần", "Đơn", "Giản", "Súc", "Chiều", "Sâu", "Quy", "Mô", "Nhỏ", "Hoặc", "Vừa", "Để", "Dễ", "Theo", "Dõi", "Với", "Bộ", "Mèo", "Chó", "Sói", "Hải", "Ly", "Cái", "Cô", "Bé", "Gái", "Dễ", "Thương"];
        if (!localBlacklist.includes(name)) {
          bulletMatches.push(name);
        }
      }
    });

    const words = rawPremise.split(/[\s,.\-!?;:()]+/);
    const wordBlacklist = [
      "Tôi", "Cảnh", "Phân", "Thám", "Tập", "Hai", "Một", "Chúng", "Khi", "Nhân", "Vật", "Nút", "Thắt", "Cảm", "Xúc", "Bối",
      "Viết", "Kịch", "Bản", "Phim", "Ngắn", "Trinh", "Yêu", "Cầu", "Sau", "Fiction", "Thời", "Lượng", "Phút", "Cho", "Trẻ",
      "Em", "Tuổi", "Nội", "Dung", "Xoay", "Quanh", "Việc", "Mất"
    ];
    const capitalizedWords = Array.from(new Set(words.filter(w => {
      if (!w) return false;
      if (wordBlacklist.includes(w)) return false;
      const firstChar = w.charAt(0);
      return firstChar === firstChar.toUpperCase() && firstChar !== firstChar.toLowerCase();
    })));

    finalNames = Array.from(new Set([...matchedFromDb, ...bulletMatches, ...capitalizedWords]));
  }
  return finalNames;
}
