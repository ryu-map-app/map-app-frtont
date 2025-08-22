"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useMarkerStore } from "@/store/useMarkerStore";
import MarkerListItem from "./MarkerListItem";
import { getMapInfos, ItemInfo } from "@/app/api/actions/mapInfo";

export default function MarkerList() {
  const list  = useMarkerStore((s) => s.list);
  const selId = useMarkerStore((s) => s.selectedMarkersId);

  const group   = useMemo(() => list.find((g) => g.id === selId) ?? null, [list, selId]);
  const markers = group?.markers ?? [];

  const [infos, setInfos] = useState<Record<string, ItemInfo | undefined>>({});
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!group || markers.length === 0) {
      setInfos({});
      return;
    }
    const points = markers.map((m) => ({ id: m.id, lat: m.lat, lng: m.lng }));

    // ✅ 클라이언트 fetch 제거: 서버 액션 호출만
    startTransition(async () => {
      try {
        const items = await getMapInfos(points);
        const map: Record<string, ItemInfo> = {};
        (items || []).forEach((it) => (map[it.id] = it));
        setInfos(map);
      } catch {
        setInfos({});
      }
    });
  }, [group?.id, markers]);

  // 컨테이너는 항상 렌더
  return (
    <div className="mx-auto mt-2 w-[800px] min-w-[500px] rounded-lg border bg-white/90 p-2 shadow-sm">
      <div className="mb-2 text-sm font-medium">
        {group ? `${group.name} · 마커 ${markers.length}개` : "선택된 그룹 없음"}
      </div>

      {/* ⬇️ 빈 상태 처리 */}
      {!group || markers.length === 0 ? (
        <div className="flex h-[120px] items-center justify-center rounded-lg border border-dashed bg-white/70 text-xs text-gray-500">
          저장된 마커가 없습니다. 지도를 클릭해 마커를 추가해 보세요.
        </div>
      ) : (
        <div className="max-h-[40vh] overflow-auto space-y-2">
          {markers.map((m) => {
            const info = infos[m.id];
            return (
              <MarkerListItem
                key={m.id}
                loading={isPending && !info}
                title={info?.title}
                content={info?.content}
                photoUrl={info?.photoUrl}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
