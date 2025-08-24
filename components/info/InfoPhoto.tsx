"use client";
import { useInfoData } from "./InfoDataProvider";
export default function InfoPhoto() {
  const { data, loading } = useInfoData();
  if (loading) return <div className="h-[84px] animate-pulse rounded bg-gray-200" />;
  const p = data?.photoUrl?.trim() || "";
  return (
    <div className="flex h-[84px] items-center justify-center rounded border border-dashed overflow-hidden">
      {p ? <img src={p} alt="marker" className="h-full w-full object-cover" /> : <span className="text-[10px] text-gray-400">no photo</span>}
    </div>
  );
}
