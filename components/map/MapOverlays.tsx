// components/map/MapOverlays.tsx
"use client";

import { useEffect, useRef } from "react";
import { useMapStore } from "@/store/useMapStore";
import { useMarkerStore, type Marker as MarkerModel } from "@/store/useMarkerStore";
import { shallow } from "zustand/shallow";
import { createRoot, type Root } from "react-dom/client";
import InfoWindowView from "@/components/info/InfoWindow";

export default function MapOverlays() {
  const map = useMapStore((s) => s.map);

  const poolRef        = useRef<Map<string, any>>(new Map());
  const naverInfoRef   = useRef<any>(null);     // 네이버 InfoWindow
  const previewRef     = useRef<any>(null);     // 임시 마커
  const clickHandleRef = useRef<any>(null);

  // 리액트 마운트 관련
  const reactRootRef   = useRef<Root | null>(null);
  const hostRef        = useRef<HTMLDivElement | null>(null);
  const roRef          = useRef<ResizeObserver | null>(null);

  const hidePreview = () => previewRef.current?.setMap?.(null);

  const closeInfo = () => {
    naverInfoRef.current?.close?.();
    roRef.current?.disconnect();
    roRef.current = null;
    reactRootRef.current?.unmount?.();
    reactRootRef.current = null;
    hostRef.current = null;
  };

  // 시그니처에 markerId?: string 추가
const openReactInfo = (lat: number, lng: number, anchor: any, markerId?: string) => {
  const wrap = document.createElement("div");
  hostRef.current = wrap;

  reactRootRef.current = createRoot(wrap);
  reactRootRef.current.render(
    <InfoWindowView
      lat={lat}
      lng={lng}
      markerId={markerId}    // ⬅️ 여기!
      onRequestClose={() => {
        useMarkerStore.getState().selectMarker(null);
        hidePreview();
        closeInfo();
      }}
    />
  );

  naverInfoRef.current.setContent(wrap);
  naverInfoRef.current.open(map, anchor);
  requestAnimationFrame(() => naverInfoRef.current?.setContent(wrap));
  roRef.current = new ResizeObserver(() => naverInfoRef.current?.setContent(wrap));
  roRef.current.observe(wrap);
};


  // 1) 네이버 InfoWindow 1회 생성
  useEffect(() => {
    const n = (window as any).naver;
    if (!map || !n?.maps || naverInfoRef.current) return;
    naverInfoRef.current = new n.maps.InfoWindow({
      borderWidth: 0,
      backgroundColor: "transparent",
      disableAnchor: true,
      pixelOffset: new n.maps.Point(0, -28),
    });
  }, [map]);

  // 2) 맵 클릭 → 프리뷰 마커 + 리액트 인포윈도우
  useEffect(() => {
    const n = (window as any).naver;
    if (!map || !n?.maps) return;

    const handle = n.maps.Event.addListener(map, "click", (e: any) => {
      const p = e.coord || e.latlng;
      if (!p) return;
      const lat = p.lat();
      const lng = p.lng();
      const pos = new n.maps.LatLng(lat, lng);

      if (!previewRef.current) {
        previewRef.current = new n.maps.Marker({ map, position: pos, zIndex: 9999 });
      } else {
        previewRef.current.setPosition(pos);
        previewRef.current.setMap(map);
      }

      openReactInfo(lat, lng, previewRef.current);
    });

    clickHandleRef.current = handle;
    return () => {
      if (n?.maps?.Event && clickHandleRef.current) {
        n.maps.Event.removeListener(clickHandleRef.current);
        clickHandleRef.current = null;
      }
    };
  }, [map]);

  // 3) 저장된 마커 동기화 + 클릭 시 동일한 리액트 인포윈도우 표시
  useEffect(() => {
    if (!map) return;
    const n = (window as any).naver;
    const pool = poolRef.current;

    const selector = (s: ReturnType<typeof useMarkerStore.getState>) => {
      const g = s.list.find((x) => x.id === s.selectedMarkersId);
      return {
        markers: g?.markers ?? ([] as MarkerModel[]),
        selectedMarkerId: s.selectedMarkerId,
        selectedMarkersId: s.selectedMarkersId,
      };
    };

    const sync = (snap: ReturnType<typeof selector>) => {
      if (!n?.maps) return;

      // 삭제
      for (const [id, inst] of pool) {
        if (!snap.markers.some((m) => m.id === id)) {
          n.maps.Event.clearInstanceListeners(inst);
          inst.setMap(null);
          pool.delete(id);
        }
      }

      // 추가/업데이트
      snap.markers.forEach((m) => {
        const pos = new n.maps.LatLng(m.lat, m.lng);
        let inst = pool.get(m.id);
        if (!inst) {
          inst = new n.maps.Marker({ map, position: pos });
          n.maps.Event.addListener(inst, "click", () => {
            // 저장 마커 클릭 → 프리뷰 감추고 동일한 카드 열기
            useMarkerStore.getState().selectMarker(m.id);
            hidePreview();
            openReactInfo(m.lat, m.lng, inst, m.id);
          });
          pool.set(m.id, inst);
        } else {
          inst.setPosition(pos);
        }
      });
    };

    let prev = selector(useMarkerStore.getState());
    sync(prev);

    const unsub = useMarkerStore.subscribe((state, prevState) => {
      const next = selector(state);
      const prevSel = selector(prevState);

      // 그룹 변경/선택 해제 시 닫기 + 프리뷰 제거
      if (
        next.selectedMarkersId !== prevSel.selectedMarkersId ||
        (!next.selectedMarkerId && prevSel.selectedMarkerId)
      ) {
        closeInfo();
        hidePreview();
      }

      if (!shallow(next, prevSel)) {
        prev = next;
        sync(next);
      }

      if (!next.selectedMarkerId) {
        naverInfoRef.current?.close?.();
      }
    });

    return () => {
      unsub();
      for (const [, inst] of pool) {
        n.maps.Event.clearInstanceListeners(inst);
        inst.setMap(null);
      }
      pool.clear();
      closeInfo();
      hidePreview();
    };
  }, [map]);

  return null;
}
