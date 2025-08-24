"use client";
import { useInfoData } from "./InfoDataProvider";
export default function InfoContentText() {
  const { data, loading } = useInfoData();
  if (loading) return (
    <div className="space-y-1">
      <div className="h-[12px] w-[140px] animate-pulse rounded bg-gray-200" />
      <div className="h-[12px] w-[110px] animate-pulse rounded bg-gray-200" />
    </div>
  );
  return (
    <div className="rounded border px-2 py-1 whitespace-pre-line break-words min-h-[48px]">
      {data?.content?.trim() || "정보 불러오기 실패"}
    </div>
  );
}
