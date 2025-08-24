"use client";
import { useInfoData } from "./InfoDataProvider";
export default function InfoTitle() {
  const { data, loading } = useInfoData();
  if (loading) return <div className="h-[14px] w-[120px] animate-pulse rounded bg-gray-200" />;
  return <div className="text-sm font-semibold leading-tight truncate">{data?.title?.trim() || "정보 불러오기 실패"}</div>;
}
