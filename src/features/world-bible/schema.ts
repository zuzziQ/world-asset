export interface AmbiguityLevel {
  name: string;   // Ví dụ: "Sai rõ ràng (Comedy)"
  ratio: number;  // Tỷ lệ phần trăm, ví dụ: 60
  example: string;// Ví dụ: "ice cream -> đá + kem đánh răng"
}

export interface RitualHookStep {
  step: string;        // Ví dụ: R1, R2, R3, R4
  name: string;        // Tên nhịp, Ví dụ: "Từ rơi vào nhà"
  description: string; // Chi tiết hành động
}

export interface PeerCharacter {
  name: string;
  role: string;          // Vai trò / Tuổi
  attitude: string;      // Thái độ với core theme (e.g. "Sai là phải sửa ngay!")
  flaw: string;          // Điểm yếu tính cách (e.g. "Tự tin thái quá, không nghe sửa")
  signatureProp: string; // Đạo cụ đặc trưng (e.g. "Cuốn sổ vẽ + bút chì kẹp tai")
  dynamic: string;       // Mối quan hệ với các nhân vật khác
}

export interface BilingualRule {
  word: string;                // Từ khóa, ví dụ: "CARRY"
  english: string;             // Nghĩa tiếng Anh
  vietnameseExtensions: string;// Các từ mở rộng tiếng Việt, ví dụ: "bưng, vác, cõng, bồng..."
  context: string;             // Ngữ cảnh minh họa
}

export interface ComedyFormula {
  type: string;        // Ví dụ: Homophones, False friends...
  description: string; // Mô tả cơ chế gây cười
}

export interface CulturalZoneDetail {
  zone: string;   // Ví dụ: "Trong nhà", "Ở chung cư", "Ở Hà Nội"
  detail: string; // Các chi tiết đặc trưng (Nồi cơm luôn ấm, bình nước lọc...)
}

export interface SpatialRelation {
  from: string;    // Bối cảnh A (Ví dụ: "Phòng bếp")
  to: string;      // Bối cảnh B (Ví dụ: "Phòng khách")
  relation: string; // Quan hệ (Ví dụ: "connected to", "adjacent to")
  sharedDNA: string; // Điểm chung thiết kế (Ví dụ: "wooden flooring, warm lighting")
}

export interface CharacterRelationship {
  from: string;
  to: string;
  relation: string; // Bạn bè, Đối thủ, Gia đình...
  description: string;
}

export interface SeasonalEvent {
  month: string;        // Tháng (1-12) hoặc Mùa
  event: string;        // Tên sự kiện (Khai giảng, Trung thu...)
  episodeTheme: string; // Chủ đề / Kịch bản liên quan
}

export interface WorldBible {
  coreIdentity: {
    tagline: string;
    coreEngine: string;
    paradox: string;
    coreIpDescription: string;
    paradigmAmbiguity: {
      level1: AmbiguityLevel;
      level2: AmbiguityLevel;
      level3: AmbiguityLevel;
    }
  };
  ritualHooks: RitualHookStep[];
  peerGroup: {
    theme: string; // Ví dụ: "Thái độ với việc SAI"
    characters: PeerCharacter[];
  };
  languageEngine: {
    bilingualRules: BilingualRule[];
    comedyFormulas: ComedyFormula[];
  };
  settings: {
    mainSetting: string; // Bối cảnh chính, ví dụ: "Chung cư Hà Nội tầng cao"
    culturalDetails: CulturalZoneDetail[];
    spatialRelations?: SpatialRelation[];
    characterRelationships?: CharacterRelationship[];
  };
  seasonality: SeasonalEvent[];
}

export interface SerializedProjectDescription {
  text: string;             // Mô tả văn bản của dự án
  worldBible?: WorldBible;  // Thông tin cấu trúc thế giới
}
