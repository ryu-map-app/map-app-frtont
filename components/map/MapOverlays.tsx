"use client";
import { useEffect, useRef } from "react";
import { useMapStore } from "@/store/useMapStore";
import { useMarkerStore, type Marker as MarkerModel } from "@/store/useMarkerStore";
import { shallow } from "zustand/shallow";

type OverlayData = {
  title: string;
  content?: string;   // \n 포함 텍스트 (원하면 HTML로 바꿔도 됨)
  photoUrl?: string;  // 없으면 빈 칸
  meta?: { lat?: string | number; lng?: string | number };
};

const EXTRA_QS = process.env.NEXT_PUBLIC_MAPINFO_QS || ""; // e.g. "title=title&content=hello"

export default function MapOverlays() {
  const map = useMapStore((s) => s.map);

  const poolRef = useRef<Map<string, any>>(new Map());
  const infoRef = useRef<any>(null);
  const previewRef = useRef<any>(null);
  const clickHandleRef = useRef<any>(null);

  const hidePreview = () => {
  previewRef.current?.setMap?.(null);
};

  // ---------- helpers ----------
  const infoSkeleton = () => {
    const sk = document.createElement("div");
    sk.className =
      "grid grid-rows-[auto,1fr] gap-2 min-w-[280px] rounded-lg border bg-white p-2 text-xs shadow";
    sk.innerHTML = `
      <div class="h-[14px] w-[120px] animate-pulse rounded bg-gray-200"></div>
      <div class="grid grid-cols-2 gap-2">
        <div class="space-y-1">
          <div class="h-[12px] w-[140px] animate-pulse rounded bg-gray-200"></div>
          <div class="h-[12px] w-[110px] animate-pulse rounded bg-gray-200"></div>
        </div>
        <div class="h-[84px] animate-pulse rounded bg-gray-200"></div>
      </div>
    `;
    return sk;
  };

  const buildInfoContent = (data: OverlayData, fallbackLat: string, fallbackLng: string) => {
    const { title, content, photoUrl } = data;

    const wrap = document.createElement("div");
    wrap.className =
      "grid grid-rows-[auto,1fr] gap-2 min-w-[280px] rounded-lg border bg-white p-2 text-xs shadow";

    // 1행: 타이틀
    const titleEl = document.createElement("div");
    titleEl.className = "text-sm font-semibold leading-tight truncate";
    titleEl.textContent = title || `${fallbackLat}, ${fallbackLng}`;

    // 2행: 좌/우
    const body = document.createElement("div");
    body.className = "grid grid-cols-2 gap-2";

    // 왼쪽: 내용(없으면 lat/lng 기본)
    const infoCard = document.createElement("div");
    infoCard.className = "rounded border px-2 py-1 space-y-1 whitespace-pre-line break-words";
    if (content && content.trim()) {
      infoCard.textContent = content;
    } else {
      infoCard.innerHTML = `
        <div><span class="text-gray-500">lat:</span> ${fallbackLat}</div>
        <div><span class="text-gray-500">lng:</span> ${fallbackLng}</div>
      `;
    }

    // 오른쪽: 사진
    const photoBox = document.createElement("div");
    photoBox.className =
      "flex h-[84px] items-center justify-center rounded border border-dashed text-[10px] text-gray-400 overflow-hidden";
    if (photoUrl && photoUrl.trim()) {
      const img = new Image();
      img.src = photoUrl;
      img.alt = "marker-photo";
      img.className = "h-full w-full object-cover";
      photoBox.appendChild(img);
    } else {
      photoBox.textContent = "no photo";
    }

    body.append(infoCard, photoBox);
    wrap.append(titleEl, body);
    return wrap;
  };

  const fetchOverlayInfo = async (lat: number, lng: number): Promise<OverlayData> => {
    const qs = `lat=${lat}&lng=${lng}${EXTRA_QS ? `&${EXTRA_QS}` : ""}`;
    const res = await fetch(`/api/map-info?${qs}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`map-info ${res.status}`);
    return res.json();
  };

  // ---------- 1) InfoWindow 1회 생성 ----------
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

  // ---------- 2) 맵 클릭 → 프리뷰 마커 + 외부 호출 ----------
  useEffect(() => {
    const n = (window as any).naver;
    if (!map || !n?.maps) return;

    const handle = n.maps.Event.addListener(map, "click", async (e: any) => {
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

      const latTxt = lat.toFixed(6);
      const lngTxt = lng.toFixed(6);

      // 먼저 로딩 스켈레톤
      infoRef.current!.setContent(infoSkeleton());
      infoRef.current!.open(map, previewRef.current);

      try {
        const data = await fetchOverlayInfo(lat, lng);
        const content = buildInfoContent(data, latTxt, lngTxt);
        infoRef.current!.setContent(content);
      } catch {
        const fallback = buildInfoContent(
          { title: `${latTxt}, ${lngTxt}`, content: "", photoUrl: "" },
          latTxt,
          lngTxt
        );
        infoRef.current!.setContent(fallback);
      }
    });

    clickHandleRef.current = handle;
    return () => {
      if (n?.maps?.Event && clickHandleRef.current) {
        n.maps.Event.removeListener(clickHandleRef.current);
        clickHandleRef.current = null;
      }
    };
  }, [map]);

  // ---------- 3) 저장된 마커 동기화 + 상세 표기 ----------
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

      // 제거
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
          n.maps.Event.addListener(inst, "click", async () => {
            const st = useMarkerStore.getState();
            st.selectMarker(m.id);

            // ✅ 저장 마커를 눌렀다면 남아있던 프리뷰 마커 제거
            hidePreview();

            const latTxt = m.lat.toFixed(6);
            const lngTxt = m.lng.toFixed(6);

            // 로딩 먼저
            infoRef.current!.setContent(infoSkeleton());
            infoRef.current!.open(map, inst);

            try {
              const data = await fetchOverlayInfo(m.lat, m.lng);
              const content = buildInfoContent(data, latTxt, lngTxt);
              infoRef.current!.setContent(content);
            } catch {
              const fallback = buildInfoContent(
                { title: `${latTxt}, ${lngTxt}`, content: "", photoUrl: "" },
                latTxt,
                lngTxt
              );
              infoRef.current!.setContent(fallback);
            }
          });

          pool.set(m.id, inst);
        } else {
          inst.setPosition(pos);
        }
      });
    };

    let prevSnap = selector(useMarkerStore.getState());
    sync(prevSnap);

    const unsub = useMarkerStore.subscribe((state, prevState) => {
      const next = selector(state);
      const prev = selector(prevState);

      // 그룹 변경/선택 해제 시 프리뷰 & 인포윈도우 정리
      if (
        next.selectedMarkersId !== prev.selectedMarkersId ||
        (!next.selectedMarkerId && prev.selectedMarkerId)
      ) {
        infoRef.current?.close?.();
        previewRef.current?.setMap?.(null);
      }

      // ✅ 선택된 마커가 바뀌었다면(= 저장 마커를 새로 선택) 프리뷰 제거
      if (next.selectedMarkerId && next.selectedMarkerId !== prev.selectedMarkerId) {
        hidePreview();
      }

      if (!shallow(next, prev)) {
        prevSnap = next;
        sync(next);
      }

      if (!next.selectedMarkerId) {
        infoRef.current?.close?.();
      }
    });

    return () => {
      unsub();
      if (n?.maps) {
        for (const [, inst] of pool) {
          n.maps.Event.clearInstanceListeners(inst);
          inst.setMap(null);
        }
      }
      pool.clear();
      infoRef.current?.close?.();
      previewRef.current?.setMap?.(null);
      previewRef.current = null;
    };
  }, [map]);

  return null;
}
