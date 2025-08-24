"use server";

export type Point = { id: string; lat: number; lng: number };
export type ItemInfo = { id: string; title?: string; content?: string; photoUrl?: string };

/**
 * 배치로 마커 정보 조회.
 * - 실제로는 여기서 네이버 OpenAPI 호출/가공을 수행하세요.
 * - 지금은 mock: 좌표 기반으로 간단 조립
 */
export async function getMapInfos(points: Point[]): Promise<ItemInfo[]> {
  // TODO: 외부 OpenAPI 호출로 교체
  return (points ?? []).map((p) => ({
    id: p.id,
    title: `${p.lat.toFixed(6)}, ${p.lng.toFixed(6)}`,
    content: "mock content",
    photoUrl: "", // 필요시 URL
  }));
}

// ✅ 단건 조회 (lat/lng로)
export async function getMapInfo(
  lat: number,
  lng: number,
  opts?: { id?: string }
): Promise<ItemInfo> {
  const id = opts?.id ?? "single";
  const [item] = await getMapInfos([{ id, lat, lng }]);
  return item ?? { id, title: "", content: "", photoUrl: "" };
}

// (옵션) 단건: Point 그대로 받는 버전
export async function getMapInfoByPoint(point: Point): Promise<ItemInfo> {
  const [item] = await getMapInfos([point]);
  return item ?? { id: point.id, title: "", content: "", photoUrl: "" };
}