"use client";

import InfoDataProvider from "./InfoDataProvider";
import InfoTitle from "./InfoTitle";
import InfoContentText from "./InfoContentText";
import InfoPhoto from "./InfoPhoto";
import SaveMarkerButton from "./SaveMarkerButton";
import DeleteMarkerButton from "./DeleteMarkerButton";
import DirectionsButton from "./DirectionsButton";

export default function InfoWindow({
  lat,
  lng,
  onRequestClose,
  markerId,                 // ⬅️ 추가: 저장 마커일 때만 전달
}: {
  lat: number;
  lng: number;
  onRequestClose?: () => void;
  markerId?: string;        // ⬅️ 프리뷰면 undefined
}) {
  return (
    <InfoDataProvider lat={lat} lng={lng}>
      <div className="grid grid-rows-[auto,1fr,auto] gap-2 min-w-[280px] rounded-lg border bg-white p-2 text-xs shadow">
        <InfoTitle />
        <div className="grid grid-cols-2 gap-2">
          <InfoContentText />
          <InfoPhoto />
        </div>
        <div className="flex items-center gap-2">
          {markerId ? (
            <DeleteMarkerButton markerId={markerId} onDone={onRequestClose} />
          ) : (
            <SaveMarkerButton lat={lat} lng={lng} onDone={onRequestClose} />
          )}
          <DirectionsButton lat={lat} lng={lng} />
        </div>
      </div>
    </InfoDataProvider>
  );
}
