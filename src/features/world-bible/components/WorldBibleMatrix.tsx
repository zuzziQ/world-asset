"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useMemo, useRef } from "react";
import { 
  ArrowLeft, Save, Sparkles, BookOpen, Layers, Users, Globe, MapPin, Calendar, Loader2, Send
} from "lucide-react";
import { fetchProjects, updateProject, syncProjectToLetta, chatWithCopilot, extractBible } from "@/lib/api";
import { useProjectStore } from "@/lib/projectStore";
import { WorldBible, SerializedProjectDescription } from "../schema";

import IdentityTab from "./IdentityTab";
import RitualTab from "./RitualTab";
import PeerTab from "./PeerTab";
import LanguageTab from "./LanguageTab";
import SettingTab from "./SettingTab";
import SeasonTab from "./SeasonTab";
import OverviewTab from "./OverviewTab";

const PACO_DEFAULT_BIBLE: WorldBible = {
  coreIdentity: {
    tagline: "Say it wrong, learn it right. / Nói sai để hiểu đúng.",
    coreEngine: "Sai đúng cách có giá trị hơn đúng mà không hiểu.",
    paradox: "Con vẹt mà mọi người nghĩ nói sai có thể là người hiểu tiếng Anh sâu nhất trong nhà. Và đôi khi, chính tiếng Việt mới giải quyết được điều tiếng Anh không thể.",
    coreIpDescription: "Paco - The Unreliable Genius. Con vẹt không ai biết giới hạn kiến thức ở đâu.",
    paradigmAmbiguity: {
      level1: { name: "Sai rõ ràng (Comedy)", ratio: 60, example: "Nghe 'ice cream' -> mang đá (ice) + kem đánh răng (cream)" },
      level2: { name: "Sai có lý (Đúng context khác)", ratio: 25, example: "Nghe 'hot' (nóng) -> mang trái ớt (hot pepper)" },
      level3: { name: "Paco đúng thật", ratio: 15, example: "Mang áo mưa khi trời nắng. Chiều mưa rào." }
    }
  },
  ritualHooks: [
    { step: "R1", name: "Từ rơi vào nhà", description: "Ai đó nói từ tiếng Anh. Paco mắt mở to, đầu nghiêng 15 độ sang phải. Khán giả nhận ra: Paco nghe thấy rồi!" },
    { step: "R2", name: "Paco nghiêng đầu & lặp lại", description: "Paco lặp lại từ nhưng biến đổi (phát âm khác, ngữ điệu khác). Khoảnh khắc anticipation: Paco sẽ hiểu kiểu gì lần này?" },
    { step: "R3", name: "Paco bay đi", description: "Paco bay đi mất hút. Im lặng 3-5 giây. Tạo suspense thuần túy." },
    { step: "R4", name: "Paco trở về & Reveal", description: "Paco mang một vật thể/hành động bất ngờ. Mica phản ứng: 'Pa-cô! Sai rồi!' hoặc '...Paco biết hả?'" }
  ],
  peerGroup: {
    theme: "Thái độ với việc SAI",
    characters: [
      {
        name: "MICA",
        role: "Cô giáo nhí (4 tuổi)",
        attitude: "Sai là phải sửa ngay!",
        flaw: "Tự tin thái quá, phán xét Paco 'sai' quá nhanh, không chịu nghe sửa.",
        signatureProp: "Cuốn sổ vẽ + cây bút chì kẹp sau tai.",
        dynamic: "Dạy Bông, bảo vệ Bông; Ghen nhẹ Cam; Ngưỡng mộ + ganh tị Tú; Bực mình Mít ồn."
      },
      {
        name: "BÔNG",
        role: "Đứa trẻ sợ sai (4 tuổi)",
        attitude: "Sai thì xấu hổ lắm...",
        flaw: "Hiểu nhưng không dám nói vì sợ bị cười, đại diện cho trẻ sợ phát biểu.",
        signatureProp: "Kẹp tóc hình bông hoa nhỏ.",
        dynamic: "Nghe Mica, tin Mica; Thích Cam (vui vẻ); Sợ Tú (giỏi quá); Sợ Mít (ồn quá)."
      },
      {
        name: "CAM",
        role: "Đứa trẻ không quan tâm đúng sai (5 tuổi)",
        attitude: "Sai thì sao? Vui là được!",
        flaw: "Hời hợt, biết vài từ mỗi ngôn ngữ nửa vời. Cam làm theo Paco không suy nghĩ.",
        signatureProp: "Camera đồ chơi màu đỏ.",
        dynamic: "Chơi cùng Mica, không nghe dạy; Thích Bông, trêu nhẹ; Không quan tâm Tú; Thích Mít."
      },
      {
        name: "TÚ",
        role: "Đứa trẻ giỏi (7 tuổi)",
        attitude: "Sai là vì chưa học đủ.",
        flaw: "Đúng nhưng tẻ nhạt, condescending nhẹ. Sửa người khác tử tế nhưng kiêu ngầm.",
        signatureProp: "Cuốn sách tiếng Anh bìa xanh luôn cầm tay.",
        dynamic: "Sửa Mica (tử tế nhưng khó chịu); Giúp Bông (dễ tính); Chê Cam hời hợt; Tránh Mít ồn."
      },
      {
        name: "MÍT",
        role: "Đứa phá bĩnh (5 tuổi)",
        attitude: "Sai? Ai nói sai? Mít đúng!",
        flaw: "Giành đồ trước, bắt chước sai của Paco tạo 'tam sai' gây hỗn loạn escalation.",
        signatureProp: "Đôi dép tổ ong quá khổ của bố bảo vệ.",
        dynamic: "Giành Paco, nhưng bảo vệ Mica; Không hiểu Bông; Thích Cam; Tránh Tú."
      }
    ]
  },
  languageEngine: {
    bilingualRules: [
      { word: "CARRY", english: "carry (mang)", vietnameseExtensions: "bưng, vác, cõng, bồng, xách, gánh, khiêng, ẵm", context: "Mẹ nhờ carry, Paco mang mọi thứ cùng một cách làm đổ vỡ. Ông Sơn giải thích các sắc thái tiếng Việt." },
      { word: "EAT", english: "eat (ăn)", vietnameseExtensions: "ăn, xơi, nhậu, chén, đớp, nếm, thưởng thức, ngốn, gặm, nhấm", context: "Paco nói 'Eat!' với ông Sơn. Ông Sơn dạy: phải nói 'mời ông xơi'. Ngôn ngữ là cách đối xử." },
      { word: "RICE", english: "rice (gạo/cơm)", vietnameseExtensions: "lúa, gạo, cơm, xôi, cháo", context: "Năm giai đoạn của cùng một hạt. Ông Sơn: lúa đi từ đồng ruộng lên bàn ăn qua năm cái tên." }
    ],
    comedyFormulas: [
      { type: "Homophones", description: "Sai rõ - đồng âm thuần túy (FLOUR/FLOWER)" },
      { type: "False friends Anh-Việt", description: "Sai rõ - từ giống nhau nhưng nghĩa khác hoàn toàn" },
      { type: "Polysemy (đa nghĩa)", description: "Paco hiểu nghĩa khác, đúng context khác" },
      { type: "Literal idioms", description: "Hiểu theo nghĩa đen một cách máy móc một thành ngữ" }
    ]
  },
  settings: {
    mainSetting: "Chung cư Hà Nội tầng cao - gia đình Việt Nam hiện đại",
    culturalDetails: [
      { zone: "Trong nhà", detail: "Nồi cơm điện luôn ấm, bình nước lọc trên tủ, dép đi trong nhà xếp hàng ở cửa, bàn thờ nhỏ trên cao, quần áo phơi ban công." },
      { zone: "Ở chung cư", detail: "Thang máy chật, hành lang dài vang tiếng vọng, sảnh tầng trệt có bác bảo vệ ngồi quạt cũ, khu vui chơi thảm cao su." },
      { zone: "Ở Hà Nội", detail: "Tiếng còi xe ngoài cửa sổ, Hồ Tây đổi màu theo giờ, mùi phở sáng bay lên, tiếng rao hàng rong." }
    ],
    spatialRelations: [
      { from: "Phòng bếp", to: "Phòng khách", relation: "connected to", sharedDNA: "wooden flooring, warm ambient lighting, open space partition" },
      { from: "Ban công", to: "Phòng khách", relation: "adjacent to", sharedDNA: "large glass sliding door, high-rise Hanoi city view" }
    ]
  },
  seasonality: [
    { month: "9", event: "Khai giảng", episodeTheme: "SCHOOL - Mica chuẩn bị đi học, Paco muốn đi cùng" },
    { month: "10", event: "Trung Thu", episodeTheme: "MOON - Moon cake = bánh hình mặt trăng?" },
    { month: "1-2", event: "Tết Nguyên Đán", episodeTheme: "LUCKY MONEY - Paco nghe 'lucky' mang về đồ bất ngờ" },
    { month: "3", event: "Ngày 8/3", episodeTheme: "FLOWER - Bố mua hoa, Paco 'giúp' chọn tạo hài hước" }
  ]
};

