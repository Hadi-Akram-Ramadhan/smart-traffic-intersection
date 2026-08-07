"use client";

import { useEffect, useState } from "react";

import { fetchTrafficStats } from "../services/traffic";
import { POLL_INTERVAL_MS } from "../constants";
import type { StatsResponse } from "../types";

export function useTrafficStats(): StatsResponse | null | "error" {
  const [data, setData] = useState<StatsResponse | null | "error">(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const json = await fetchTrafficStats();
        if (!cancelled) setData(json);
      } catch (err) {
        console.error(err);
        if (!cancelled) setData("error");
      }
    }

    load();
    const id = setInterval(load, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return data;
}
