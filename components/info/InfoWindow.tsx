"use client";

import { useEffect, useRef } from "react";
import { useMapStore } from "@/store/useMapStore";
import { useMarkerStore } from "@/store/useMarkerStore";

export default function InfoWindow() {
  const map = useMapStore((s) => s.map);
  const list = useMarkerStore((s) => s.list);
  const selectedMarkersId = useMarkerStore((s) => s.selectedMarkersId);
  const selectedMarkerId  = useMarkerStore((s) => s.selectedMarkerId);

  const infoRef = useRef<any>(null);

  // 인포윈도우 1회 생성
  useEffect(() => {
    const n = (window as any).naver;
    if (!map || !n?.maps || infoRef.current) return;
    infoRef.current = new n.maps.InfoWindow({
      borderWidth: 0,
      backgroundColor: "transparent",
      disableAnchor: true,
      pixelOffset: new n.maps.Point(0, -28),
    });
  }, [map]);

  // 선택 변경 시 표시/닫기
  useEffect(() => {
    const n = (window as any).naver;
    if (!map || !n?.maps || !infoRef.current) return;

    const grp = list.find((g) => g.id === selectedMarkersId);
    const mk  = grp?.markers.find((m) => m.id === selectedMarkerId);

    if (!grp || !mk) {
      infoRef.current.close();
      return;
    }

    const wrap = document.createElement("div");
    wrap.className = "relative rounded-lg border bg-white px-3 py-2 text-xs shadow";

    const title = document.createElement("div");
    title.className = "mb-1 font-medium pr-10";
    title.textContent = grp.name;

    const lat = document.createElement("div");
    lat.innerHTML = `<span class="text-gray-500">lat:</span> ${mk.lat.toFixed(6)}`;
    const lng = document.createElement("div");
    lng.innerHTML = `<span class="text-gray-500">lng:</span> ${mk.lng.toFixed(6)}`;

    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "absolute right-1 top-1 rounded p-1 leading-none hover:bg-gray-100";
    closeBtn.textContent = "✕";
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      useMarkerStore.getState().selectMarker(null);
      infoRef.current?.close();
    }, { once: true });

    wrap.append(closeBtn, title, lat, lng);
    infoRef.current.setContent(wrap);
    infoRef.current.setPosition(new n.maps.LatLng(mk.lat, mk.lng)); // 마커 LatLng 앵커
    infoRef.current.open(map);
  }, [map, list, selectedMarkersId, selectedMarkerId]);

  return null;
}
