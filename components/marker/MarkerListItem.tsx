"use client";

export default function MarkerListItem({
  title,
  content,
  photoUrl,
  loading = false,
}: {
  title?: string;
  content?: string;
  photoUrl?: string;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="rounded border bg-white p-2 text-xs">
        <div className="h-[14px] w-[140px] animate-pulse rounded bg-gray-200 mb-2" />
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <div className="h-[12px] w-[80%] animate-pulse rounded bg-gray-200" />
            <div className="h-[12px] w-[60%] animate-pulse rounded bg-gray-200" />
          </div>
          <div className="h-[84px] animate-pulse rounded bg-gray-200" />
        </div>
      </div>
    );
  }

  const t = title?.trim() ?? "";
  const c = content?.trim() ?? "";
  const p = photoUrl?.trim() ?? "";

  return (
    <div className="rounded border bg-white p-2 text-xs">
      <div className="text-sm font-semibold leading-tight truncate mb-2">
        {t || "정보 불러오기 실패"}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded border px-2 py-1 whitespace-pre-line break-words min-h-[48px]">
          {c || "정보 불러오기 실패"}
        </div>
        <div className="flex h-[84px] items-center justify-center rounded border border-dashed overflow-hidden">
          {p ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p} alt="marker" className="h-full w-full object-cover" />
          ) : (
            <span className="text-[10px] text-gray-400">no photo</span>
          )}
        </div>
      </div>
    </div>
  );
}
