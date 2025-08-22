"use client";

import { useEffect, useRef } from "react";
import { useMapStore } from "@/store/useMapStore";
import { useMarkerStore, type Marker as MarkerModel } from "@/store/useMarkerStore";

export default function Marker({ item }: { item: MarkerModel }) {
  const map = useMapStore((s) => s.map);
  const ref = useRef<any>(null);

  useEffect(() => {
    const n = (window as any).naver;
    if (!map || !n?.maps) return;

    const pos = new n.maps.LatLng(item.lat, item.lng);
    if (!ref.current) {
      ref.current = new n.maps.Marker({ map, position: pos });
      n.maps.Event.addListener(ref.current, "click", () => {
        useMarkerStore.getState().selectMarker(item.id);
      });
    } else {
      ref.current.setPosition(pos);
    }

    return () => {
      ref.current?.setMap(null);
      ref.current = null;
    };
  }, [map, item.id, item.lat, item.lng]);

  return null;
}
