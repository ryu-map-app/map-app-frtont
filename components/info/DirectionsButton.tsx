"use client";
export default function DirectionsButton({ lat, lng }: { lat: number; lng: number }) {
  return (
    <button
      className="rounded border px-2 py-1 text-[11px] hover:bg-gray-50"
      onClick={() => {
        // TODO: 길찾기 로직 연결 (예: 외부 지도 앱 딥링크)
      }}
    >
      길찾기
    </button>
  );
}
