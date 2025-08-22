import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const lat  = searchParams.get("lat");
  const lng  = searchParams.get("lng");

  // 모킹: 쿼리로 덮어쓰기 가능 (예: ?title=title&content=hello&photo=/some.jpg)
  const title   = searchParams.get("title") ?? (lat && lng ? `${Number(lat).toFixed(6)}, ${Number(lng).toFixed(6)}` : "Untitled");
  const content = searchParams.get("content") ?? (lat && lng ? `lat: ${Number(lat).toFixed(6)}\nlng: ${Number(lng).toFixed(6)}` : "");
  const photo   = searchParams.get("photo") ?? ""; // 빈 문자열이면 사진 없음

  return NextResponse.json({
    title,
    content,     // 자유 형식(텍스트). 원하면 HTML로 바꿔도 됨
    photoUrl: photo,
    meta: { lat, lng },
  });
}
