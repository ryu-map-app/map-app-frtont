// store/useMapStore.ts
import { create } from "zustand";

export type LatLng = { lat: number; lng: number };

type MapState = {
  map: any | null;
  center: LatLng;
  zoom: number;
  setMap: (map: any | null) => void;
  setCenter: (center: LatLng) => void;
  setZoom: (zoom: number) => void;
};

export const useMapStore = create<MapState>((set) => ({
  map: null,
  center: { lat: 37.5665, lng: 126.978 },
  zoom: 13,
  setMap: (map) => set({ map }),
  setCenter: (center) => set({ center }),
  setZoom: (zoom) => set({ zoom }),
}));