"use client";

import { useMarkerStore } from "@/store/useMarkerStore";
import Marker from "./Marker";

export default function Markers() {
  const list = useMarkerStore((s) => s.list);
  const selectedMarkersId = useMarkerStore((s) => s.selectedMarkersId);
  const grp = list.find((g) => g.id === selectedMarkersId);

  if (!grp) return null;

  return (
    <>
      {grp.markers.map((m) => (
        <Marker key={m.id} item={m} />
      ))}
    </>
  );
}
