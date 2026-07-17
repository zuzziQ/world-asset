"use client";

import React from "react";

interface XRayDnaDecoderProps {
  hasAnalyzed: boolean;
  assetType: "character" | "location" | "prop" | "style";
  visualStyle: string;
  composition: string;
  attitude: string;
  colors: string;
  lighting: string;
  camera: string;
  renderBoldText: (text: string) => React.ReactNode;
}

export function XRayDnaDecoder({
  hasAnalyzed,
  assetType,
  visualStyle,
  composition,
  attitude,
  colors,
  lighting,
  camera,
  renderBoldText,
}: XRayDnaDecoderProps) {
  if (!hasAnalyzed) return null;

  return (
    <div className="space-y-3 pt-3.5 border-t border-white/5">
      <div className="flex justify-between items-center pb-1">
        <span className="text-[8.5px] font-black uppercase tracking-widest text-purple-400">
          Style DNA Decoded (6-Dimensions)
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
        {assetType === "character" ? (
          <>
            <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 space-y-1 hover:border-purple-500/30 transition-all duration-300 group">
              <span className="text-[7.5px] font-black uppercase text-purple-400 flex items-center gap-1">📐 Proportions</span>
              <div className="text-[10px] leading-relaxed text-neutral-300 break-words" title={visualStyle}>{renderBoldText(visualStyle)}</div>
            </div>
            <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 space-y-1 hover:border-purple-500/30 transition-all duration-300 group">
              <span className="text-[7.5px] font-black uppercase text-purple-400 flex items-center gap-1">👤 Face & Eyes</span>
              <div className="text-[10px] leading-relaxed text-neutral-300 break-words" title={composition}>{renderBoldText(composition)}</div>
            </div>
            <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 space-y-1 hover:border-purple-500/30 transition-all duration-300 group">
              <span className="text-[7.5px] font-black uppercase text-purple-400 flex items-center gap-1">💇 Hair Style</span>
              <div className="text-[10px] leading-relaxed text-neutral-300 break-words" title={attitude}>{renderBoldText(attitude)}</div>
            </div>
            <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 space-y-1 hover:border-purple-500/30 transition-all duration-300 group">
              <span className="text-[7.5px] font-black uppercase text-purple-400 flex items-center gap-1">👕 Outfit & Colors</span>
              <div className="text-[10px] leading-relaxed text-neutral-300 break-words" title={colors}>{renderBoldText(colors)}</div>
            </div>
            <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 space-y-1 hover:border-purple-500/30 transition-all duration-300 group">
              <span className="text-[7.5px] font-black uppercase text-purple-400 flex items-center gap-1">👤 Silhouette & Shapes</span>
              <div className="text-[10px] leading-relaxed text-neutral-300 break-words" title={lighting}>{renderBoldText(lighting)}</div>
            </div>
            <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 space-y-1 hover:border-red-500/30 transition-all duration-300 group">
              <span className="text-[7.5px] font-black uppercase text-red-400 flex items-center gap-1">🚫 DO'S & DONT'S</span>
              <div className="text-[10px] leading-relaxed text-red-200/90 break-words" title={camera}>{renderBoldText(camera)}</div>
            </div>
          </>
        ) : assetType === "location" ? (
          <>
            <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 space-y-1 hover:border-purple-500/30 transition-all duration-300 group">
              <span className="text-[7.5px] font-black uppercase text-purple-400 flex items-center gap-1">🏛️ Architecture & Layout</span>
              <div className="text-[10px] leading-relaxed text-neutral-300 break-words" title={visualStyle}>{renderBoldText(visualStyle)}</div>
            </div>
            <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 space-y-1 hover:border-purple-500/30 transition-all duration-300 group">
              <span className="text-[7.5px] font-black uppercase text-purple-400 flex items-center gap-1">🧱 Materials & Textures</span>
              <div className="text-[10px] leading-relaxed text-neutral-300 break-words" title={composition}>{renderBoldText(composition)}</div>
            </div>
            <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 space-y-1 hover:border-purple-500/30 transition-all duration-300 group">
              <span className="text-[7.5px] font-black uppercase text-purple-400 flex items-center gap-1">🌈 Colors & Palette</span>
              <div className="text-[10px] leading-relaxed text-neutral-300 break-words" title={attitude}>{renderBoldText(attitude)}</div>
            </div>
            <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 space-y-1 hover:border-purple-500/30 transition-all duration-300 group">
              <span className="text-[7.5px] font-black uppercase text-purple-400 flex items-center gap-1">💡 Lighting & Shadows</span>
              <div className="text-[10px] leading-relaxed text-neutral-300 break-words" title={colors}>{renderBoldText(colors)}</div>
            </div>
            <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 space-y-1 hover:border-purple-500/30 transition-all duration-300 group">
              <span className="text-[7.5px] font-black uppercase text-purple-400 flex items-center gap-1">🌫️ Atmosphere & Mood</span>
              <div className="text-[10px] leading-relaxed text-neutral-300 break-words" title={lighting}>{renderBoldText(lighting)}</div>
            </div>
            <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 space-y-1 hover:border-red-500/30 transition-all duration-300 group">
              <span className="text-[7.5px] font-black uppercase text-red-400 flex items-center gap-1">🚫 DO'S & DONT'S</span>
              <div className="text-[10px] leading-relaxed text-red-200/90 break-words" title={camera}>{renderBoldText(camera)}</div>
            </div>
          </>
        ) : assetType === "prop" ? (
          <>
            <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 space-y-1 hover:border-purple-500/30 transition-all duration-300 group">
              <span className="text-[7.5px] font-black uppercase text-purple-400 flex items-center gap-1">📐 Shapes & Form</span>
              <div className="text-[10px] leading-relaxed text-neutral-300 break-words" title={visualStyle}>{renderBoldText(visualStyle)}</div>
            </div>
            <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 space-y-1 hover:border-purple-500/30 transition-all duration-300 group">
              <span className="text-[7.5px] font-black uppercase text-purple-400 flex items-center gap-1">🪨 Materials & Finish</span>
              <div className="text-[10px] leading-relaxed text-neutral-300 break-words" title={composition}>{renderBoldText(composition)}</div>
            </div>
            <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 space-y-1 hover:border-purple-500/30 transition-all duration-300 group">
              <span className="text-[7.5px] font-black uppercase text-purple-400 flex items-center gap-1">🔮 Glowing Energy</span>
              <div className="text-[10px] leading-relaxed text-neutral-300 break-words" title={attitude}>{renderBoldText(attitude)}</div>
            </div>
            <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 space-y-1 hover:border-purple-500/30 transition-all duration-300 group">
              <span className="text-[7.5px] font-black uppercase text-purple-400 flex items-center gap-1">🎨 Colors & Wear</span>
              <div className="text-[10px] leading-relaxed text-neutral-300 break-words" title={colors}>{renderBoldText(colors)}</div>
            </div>
            <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 space-y-1 hover:border-purple-500/30 transition-all duration-300 group">
              <span className="text-[7.5px] font-black uppercase text-purple-400 flex items-center gap-1">⚖️ Scale & Proportions</span>
              <div className="text-[10px] leading-relaxed text-neutral-300 break-words" title={lighting}>{renderBoldText(lighting)}</div>
            </div>
            <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 space-y-1 hover:border-red-500/30 transition-all duration-300 group">
              <span className="text-[7.5px] font-black uppercase text-red-400 flex items-center gap-1">🚫 DO'S & DONT'S</span>
              <div className="text-[10px] leading-relaxed text-red-200/90 break-words" title={camera}>{renderBoldText(camera)}</div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 space-y-1 hover:border-purple-500/30 transition-all duration-300 group">
              <span className="text-[7.5px] font-black uppercase text-purple-400 flex items-center gap-1">🎨 Visual Style</span>
              <div className="text-[10px] leading-relaxed text-neutral-300 break-words" title={visualStyle}>{renderBoldText(visualStyle)}</div>
            </div>
            <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 space-y-1 hover:border-purple-500/30 transition-all duration-300 group">
              <span className="text-[7.5px] font-black uppercase text-purple-400 flex items-center gap-1">📐 Composition</span>
              <div className="text-[10px] leading-relaxed text-neutral-300 break-words" title={composition}>{renderBoldText(composition)}</div>
            </div>
            <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 space-y-1 hover:border-purple-500/30 transition-all duration-300 group">
              <span className="text-[7.5px] font-black uppercase text-purple-400 flex items-center gap-1">🎭 Attitude</span>
              <div className="text-[10px] leading-relaxed text-neutral-300 break-words" title={attitude}>{renderBoldText(attitude)}</div>
            </div>
            <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 space-y-1 hover:border-purple-500/30 transition-all duration-300 group">
              <span className="text-[7.5px] font-black uppercase text-purple-400 flex items-center gap-1">🌈 Colors & Palette</span>
              <div className="text-[10px] leading-relaxed text-neutral-300 break-words" title={colors}>{renderBoldText(colors)}</div>
            </div>
            <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 space-y-1 hover:border-purple-500/30 transition-all duration-300 group">
              <span className="text-[7.5px] font-black uppercase text-purple-400 flex items-center gap-1">💡 Lighting</span>
              <div className="text-[10px] leading-relaxed text-neutral-300 break-words" title={lighting}>{renderBoldText(lighting)}</div>
            </div>
            <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 space-y-1 hover:border-red-500/30 transition-all duration-300 group">
              <span className="text-[7.5px] font-black uppercase text-red-400 flex items-center gap-1">🚫 DO'S & DONT'S</span>
              <div className="text-[10px] leading-relaxed text-red-200/90 break-words" title={camera}>{renderBoldText(camera)}</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
