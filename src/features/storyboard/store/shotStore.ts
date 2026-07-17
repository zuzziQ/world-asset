import { create } from 'zustand';

interface ShotState {
  images: Record<string, string>;
  variants: Record<string, string[]>;
  isGenerating: Record<string, boolean>;
  
  setImage: (beat: string, url: string) => void;
  addVariant: (beat: string, url: string) => void;
  setGenerating: (beat: string, generating: boolean) => void;
  
  // Batch initialization
  initShots: (shots: any[]) => void;
}

export const useShotStore = create<ShotState>((set) => ({
  images: {},
  variants: {},
  isGenerating: {},

  setImage: (beat, url) => set((state) => ({
    images: { ...state.images, [beat]: url }
  })),

  addVariant: (beat, url) => set((state) => {
    const current = state.variants[beat] || [];
    if (current.includes(url)) return state;
    return { variants: { ...state.variants, [beat]: [...current, url] } };
  }),

  setGenerating: (beat, generating) => set((state) => ({
    isGenerating: { ...state.isGenerating, [beat]: generating }
  })),

  initShots: (shots) => set((state) => {
    const images = { ...state.images };
    const variants = { ...state.variants };
    shots.forEach(sh => {
      if (sh.imageUrl && !images[sh.beat]) {
        images[sh.beat] = sh.imageUrl;
      }
      if (sh.variants && !variants[sh.beat]) {
        variants[sh.beat] = sh.variants;
      }
    });
    return { images, variants };
  })
}));
