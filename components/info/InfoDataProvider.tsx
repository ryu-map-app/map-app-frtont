"use client";
import { getMapInfo, ItemInfo } from "@/app/api/actions/mapInfo";
import { createContext, useContext, useEffect, useState, useTransition } from "react";

type Ctx = { data: ItemInfo | null; loading: boolean };
const InfoCtx = createContext<Ctx>({ data: null, loading: true });
export const useInfoData = () => useContext(InfoCtx);

export default function InfoDataProvider({
  lat, lng, children,
}: { lat: number; lng: number; children: React.ReactNode }) {
  const [data, setData] = useState<ItemInfo | null>(null);
  const [isPending, start] = useTransition();

  useEffect(() => {
    start(async () => {
      try { setData(await getMapInfo(lat, lng)); }
      catch { setData(null); }
    });
  }, [lat, lng]);

  return (
    <InfoCtx.Provider value={{ data, loading: isPending && !data }}>
      {children}
    </InfoCtx.Provider>
  );
}
