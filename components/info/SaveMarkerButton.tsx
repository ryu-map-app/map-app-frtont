"use client";
import { useMarkerStore } from "@/store/useMarkerStore";

export default function SaveMarkerButton({
  lat, lng, onDone,
}: { lat: number; lng: number; onDone?: () => void }) {
  const addMarker = useMarkerStore((s) => s.addMarker);
  const selectMarker = useMarkerStore((s) => s.selectMarker);
  return (
    <button
      className="rounded border px-2 py-1 text-[11px] hover:bg-gray-50"
      onClick={() => {
        const id = addMarker(lat, lng);
        selectMarker(id);
        onDone?.();
      }}
    >
      저장
    </button>
  );
}
