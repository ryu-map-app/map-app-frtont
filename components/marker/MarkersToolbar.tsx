"use client";
import { useState, useMemo } from "react";
import { useMarkerStore } from "@/store/useMarkerStore";

export default function MarkersToolbar() {
  // ⬇️ 각 필드를 개별 selector로 구독(객체/배열 반환 금지)
  const list   = useMarkerStore((s) => s.list);
  const selId  = useMarkerStore((s) => s.selectedMarkersId);
  const rename = useMarkerStore((s) => s.renameMarkers);
  const remove = useMarkerStore((s) => s.removeMarkers);

  // 훅은 조건부 리턴보다 먼저
  const [editing, setEditing] = useState(false);

  // 파생값은 컴포넌트에서 조합
  const group = useMemo(() => list.find((g) => g.id === selId) ?? null, [list, selId]);
  if (!group) return null;

  const onlyOne = list.length <= 1;

  return (
    <div className="mx-auto mt-3 w-[800px] min-w-[500px] rounded-lg border bg-white/90 p-2 shadow-sm">
      <div className="flex items-center gap-2">
        {editing ? (
          <input
            key={group.id}               // 그룹 바뀌면 입력 리셋
            autoFocus
            defaultValue={group.name}    // 언컨트롤드 → 동기화 useEffect 불필요
            onBlur={(e) => { rename(group.id, e.target.value.trim()); setEditing(false); }}
            onKeyDown={(e) => {
              const el = e.target as HTMLInputElement;
              if (e.key === "Enter") el.blur();              // 커밋
              if (e.key === "Escape") { el.value = group.name; el.blur(); } // 취소
            }}
            className="rounded border px-2 py-1 text-sm outline-none"
          />
        ) : (
          <>
            <span className="font-medium">{group.name}</span>
            <button
              className="rounded p-1 text-xs hover:bg-gray-100"
              title="이름 편집"
              onClick={() => setEditing(true)}
            >
              ✏️
            </button>
          </>
        )}

        <button
          className={"rounded p-1 text-xs " + (onlyOne ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100")}
          title={onlyOne ? "최소 1개 유지" : "그룹 삭제"}
          onClick={() => !onlyOne && remove(group.id)}
          disabled={onlyOne}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
