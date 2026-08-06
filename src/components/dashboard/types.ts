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
  last7: RawRow[];
  last30: RawRow[];
  logs: LogRow[];
  summary: {
    totalVehiclesToday: number;
    readingsToday: number;
    avgVehiclesToday: number;
  };
};

export type Range = "today" | "7d" | "30d";
