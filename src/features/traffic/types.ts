export type LogRow = {
  id: number;
  vehicleCount: number;
  isCrowded: boolean;
  recordedAt: string;
};

export type RawRow = {
  bucket: string;
  vehicles: number;
  readings: number;
  crowded: number;
};

export type StatsResponse = {
  today: RawRow[];
  prevToday: RawRow[];
  last7: RawRow[];
  prevLast7: RawRow[];
  last30: RawRow[];
  prevLast30: RawRow[];
  logs: LogRow[];
  summary: {
    totalVehiclesToday: number;
    /** Jumlah kali sensor mengirim data hari ini (COUNT baris) */
    readingsToday: number;
    avgVehiclesToday: number;
  };
};

export type Range = "today" | "7d" | "30d";
