"use client";
import MarkerList from "../marker/MarkerList";
import Map from "./Map";
import MapOverlays from "./MapOverlays";
import MarkersPanel from "@/components/marker/MarkersPanel";
import MarkersToolbar from "@/components/marker/MarkersToolbar";

export default function MapPage() {
  return (
      <section className="py-6">
        <div className="mx-auto w-full max-w-[1100px] px-2">
          <Map>
            <MapOverlays />
            {/* 클릭 필요한 DOM 오버레이만 auto */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-auto">
              <MarkersPanel />
            </div>
          </Map>

          <div className="mt-3">
            <MarkersToolbar />
          </div>
          <MarkerList/>
        </div>
      </section>
    );


}