interface WorldBibleMatrixProps {
  projectId?: string;
  hideHeader?: boolean;
}

export default function WorldBibleMatrix({ projectId, hideHeader = false }: WorldBibleMatrixProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialProjectId = projectId || searchParams.get("projectId") || "";

  const {
    projectsList,
    selectedProjectId,
    selectProject,
    loadProjects: storeLoadProjects,
    dbAssetsList
  } = useProjectStore();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "identity" | "ritual" | "peer" | "language" | "setting" | "season">("overview");

  // Sync selectedProjectId if initialProjectId changes (from prop or search param)
  useEffect(() => {
    if (initialProjectId && initialProjectId !== selectedProjectId) {
      selectProject(initialProjectId);
    }
  }, [initialProjectId]);

  // World Bible State
  const [bible, setBible] = useState<WorldBible | null>(null);
  const [rawDescText, setRawDescText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [syncingLetta, setSyncingLetta] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // AI Copilot States
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant" | "system"; content: string }>>([
    { role: "assistant", content: "Xin chào Sếp! Em là AI Copilot hỗ trợ trích xuất cấu trúc thế giới World Bible. Hãy mô tả ý tưởng, bối cảnh, nhân vật hoặc gửi kịch bản tại đây, sau đó bấm 'Trích xuất & Lưu cấu trúc' để tự động cập nhật hệ thống." }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [sendingChat, setSendingChat] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [highlightUpdated, setHighlightUpdated] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sendingChat]);

  const handleSendChat = async () => {
    const input = chatInput.trim();
    if (!input || !selectedProjectId) return;
    
    const userMsg = { role: "user" as const, content: input };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setChatInput("");
    setSendingChat(true);

    try {
      const res = await chatWithCopilot(selectedProjectId, updatedMessages, bible);
      const replyText = res?.content || res?.message?.content || res?.reply || res?.response || "Xin lỗi Sếp, em không nhận được phản hồi phù hợp.";
      setMessages(prev => [...prev, { role: "assistant" as const, content: replyText }]);
    } catch (e: any) {
      setMessages(prev => [...prev, { role: "assistant" as const, content: `❌ Lỗi gửi tin nhắn: ${e.message || e}` }]);
    } finally {
      setSendingChat(false);
    }
  };

  const handleExtractBible = async () => {
    if (!selectedProjectId) return;
    setExtracting(true);
    try {
      const res = await extractBible(selectedProjectId, messages);
      const updatedBible = res?.worldBible || res?.data?.worldBible || res;
      if (updatedBible && typeof updatedBible === "object" && (updatedBible.coreIdentity || updatedBible.ritualHooks || updatedBible.peerGroup)) {
        setBible(updatedBible);
        setIsDirty(true);
        
        // Tự động lưu cấu trúc
        const payload: SerializedProjectDescription = {
          text: rawDescText,
          worldBible: updatedBible
        };
        await updateProject(selectedProjectId, {
          description: JSON.stringify(payload)
        });
        
        // Reload projects list
        await storeLoadProjects();
        
        // Hiệu ứng nháy sáng
        setHighlightUpdated(true);
        setTimeout(() => setHighlightUpdated(false), 3000);
        
        setMessages(prev => [...prev, { role: "assistant" as const, content: "🎉 Đã trích xuất cấu trúc thế giới thành công và cập nhật trực tiếp vào World Bible Matrix! Sếp có thể thấy các thay đổi nháy sáng màu tím trên bảng dữ liệu." }]);
      } else {
        throw new Error("Dữ liệu phản hồi không đúng cấu trúc WorldBible.");
      }
    } catch (e: any) {
      alert("Lỗi khi trích xuất cấu trúc: " + e.message);
      setMessages(prev => [...prev, { role: "assistant" as const, content: `❌ Thất bại khi trích xuất cấu trúc: ${e.message}` }]);
    } finally {
      setExtracting(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId && projectsList.length > 0) {
      const proj = projectsList.find(p => p.id === selectedProjectId);
      if (proj) {
        // Check for local draft in localStorage
        const localDraft = localStorage.getItem(`STORYMEE_DRAFT_BIBLE_${selectedProjectId}`);
        if (localDraft) {
          try {
            const draft = JSON.parse(localDraft);
            if (draft && draft.bible && window.confirm("💡 Tìm thấy bản nháp chưa lưu cho dự án này trên máy của Sếp. Sếp có muốn khôi phục bản nháp này không?")) {
              setBible(draft.bible);
              setRawDescText(draft.rawDescText || "");
              setIsDirty(true);
              return;
            }
          } catch (e) {}
        }

        let descText = proj.description || "";
        let parsedBible: WorldBible | null = null;
        
        try {
          const parsed = JSON.parse(descText) as SerializedProjectDescription;
          if (parsed && typeof parsed === "object") {
            descText = parsed.text || "";
            if (parsed.worldBible) {
              parsedBible = parsed.worldBible;
            }
          }
        } catch (e) {
          // description is normal string, keep it as description text
        }

        setRawDescText(descText);
        
        if (parsedBible) {
          setBible(parsedBible);
        } else {
          // Initialize empty bible
          setBible({
            coreIdentity: {
              tagline: "",
              coreEngine: "",
              paradox: "",
              coreIpDescription: "",
              paradigmAmbiguity: {
                level1: { name: "Sai rõ ràng", ratio: 60, example: "" },
                level2: { name: "Sai có lý", ratio: 25, example: "" },
                level3: { name: "Đúng thật", ratio: 15, example: "" }
              }
            },
            ritualHooks: [],
            peerGroup: {
              theme: "",
              characters: []
            },
            languageEngine: {
              bilingualRules: [],
              comedyFormulas: []
            },
            settings: {
              mainSetting: "",
              culturalDetails: [],
              spatialRelations: []
            },
            seasonality: []
          });
        }
        setIsDirty(false); // Reset dirty state since we just loaded it from DB
      }
    }
  }, [selectedProjectId, projectsList]);

  // Auto save draft to localStorage
  useEffect(() => {
    if (selectedProjectId && bible && isDirty) {
      localStorage.setItem(`STORYMEE_DRAFT_BIBLE_${selectedProjectId}`, JSON.stringify({
        bible,
        rawDescText
      }));
    }
  }, [bible, rawDescText, selectedProjectId, isDirty]);

  // Load chat history when selectedProjectId changes
  useEffect(() => {
    if (selectedProjectId) {
      const saved = localStorage.getItem(`STORYMEE_BIBLE_CHAT_${selectedProjectId}`);
      if (saved) {
        try {
          setMessages(JSON.parse(saved));
        } catch (e) {
          setMessages([
            { role: "assistant", content: "Xin chào Sếp! Em là AI Copilot hỗ trợ trích xuất cấu trúc thế giới World Bible. Hãy mô tả ý tưởng, bối cảnh, nhân vật hoặc gửi kịch bản tại đây, sau đó bấm 'Trích xuất & Lưu cấu trúc' để tự động cập nhật hệ thống." }
          ]);
        }
      } else {
        setMessages([
          { role: "assistant", content: "Xin chào Sếp! Em là AI Copilot hỗ trợ trích xuất cấu trúc thế giới World Bible. Hãy mô tả ý tưởng, bối cảnh, nhân vật hoặc gửi kịch bản tại đây, sau đó bấm 'Trích xuất & Lưu cấu trúc' để tự động cập nhật hệ thống." }
        ]);
      }
    }
  }, [selectedProjectId]);

  // Save chat history to localStorage when messages change
  useEffect(() => {
    if (selectedProjectId && messages.length > 0) {
      localStorage.setItem(`STORYMEE_BIBLE_CHAT_${selectedProjectId}`, JSON.stringify(messages));
    }
  }, [messages, selectedProjectId]);

  const loadProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      await storeLoadProjects();
    } catch (e: any) {
      console.error("Failed to load projects:", e);
      setError(e.message || "Không thể tải danh sách dự án. Vui lòng kiểm tra lại Core API / VPS.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProject = (id: string) => {
    if (isDirty) {
      if (!window.confirm("⚠️ Sếp có các thay đổi chưa lưu! Nếu chuyển dự án, các thay đổi này sẽ bị mất. Sếp có chắc chắn muốn chuyển không?")) {
        return;
      }
    }
    selectProject(id);
    setIsDirty(false);
  };

  const handleLoadPacoTemplate = () => {
    if (window.confirm("Sếp có muốn tải mẫu thế giới Paco World Bible không? Hành động này sẽ thay thế dữ liệu thế giới hiện tại trong form nháp (chưa lưu vào DB).")) {
      setBible(JSON.parse(JSON.stringify(PACO_DEFAULT_BIBLE)));
      setActiveTab("identity");
    }
  };

  const handleSaveBible = async () => {
    if (!selectedProjectId || !bible) return;
    setSaving(true);
    try {
      // Find the current project to merge description fields (such as gflowProjectId, lettaAgentId)
      const proj = projectsList.find(p => p.id === selectedProjectId);
      let existingMeta: any = {};
      if (proj && proj.description && proj.description.trim().startsWith("{")) {
        try {
          existingMeta = JSON.parse(proj.description);
        } catch (e) {}
      }

      const payload = {
        ...existingMeta,
        text: rawDescText,
        worldBible: bible
      };

      await updateProject(selectedProjectId, {
        description: JSON.stringify(payload)
      });

      alert("🎉 Đã lưu cấu trúc thế giới vào database và tự động đồng bộ Letta thành công!");
      localStorage.removeItem(`STORYMEE_DRAFT_BIBLE_${selectedProjectId}`);
      setIsDirty(false);
      // Reload projects list to sync state
      await loadProjects();
    } catch (e: any) {
      alert("Lỗi khi lưu cấu trúc thế giới: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSyncLetta = async () => {
    if (!selectedProjectId) return;
    setSyncingLetta(true);
    try {
      const result = await syncProjectToLetta(selectedProjectId);
      alert(result.message || "🎉 Đồng bộ Letta Memory thành công!");
    } catch (e: any) {
      alert("Lỗi khi đồng bộ Letta: " + e.message);
    } finally {
      setSyncingLetta(false);
    }
  };

  const activeProject = useMemo(() => {
    return projectsList.find(p => p.id === selectedProjectId) || null;
  }, [projectsList, selectedProjectId]);

  const updateBibleState = (updatedBible: WorldBible) => {
    setBible(updatedBible);
    setIsDirty(true);
  };

  return (
    <div className={hideHeader ? "" : "min-h-screen bg-[#07070a] text-neutral-50 p-8 font-sans antialiased selection:bg-purple-600 selection:text-white"}>
      {/* HEADER SECTION */}
      {!hideHeader && (
        <header className="mb-6 border-b border-white/5 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/?projectId=${selectedProjectId}`}
              className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white transition flex items-center justify-center cursor-pointer active:scale-95"
              title="Quay lại Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black bg-gradient-to-r from-blue-400 via-purple-500 to-amber-500 bg-clip-text text-transparent uppercase tracking-wider">
                  World Bible Matrix
                </h1>
                <span className="text-[8px] bg-amber-500/10 border border-amber-500/20 text-amber-400 font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
                  Bible V3.1
                </span>
              </div>
              <p className="text-neutral-400 text-[10px] font-bold uppercase tracking-wider mt-1 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-purple-400" /> Nhập liệu & Cấu trúc hóa Thế giới Dự án
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleLoadPacoTemplate}
              className="flex items-center gap-1.5 bg-amber-950/40 hover:bg-amber-600/30 border border-amber-500/30 hover:border-amber-500 text-amber-400 hover:text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition active:scale-95 duration-200 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" /> Paco Template
            </button>

            {selectedProjectId && (
              <button
                onClick={handleSyncLetta}
                disabled={syncingLetta || saving}
                className="flex items-center gap-1.5 bg-indigo-950/40 hover:bg-indigo-650/30 border border-indigo-500/30 hover:border-indigo-500 text-indigo-450 hover:text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition active:scale-95 duration-200 cursor-pointer"
              >
                {syncingLetta ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Đồng bộ Letta...
                  </>
                ) : (
                  <>
                    🧠 Đồng bộ Letta
                  </>
                )}
              </button>
            )}
            
            <button
              onClick={handleSaveBible}
              disabled={saving || !bible || !selectedProjectId}
              className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition active:scale-95 duration-200 cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.2)]"
            >
              {saving ? "Đang lưu..." : (
                <>
                  <Save className="w-3.5 h-3.5" /> Lưu cấu trúc thế giới
                </>
              )}
            </button>
          </div>
        </header>
      )}

      {/* TWO COLUMN WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* SIDEBAR SELECT PROJECT */}
        {!projectId && (
          <div className="lg:col-span-3 flex flex-col gap-6">
            <div className="border border-white/5 rounded-3xl p-5 bg-white/[0.01] backdrop-blur-md space-y-4 shadow-xl flex flex-col h-full min-h-[500px]">
              <h2 className="text-xs font-black flex items-center gap-2 text-neutral-300 uppercase tracking-widest border-b border-white/5 pb-3">
                <Layers className="w-4 h-4 text-blue-400" /> Chọn Dự Án
              </h2>

              <div className="flex flex-col gap-2 overflow-y-auto custom-scrollbar flex-1 pr-1">
                {loading ? (
                  <div className="text-xs text-neutral-500 italic text-center py-10">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto text-neutral-400 mb-2" />
                    Đang tải dự án...
                  </div>
                ) : error ? (
                  <div className="text-xs text-red-400 font-semibold text-center py-10 px-2">
                    ⚠️ {error}
                    <button 
                      onClick={loadProjects} 
                      className="mt-3 block mx-auto px-3 py-1 rounded bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 font-bold uppercase tracking-wider text-[9px] cursor-pointer"
                    >
                      Thử lại
                    </button>
                  </div>
                ) : projectsList.length === 0 ? (
                  <div className="text-xs text-neutral-500 italic text-center py-10">Không tìm thấy dự án nào.</div>
                ) : projectsList.map((p) => {
                  const isActive = selectedProjectId === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleSelectProject(p.id)}
                      className={`p-3 rounded-2xl border transition cursor-pointer font-black text-xs ${
                        isActive 
                          ? 'bg-purple-950/20 border-purple-500/50 text-purple-300' 
                          : 'bg-black/40 border-white/5 text-neutral-400 hover:bg-white/[0.02] hover:text-neutral-200'
                      }`}
                    >
                      {p.name}
                    </div>
                  );
                })}
              </div>
              
              {activeProject && (
                <div className="border-t border-white/5 pt-4 space-y-2.5">
                  <label className="text-[8px] font-black text-neutral-500 uppercase tracking-widest">Mô tả dự án gốc {isDirty && <span className="text-amber-500 lowercase">(chưa lưu)</span>}</label>
                  <textarea
                    value={rawDescText}
                    onChange={(e) => {
                      setRawDescText(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder="Nhập mô tả tóm tắt chung về dự án..."
                    className="w-full bg-black/60 border border-white/5 rounded-xl p-2.5 text-[10px] text-neutral-300 resize-none h-24 outline-none focus:border-purple-500/30 transition custom-scrollbar font-bold"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* MAIN BIBLE EDITOR */}
        <div className={projectId ? "lg:col-span-12 flex flex-col gap-6" : "lg:col-span-9 flex flex-col gap-6"}>
          {bible ? (
            <div className="w-full flex flex-col gap-6">
              {/* Bảng matrix WorldBibleMatrix nguyên bản */}
              <div className="w-full border border-white/5 rounded-3xl p-6 bg-[#0b0b10]/40 backdrop-blur-md shadow-2xl flex flex-col min-h-[500px] h-auto space-y-5 overflow-hidden">
                
                {/* Nested Header / Actions Bar when hideHeader is true */}
                {hideHeader && (
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <div className="text-[10px] font-black uppercase text-amber-400">
                      📂 {activeProject?.name || "Bản nháp dự án"} {isDirty && <span className="text-amber-500 lowercase">(chưa lưu)</span>}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleLoadPacoTemplate}
                        className="px-3 py-1 bg-amber-950/40 hover:bg-amber-600/30 border border-amber-500/20 text-amber-400 hover:text-white rounded-lg text-[9px] font-black uppercase transition cursor-pointer"
                      >
                        Paco Template
                      </button>
                      <button
                        onClick={handleSyncLetta}
                        disabled={syncingLetta || saving}
                        className="px-3 py-1 bg-indigo-950/40 hover:bg-indigo-650/30 border border-indigo-500/20 text-indigo-400 hover:text-white rounded-lg text-[9px] font-black uppercase transition cursor-pointer"
                      >
                        {syncingLetta ? "Đang đồng bộ..." : "🧠 Đồng bộ Letta"}
                      </button>
                      <button
                        onClick={handleSaveBible}
                        disabled={saving || !bible}
                        className="px-3 py-1 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-lg text-[9px] font-black uppercase transition cursor-pointer"
                      >
                        {saving ? "Đang lưu..." : "Lưu World Bible"}
                      </button>
                    </div>
                  </div>
                )}

                {/* TABS SWITCHER */}
                <div className="grid grid-cols-4 sm:flex sm:flex-wrap gap-1 bg-black/40 p-1 rounded-xl border border-white/5 w-full">
                  {[
                    { id: "overview", label: "Overview", icon: BookOpen },
                    { id: "identity", label: "Identity", icon: Globe },
                    { id: "ritual", label: "Rituals", icon: Layers },
                    { id: "peer", label: "Peers", icon: Users },
                    { id: "language", label: "Language", icon: Sparkles },
                    { id: "setting", label: "Settings", icon: MapPin },
                    { id: "season", label: "Seasonality", icon: Calendar }
                  ].map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center justify-center gap-1 px-2 py-1 rounded-lg text-[8px] font-black uppercase transition cursor-pointer flex-1 ${
                          isActive
                            ? 'bg-purple-600 text-white font-extrabold shadow shadow-purple-500/10'
                            : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/5'
                        }`}
                      >
                        <Icon className="w-3 h-3" />
                        <span className="truncate">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* TAB CONTENT PANEL */}
                <div className={`flex-1 overflow-y-auto overflow-x-hidden pr-1 custom-scrollbar max-h-[380px] w-full transition-all duration-500 ${
                  highlightUpdated 
                    ? 'ring-2 ring-purple-500/80 bg-purple-500/10 shadow-[0_0_30px_rgba(168,85,247,0.3)] animate-pulse' 
                    : ''
                }`}>
                  
                  {activeTab === "overview" && (
                    <OverviewTab 
                      bible={bible} 
                      projectName={activeProject?.name || "Dự án"} 
                      dbAssetsList={dbAssetsList} 
                      onSwitchTab={(tabId) => setActiveTab(tabId as any)}
                    />
                  )}
                  
                  {activeTab === "identity" && (
                    <IdentityTab bible={bible} onChange={updateBibleState} />
                  )}

                  {activeTab === "ritual" && (
                    <RitualTab bible={bible} onChange={updateBibleState} />
                  )}

                  {activeTab === "peer" && (
                    <PeerTab bible={bible} onChange={updateBibleState} />
                  )}

                  {activeTab === "language" && (
                    <LanguageTab bible={bible} onChange={updateBibleState} />
                  )}

                  {activeTab === "setting" && (
                    <SettingTab bible={bible} onChange={updateBibleState} />
                  )}

                  {activeTab === "season" && (
                    <SeasonTab bible={bible} onChange={updateBibleState} />
                  )}

                </div>
              </div>
            </div>
          ) : (
            <div className="border border-white/5 rounded-3xl p-6 bg-white/[0.01] backdrop-blur-md shadow-2xl flex flex-col items-center justify-center text-center h-[500px]">
              <BookOpen className="w-16 h-16 text-neutral-700 animate-pulse mb-3" />
              <h3 className="text-sm font-black text-neutral-300 uppercase tracking-wider">Chưa tải dữ liệu thế giới</h3>
              <p className="text-xs text-neutral-500 max-w-sm mt-2">Vui lòng chọn một dự án bên sidebar hoặc nhấn nút tải mẫu Paco Template để khởi tạo cấu trúc thế giới World Bible!</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
