"use client";

import { useEffect, useState } from "react";

import { fetchTrafficStats } from "../services/traffic";
import { POLL_INTERVAL_MS } from "../constants";
import type { StatsResponse } from "../types";

export function useTrafficStats(): StatsResponse | null {
  const [data, setData] = useState<StatsResponse | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const json = await fetchTrafficStats();
        if (!cancelled) setData(json);
      } catch (err) {
        console.error(err);
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
