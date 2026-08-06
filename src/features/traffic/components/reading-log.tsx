import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { fmtTime } from "../constants";
import type { LogRow } from "../types";

export function ReadingLog({ logs }: { logs: LogRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reading Log</CardTitle>
        <CardDescription>Latest 50 sensor readings</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Vehicle Count</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-mono text-xs">{fmtTime(log.recordedAt)}</TableCell>
                <TableCell>{log.vehicleCount}</TableCell>
                <TableCell>
                  {log.isCrowded ? (
                    <Badge>Busy</Badge>
                  ) : (
                    <Badge variant="secondary">Quiet</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
