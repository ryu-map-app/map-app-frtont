"use client"
import { useEffect, useRef } from "react";
import { useMapStore } from "@/store/useMapStore";
import { useMarkerStore } from "@/store/useMarkerStore";

export function GroupAutoCenter() {
  const map   = useMapStore((s) => s.map);
  const list  = useMarkerStore((s) => s.list);
  const selId = useMarkerStore((s) => s.selectedMarkersId);

  // 이전에 간 위치(옵션) 기억해서 너무 잦은 호출 방지
  const lastKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!map) return;
    const n = (window as any).naver;
    if (!n?.maps) return;

    const grp = list.find((g) => g.id === selId);
    const first = grp?.markers?.[0];
    if (!first) return;

    const key = `${selId}:${first.lat.toFixed(6)},${first.lng.toFixed(6)}`;
    if (lastKeyRef.current === key) return; // 같은 지점이면 스킵
    lastKeyRef.current = key;

    const target = new n.maps.LatLng(first.lat, first.lng);

    // 줌을 그대로 유지하면서 부드럽게 이동
    // map.panTo(target, { /* duration, easing 등 전달 가능 */ });

    // 만약 이동과 함께 줌도 바꾸고 싶으면 morph 사용:
    map.morph(target, 15, { /* duration, easing 등 */ });
  }, [map, list, selId]);

  return null;
}
