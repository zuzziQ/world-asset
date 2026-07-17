import React, { useMemo } from 'react';
import { Clapperboard, Sparkles, Image as ImageIcon, Video, Combine } from 'lucide-react';

interface VideoSequencePanelProps {
  parsedData: any;
  projectsList: any[];
  selectedProjectId: string;
}

export const VideoSequencePanel: React.FC<VideoSequencePanelProps> = ({
  parsedData,
  projectsList,
  selectedProjectId
}) => {

  const project = projectsList.find((p: any) => p.id === selectedProjectId);
  const masterStylePrompt = project?.stylePrompt || "Cinematic masterpiece, highly detailed, 8k resolution";

  // Flat all shots across all scenes
  const allShots = useMemo(() => {
    if (!parsedData?.scenes) return [];
    const shots: any[] = [];
    parsedData.scenes.forEach((scene: any) => {
      if (scene.shots && Array.isArray(scene.shots)) {
        scene.shots.forEach((shot: any) => {
          shots.push({ ...shot, sceneId: scene.id, sceneTitle: scene.title });
        });
      }
    });
    return shots;
  }, [parsedData]);

  // Group shots into sequences of 8 panels
  const sequences = useMemo(() => {
    const seqs = [];
    const CHUNK_SIZE = 8;
    for (let i = 0; i < allShots.length; i += CHUNK_SIZE) {
      const chunkShots = allShots.slice(i, i + CHUNK_SIZE);
      const totalDuration = chunkShots.reduce((acc, shot) => acc + (Number(shot.duration) || 3), 0);
      
      seqs.push({
        id: `seq-${Math.floor(i / CHUNK_SIZE) + 1}`,
        title: `Sequence ${Math.floor(i / CHUNK_SIZE) + 1} (${chunkShots.length} Panels)`,
        totalDuration,
        shots: chunkShots
      });
    }
    return seqs;
  }, [allShots]);

  const generateMasterVideoPrompt = (seq: any) => {
    return `Use the provided ${seq.shots.length}-panel storyboard sheet as the direct sequential visual keyframe reference for the entire ${seq.totalDuration}-second video. Follow the exact storyboard progression, pacing, camera flow, emotional beats and character continuity. Expand storyboard poses into smooth cinematic animation while preserving action order and visual storytelling.\n\nSTYLE: ${masterStylePrompt}`;
  };

  if (sequences.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-12 bg-slate-950/20 border border-dashed border-slate-900 rounded-2xl min-h-[300px] space-y-4">
        <div className="w-16 h-16 rounded-full bg-purple-900/20 flex items-center justify-center mb-2">
          <Clapperboard className="w-8 h-8 text-purple-500 opacity-50" />
        </div>
        <div className="text-center space-y-2 max-w-md">
          <h3 className="text-sm font-black text-slate-400">Không có Shot nào</h3>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Bạn cần tạo Shot (Khung hình) ở bước trước để Hệ thống có thể gộp thành các Sequence lưới 8 ô.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-900 pb-3 gap-2">
        <div>
          <h4 className="text-xs font-black tracking-widest text-slate-400 uppercase flex items-center gap-2">
            <Combine className="w-4 h-4 text-purple-400" /> Video Sequence Orchestrator
          </h4>
          <p className="text-[10px] text-slate-500 mt-0.5">Aggregate shots into continuous 8-panel grids for AI Video Models (Veo/Seedance)</p>
        </div>
      </div>

      <div className="space-y-8">
        {sequences.map((seq, idx) => (
          <div key={seq.id} className="bg-slate-950/40 border border-slate-900 rounded-2xl overflow-hidden shadow-lg">
            {/* Header */}
            <div className="bg-slate-900/50 border-b border-slate-900 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs font-black text-slate-200 uppercase tracking-wider bg-purple-900/30 text-purple-400 px-2 py-1 rounded border border-purple-500/20">
                  {seq.title}
                </span>
                <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                  <Video className="w-3.5 h-3.5" /> Total: ~{seq.totalDuration}s
                </span>
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-bold transition-colors">
                  <ImageIcon className="w-3.5 h-3.5" /> Stitch 2x4 Grid
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded text-[10px] font-bold shadow-md shadow-purple-500/20 active:scale-95 transition-all">
                  <Sparkles className="w-3.5 h-3.5" /> Send to Video Render
                </button>
              </div>
            </div>

            {/* Grid Preview */}
            <div className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {seq.shots.map((shot: any, sIdx: number) => (
                  <div key={sIdx} className="aspect-video bg-slate-900 rounded-lg border border-slate-800 overflow-hidden relative group">
                    {shot.imageUrl ? (
                      <img src={shot.imageUrl} alt={shot.sc} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 space-y-1">
                        <ImageIcon className="w-6 h-6 opacity-30" />
                        <span className="text-[8px] uppercase tracking-wider font-bold">No Image</span>
                      </div>
                    )}
                    
                    {/* Overlay Info */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-2 pt-6">
                      <div className="flex justify-between items-end">
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-mono text-purple-300 font-bold block">{shot.sc}</span>
                          <span className="text-[8px] text-slate-300 line-clamp-1 leading-snug" title={shot.actionDescription}>
                            {shot.actionDescription || "No action described"}
                          </span>
                        </div>
                        <span className="text-[9px] font-mono text-slate-400 shrink-0 bg-black/50 px-1 rounded">{shot.duration || 3}s</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Empty slots to fill 2x4 grid if shots < 8 */}
                {Array.from({ length: 8 - seq.shots.length }).map((_, emptyIdx) => (
                  <div key={`empty-${emptyIdx}`} className="aspect-video bg-slate-950 rounded-lg border border-dashed border-slate-800 flex items-center justify-center opacity-50">
                    <span className="text-[9px] text-slate-600 font-bold uppercase tracking-wider">Empty Panel</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Compiled Prompt Area */}
            <div className="px-4 pb-4">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-900 space-y-1.5">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block">Master Video Prompt (Compiled)</span>
                <p className="text-[11px] text-slate-300 font-mono leading-relaxed select-all">
                  {generateMasterVideoPrompt(seq)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
