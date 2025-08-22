"use client"
import { useMapStore } from "@/store/useMapStore";
import { useEffect, useRef } from "react"

export default function Map({ children }: { children?: React.ReactNode }) {
    const hostRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<any>(null);

    const setMap = useMapStore((s) => s.setMap);
    const center = useMapStore((s) => s.center);
    const zoom   = useMapStore((s) => s.zoom);


    useEffect(() => {
        const naver = (window as any).naver;
        if (!hostRef.current || mapRef.current || !naver?.maps) return;

        const state = useMapStore.getState();

        const map = new naver.maps.Map(hostRef.current, {
                center: new naver.maps.LatLng(state.center.lat, state.center.lng),
                zoom: state.zoom,
                mapDataControl: false,
                scaleControl: false,
            });
        mapRef.current = map;
        setMap(map);

        return () => {
                if (naver?.maps?.Event && mapRef.current) naver.maps.Event.clearInstanceListeners(mapRef.current);
                mapRef.current = null;
                setMap(null);
            };
    }, []);

    // center/zoom 변경 반영
    useEffect(() => {
        const naver = (window as any).naver;
        const map = mapRef.current;
        if (!map || !naver.maps) return;

        map.setCenter(new naver.maps.LatLng(center.lat, center.lng));
        map.setZoom(zoom)
    }, [center, zoom])

    return (
        <div className="grid w-full max-w-[1100px] h-[60vh] min-h-[420px] rounded-lg overflow-hidden bg-white">
            <div
            ref={hostRef}
            className="col-start-1 row-start-1 [&_img]:max-w-none [&_canvas]:max-w-none"
            />
            <div className="relative col-start-1 row-start-1 pointer-events-none">
            {children}
            </div>
        </div>
        );





}