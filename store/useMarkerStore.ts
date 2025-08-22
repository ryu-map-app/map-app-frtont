// store/useMarkerStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type Marker = { id: string; lat: number; lng: number };
export type Markers = { id: string; name: string; markers: Marker[] };


type State = {
  list: Markers[];
  selectedMarkersId: string;
  selectedMarkerId: string | null;

  addMarkers: (name?: string) => void;
  removeMarkers: (id: string) => void;
  renameMarkers: (id: string, name: string) => void;
  selectMarkers: (id: string) => void;

  addMarker: (lat: number, lng: number) => string; // ← 새 id 반환
  removeMarker: (id: string) => void;
  selectMarker: (id: string | null) => void;
};

const makeId = () =>
  globalThis.crypto?.randomUUID?.() ??
  `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const initialId = "markers-1";

export const useMarkerStore = create<State>()(
  persist(
    (set, get) => ({
      list: [{ id: initialId, name: "1", markers: [] }],
      selectedMarkersId: initialId,
      selectedMarkerId: null,

      addMarkers: (name) =>
        set((s) => {
          if (s.list.length >= 5) return s;
          const id = makeId();
          const nm = (name ?? "").trim() || `${s.list.length + 1}`;
          return {
            list: [...s.list, { id, name: nm, markers: [] }],
            selectedMarkersId: id,
            selectedMarkerId: null,
          };
        }),

      removeMarkers: (id) =>
        set((s) => {
          if (s.list.length <= 1) return s;
          const next = s.list.filter((g) => g.id !== id);
          const nextSel = s.selectedMarkersId === id ? next[0].id : s.selectedMarkersId;
          return { list: next, selectedMarkersId: nextSel, selectedMarkerId: null };
        }),

      renameMarkers: (id, name) =>
        set((s) => ({
          list: s.list.map((g) => (g.id === id ? { ...g, name: name.trim() || g.name } : g)),
        })),

      selectMarkers: (id) => set({ selectedMarkersId: id, selectedMarkerId: null }),

      addMarker: (lat, lng) => {
        const { list, selectedMarkersId } = get();
        const i = list.findIndex((g) => g.id === selectedMarkersId);
        if (i < 0) return "";
        const id = makeId();
        const next = [...list];
        next[i] = { ...next[i], markers: [...next[i].markers, { id, lat, lng }] };
        set({ list: next, selectedMarkerId: id });
        return id;
      },

      removeMarker: (id) =>
        set((s) => {
          const list = s.list.map((g) => ({ ...g, markers: g.markers.filter((m) => m.id !== id) }));
          const selectedMarkerId = s.selectedMarkerId === id ? null : s.selectedMarkerId;
          return { list, selectedMarkerId };
        }),

      selectMarker: (id) => set({ selectedMarkerId: id }),
    }),
    {
      name: "markers-store-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        list: s.list,
        selectedMarkersId: s.selectedMarkersId,
        selectedMarkerId: s.selectedMarkerId,
      }),
    }
  )
);