"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { MessageSquare, X, Send, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { useProjectStore } from "@/lib/projectStore";
import { chatWithCopilot, extractBible, fetchScenes, updateProject } from "@/lib/api";

export default function FloatingCopilotChat() {
  const {
    projectsList,
    selectedProjectId,
    episodes,
    selectedEpisodeId,
    loadProjects
  } = useProjectStore();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant" | "system"; content: string }>>([]);
  const [chatInput, setChatInput] = useState("");
  const [sendingChat, setSendingChat] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [scenes, setScenes] = useState<any[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Lấy project và episode hiện tại
  const activeProject = useMemo(() => {
    return projectsList.find(p => p.id === selectedProjectId) || null;
  }, [projectsList, selectedProjectId]);

  const activeEpisode = useMemo(() => {
    return episodes.find(e => e.id === selectedEpisodeId) || null;
  }, [episodes, selectedEpisodeId]);

  // Load scenes khi selectedEpisodeId thay đổi
  useEffect(() => {
    if (selectedEpisodeId) {
      fetchScenes(selectedEpisodeId).then(setScenes).catch(console.error);
    } else {
      setScenes([]);
    }
  }, [selectedEpisodeId]);

  // Kiểm tra xem dự án có trống (Greenfield) hay có sẵn dữ liệu (Brownfield)
  const isProjectNew = useMemo(() => {
    if (!activeProject) return true;
    
    // Nếu chưa có mô tả hoặc mô tả rỗng/không chứa worldBible
    let hasBible = false;
    if (activeProject.description) {
      try {
        const parsed = JSON.parse(activeProject.description);
        if (parsed && parsed.worldBible && Object.keys(parsed.worldBible).length > 0) {
          hasBible = true;
        }
      } catch (e) {}
    }
    const hasEps = episodes.length > 0;
    return !hasBible && !hasEps;
  }, [activeProject, episodes]);

  // Hàm sinh tin nhắn chào mừng thông minh dựa trên trạng thái dự án
  const welcomeMessage = useMemo(() => {
    if (!selectedProjectId) {
      return {
        role: "assistant" as const,
        content: "Xin chào Sếp! Em là AI Letta Copilot đồng hành cùng Sếp. Vui lòng chọn một dự án bên Sidebar để em bắt đầu hỗ trợ nhé! 🎬"
      };
    }

    const projName = activeProject?.name || "Dự án";
    if (isProjectNew) {
      return {
        role: "assistant" as const,
        content: `👋 Chào Sếp! Em thấy dự án mới **${projName}** chưa có cấu trúc thiết kế thế giới (World Bible) và kịch bản.\n\nEm có thể hỗ trợ Sếp phỏng vấn lên ý tưởng hoặc trích xuất thế giới từ mô tả thô. Sếp muốn bắt đầu từ đâu?`
      };
    } else {
      const epTitle = activeEpisode?.title || "kịch bản hiện tại";
      return {
        role: "assistant" as const,
        content: `👋 Chào mừng Sếp trở lại dự án **${projName}**!\n\nEm thấy dự án đã có cấu trúc thế giới và tập kịch bản **${epTitle}** đang được mở. Em có thể đồng hành cùng Sếp kiểm tra lỗi logic, raccord các shot trên canvas hoặc tìm điểm thiếu sót trong World Bible. Sếp cần em giúp gì ạ?`
      };
    }
  }, [selectedProjectId, activeProject, activeEpisode, isProjectNew]);

  // Load lịch sử chat từ localStorage khi dự án hoặc welcome message thay đổi
  useEffect(() => {
    if (selectedProjectId) {
      const saved = localStorage.getItem(`STORYMEE_BIBLE_CHAT_${selectedProjectId}`);
      if (saved) {
        try {
          setMessages(JSON.parse(saved));
        } catch (e) {
          setMessages([welcomeMessage]);
        }
      } else {
        setMessages([welcomeMessage]);
      }
    } else {
      setMessages([welcomeMessage]);
    }
  }, [selectedProjectId, welcomeMessage]);

  // Lưu lịch sử chat
  useEffect(() => {
    if (selectedProjectId && messages.length > 0) {
      localStorage.setItem(`STORYMEE_BIBLE_CHAT_${selectedProjectId}`, JSON.stringify(messages));
    }
  }, [messages, selectedProjectId]);

  // Auto scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sendingChat]);

  // Gửi tin nhắn
  const handleSendChat = async (overrideInput?: string, actionType?: string) => {
    const textToSend = overrideInput !== undefined ? overrideInput : chatInput;
    const input = textToSend.trim();
    if (!input || !selectedProjectId) return;

    const userMsg = { role: "user" as const, content: input };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    if (overrideInput === undefined) setChatInput("");
    setSendingChat(true);

    // Lấy World Bible hiện tại từ project description
    let bible: any = null;
    if (activeProject && activeProject.description) {
      try {
        const parsed = JSON.parse(activeProject.description);
        bible = parsed.worldBible || null;
      } catch (e) {}
    }

    const scriptText = activeEpisode?.script || "";
    const shots = activeEpisode?.meta?.shots || [];

    // Tự động chèn tin nhắn chỉ dẫn hệ thống ẩn để cập nhật ngữ cảnh dự án hiện tại cho Letta
    const contextPrompt = `[HỆ THỐNG: Người dùng đang mở dự án "${activeProject?.name || ''}" và tập phim "${activeEpisode?.title || ''}". Hãy thực hiện đánh giá hoặc trả lời dựa trên đúng dự án này. Bỏ qua các câu nói cũ trong lịch sử chat báo thiếu thông tin nếu dữ liệu World Bible/kịch bản đính kèm dưới đây đã có sẵn.]`;
    
    const messagesWithContext = [
      ...updatedMessages.slice(0, -1),
      { role: "system" as const, content: contextPrompt },
      updatedMessages[updatedMessages.length - 1]
    ];

    try {
      const res = await chatWithCopilot(
        selectedProjectId,
        messagesWithContext,
        bible,
        scriptText,
        scenes,
        shots,
        actionType
      );
      const replyText = res?.content || res?.message?.content || res?.reply || res?.response || "Xin lỗi Sếp, em gặp lỗi khi kết nối với máy chủ.";
      setMessages(prev => [...prev, { role: "assistant" as const, content: replyText }]);
    } catch (e: any) {
      setMessages(prev => [...prev, { role: "assistant" as const, content: `❌ Lỗi gửi tin nhắn: ${e.message || e}` }]);
    } finally {
      setSendingChat(false);
    }
  };

  // Click chọn gợi ý Quick Action
  const handleQuickAction = (actionKey: string) => {
    if (!selectedProjectId) return;

    if (actionKey === "interview_new") {
      handleSendChat("Hãy bắt đầu phỏng vấn tôi để thiết kế World Bible sơ khởi.", "interview");
    } else if (actionKey === "extract_raw") {
      setMessages(prev => [
        ...prev,
        { role: "assistant" as const, content: "Sếp hãy dán ý tưởng thô, mô tả bối cảnh hoặc kịch bản tự do vào đây, sau đó bấm nút 'Trích xuất & Lưu cấu trúc' ở phía dưới để em tự động phân tích và đổ vào ma trận World Bible nhé!" }
      ]);
    } else if (actionKey === "check_logic") {
      handleSendChat("Kiểm tra lỗi logic & raccord các shot trên canvas của tập kịch bản này.", "check_logic");
    } else if (actionKey === "check_compatibility") {
      handleSendChat("Kiểm tra xem tập kịch bản hiện tại có tuân thủ đúng định hướng World Bible của dự án không?", "check_compatibility");
    } else if (actionKey === "check_bible_gaps") {
      handleSendChat("Tìm điểm thiếu sót trong World Bible dựa trên nội dung kịch bản thực tế.", "check_bible_gaps");
    }
  };

  // Trích xuất World Bible
  const handleExtract = async () => {
    if (!selectedProjectId) return;
    setExtracting(true);
    try {
      const res = await extractBible(selectedProjectId, messages);
      const updatedBible = res?.worldBible || res?.data?.worldBible || res;
      if (updatedBible && typeof updatedBible === "object" && (updatedBible.coreIdentity || updatedBible.ritualHooks || updatedBible.peerGroup)) {
        
        let descText = "";
        let existingMeta = {};
        if (activeProject && activeProject.description) {
          try {
            const parsed = JSON.parse(activeProject.description);
            descText = parsed.text || "";
            existingMeta = parsed;
          } catch(e) {}
        }

        const payload = {
          ...existingMeta,
          text: descText,
          worldBible: updatedBible
        };

        // Lưu trực tiếp
        await updateProject(selectedProjectId, {
          description: JSON.stringify(payload)
        });

        // Tải lại dự án
        await loadProjects();
        
        setMessages(prev => [
          ...prev, 
          { role: "assistant" as const, content: "🎉 Đã trích xuất cấu trúc thế giới thành công và cập nhật trực tiếp vào World Bible Matrix! Sếp có thể thấy các thay đổi nhấp nháy sáng trên bảng ma trận dữ liệu." }
        ]);
        alert("🎉 Trích xuất và lưu World Bible thành công!");
      } else {
        throw new Error("Không thể tìm thấy cấu trúc World Bible hợp lệ để trích xuất từ lịch sử chat.");
      }
    } catch (e: any) {
      alert("Trích xuất thất bại: " + e.message);
      setMessages(prev => [...prev, { role: "assistant" as const, content: `❌ Thất bại khi trích xuất cấu trúc: ${e.message}` }]);
    } finally {
      setExtracting(false);
    }
  };

  // Xóa lịch sử chat
  const handleClearChat = () => {
    if (window.confirm("Sếp có muốn làm mới cuộc hội thoại của dự án này không?")) {
      localStorage.removeItem(`STORYMEE_BIBLE_CHAT_${selectedProjectId}`);
      setMessages([welcomeMessage]);
    }
  };

  // Hàm định dạng các từ trong ** thành chữ in đậm màu tím
  const formatMessageContent = (content: string) => {
    if (!content) return "";
    const parts = content.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        const text = part.slice(2, -2);
        return (
          <strong key={index} className="text-purple-400 font-extrabold font-sans">
            {text}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      {/* CHAT POPUP WINDOW */}
      {isOpen && (
        <div className="w-[360px] h-[520px] bg-[#0b0b10] border border-white/10 rounded-3xl shadow-[0_15px_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden mb-4 animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-[#121218] border-b border-white/5 px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Sparkles className="w-4.5 h-4.5 animate-pulse" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-widest">Letta Logic Companion</h4>
                <p className="text-[8px] text-purple-400 font-black uppercase tracking-wider">AI Copilot Vệ Binh Logic</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-white/5 text-neutral-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar flex flex-col bg-gradient-to-b from-[#09090d] to-[#0b0b10]">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed font-semibold whitespace-pre-line ${
                  msg.role === "user"
                    ? "bg-purple-600/20 border border-purple-500/30 text-purple-100 self-end rounded-tr-none"
                    : msg.role === "system"
                    ? "bg-neutral-800/40 border border-neutral-700/30 text-neutral-400 text-center mx-auto text-[10px]"
                    : "bg-neutral-900 border border-neutral-850 text-neutral-350 self-start rounded-tl-none"
                }`}
              >
                {formatMessageContent(msg.content)}
                
                {/* HIỂN THỊ QUICK ACTIONS GỢI Ý (chỉ hiện dưới tin nhắn chào mừng đầu tiên nếu chưa chat) */}
                {idx === 0 && selectedProjectId && messages.length === 1 && (
                  <div className="mt-3.5 space-y-2 border-t border-white/5 pt-2.5">
                    <p className="text-[8.5px] font-black text-neutral-500 uppercase tracking-widest mb-1.5">Gợi ý hành động nhanh:</p>
                    {isProjectNew ? (
                      <>
                        <button
                          onClick={() => handleQuickAction("interview_new")}
                          className="w-full text-left bg-purple-950/20 hover:bg-purple-900/30 border border-purple-500/20 px-2.5 py-2 rounded-xl text-[10px] text-purple-300 font-bold transition cursor-pointer"
                        >
                          ✨ Phỏng vấn khởi tạo World Bible
                        </button>
                        <button
                          onClick={() => handleQuickAction("extract_raw")}
                          className="w-full text-left bg-neutral-950/40 hover:bg-neutral-850 border border-white/5 px-2.5 py-2 rounded-xl text-[10px] text-neutral-400 font-bold transition cursor-pointer"
                        >
                          📝 Trích xuất từ ý tưởng thô
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleQuickAction("check_logic")}
                          className="w-full text-left bg-purple-950/20 hover:bg-purple-900/30 border border-purple-500/20 px-2.5 py-2 rounded-xl text-[10px] text-purple-300 font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          🔍 Kiểm tra lỗi logic & raccord các shot
                        </button>
                        <button
                          onClick={() => handleQuickAction("check_compatibility")}
                          className="w-full text-left bg-neutral-950/40 hover:bg-neutral-850 border border-white/5 px-2.5 py-2 rounded-xl text-[10px] text-neutral-400 font-bold transition cursor-pointer"
                        >
                          💡 Kiểm tra độ tương thích World Bible
                        </button>
                        <button
                          onClick={() => handleQuickAction("check_bible_gaps")}
                          className="w-full text-left bg-neutral-950/40 hover:bg-neutral-850 border border-white/5 px-2.5 py-2 rounded-xl text-[10px] text-neutral-400 font-bold transition cursor-pointer"
                        >
                          🎯 Tìm điểm thiếu sót trong World Bible
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
            {sendingChat && (
              <div className="bg-neutral-900 border border-neutral-850 text-neutral-400 self-start rounded-2xl rounded-tl-none p-3 text-xs italic flex items-center gap-1.5 max-w-[85%]">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" /> Copilot đang suy nghĩ...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Footer input and extract button */}
          <div className="bg-[#121218] border-t border-white/5 p-3 space-y-2.5 shrink-0">
            {/* Input message form */}
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendChat();
                }}
                placeholder={selectedProjectId ? "Hỏi Letta hoặc chat ý tưởng..." : "Vui lòng chọn dự án..."}
                disabled={sendingChat || extracting || !selectedProjectId}
                className="flex-1 bg-black/60 border border-white/5 rounded-xl px-3 py-2 text-xs text-neutral-200 placeholder-neutral-500 outline-none focus:border-purple-500/30 transition disabled:opacity-50 font-bold"
              />
              <button
                onClick={() => handleSendChat()}
                disabled={sendingChat || extracting || !chatInput.trim() || !selectedProjectId}
                className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white p-2 rounded-xl transition flex items-center justify-center cursor-pointer active:scale-90"
              >
                {sendingChat ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>

            {/* Extract and sync button */}
            {selectedProjectId && (
              <button
                onClick={handleExtract}
                disabled={extracting || messages.length <= 1}
                className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:from-neutral-800 disabled:to-neutral-900 disabled:opacity-50 text-white py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition active:scale-95 cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.15)]"
              >
                {extracting ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" /> Đang trích xuất & lưu...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Trích xuất & Lưu cấu trúc
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* CHAT BUBBLE BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-tr from-purple-600 to-indigo-650 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/35 hover:scale-105 active:scale-95 transition cursor-pointer relative group border border-purple-400/20"
      >
        <span className="absolute inset-0 rounded-full bg-purple-500 animate-ping opacity-10 group-hover:opacity-25" />
        <MessageSquare className="w-6.5 h-6.5 text-white" />
        
        {/* Active badge indicator */}
        <span className="absolute top-1.5 right-1.5 w-3 h-3 bg-emerald-500 border-2 border-[#07070a] rounded-full" />
      </button>
    </div>
  );
}
