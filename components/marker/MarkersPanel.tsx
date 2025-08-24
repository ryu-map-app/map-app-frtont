// components/marker/MarkersPanel.tsx
"use client";
import { useMarkerStore } from "@/store/useMarkerStore";
import { GroupAutoCenter } from "../map/GroupAutoCenter";

export default function MarkersPanel() {
  const list = useMarkerStore((s) => s.list);
  const selectedId = useMarkerStore((s) => s.selectedMarkersId);
  const selectGroup = useMarkerStore((s) => s.selectMarkers);
  const addGroup = useMarkerStore((s) => s.addMarkers);
  const isFull = list.length >= 5;

  return (
        <div className="rounded-lg border bg-white/90 shadow p-2">
            <GroupAutoCenter />
            <div className="flex flex-col items-center gap-2">
            {list.map((g, idx) => {
                const active = g.id === selectedId;
                return (
                <button
                    key={g.id}
                    title={g.name}
                    onClick={() => selectGroup(g.id)}
                    className={
                    "w-10 h-10 rounded-lg border shadow flex items-center justify-center text-xs font-medium " +
                    (active
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white/90 hover:bg-white text-gray-700")
                    }
                >
                    <span className="truncate">
                    {(() => {
                        const t = (g.name || "").trim();
                        if (!t || /^마커\s*그룹\s*\d+$/i.test(t)) return String(idx + 1);
                        return t.length > 3 ? t.slice(0, 3) : t;
                    })()}
                    </span>
                </button>
                );
            })}

            {!isFull && (
                <button
                title="새 그룹 추가"
                onClick={() => addGroup()}
                className="w-10 h-10 rounded-lg border bg-white/90 hover:bg-white shadow text-lg leading-none"
                >
                +
                </button>
            )}
            </div>
        </div>
        );

}
