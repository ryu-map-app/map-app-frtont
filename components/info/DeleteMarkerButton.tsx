"use client";

import { useMarkerStore } from "@/store/useMarkerStore";

export default function DeleteMarkerButton({
  markerId,
  onDone,
}: {
  markerId: string;
  onDone?: () => void;
}) {
  const removeMarker = useMarkerStore((s) => s.removeMarker);
  const selectMarker = useMarkerStore((s) => s.selectMarker);

  return (
    <button
      className="rounded border px-2 py-1 text-[11px] hover:bg-gray-50"
      onClick={() => {
        removeMarker(markerId);
        selectMarker(null); // 삭제 후 선택 해제
        onDone?.();
      }}
    >
      삭제
    </button>
  );
}
