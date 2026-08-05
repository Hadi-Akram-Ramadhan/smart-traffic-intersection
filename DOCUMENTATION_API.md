# Smart Traffic Intersection — API Documentation

**Base URL (Production):**
```
https://smart-traffic-intersection-dz31a7elq.vercel.app
```

**Base URL (Local Dev):**
```
http://localhost:3000
```

---

## Sensor Readings

### POST `/api/sensor-readings`

Menerima bacaan sensor kendaraan dari IoT device. Menyimpan ke database dan menghitung flag keramaian otomatis.

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "vehicleCount": 5
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `vehicleCount` | integer | Yes | Jumlah kendaraan terdeteksi (>= 0) |

**Response 201 Created:**
```json
{
  "id": 13,
  "vehicleCount": 5,
  "isCrowded": true,
  "recordedAt": "2026-08-05T13:06:11.335Z"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Primary key auto-increment |
| `vehicleCount` | integer | Echo dari request |
| `isCrowded` | boolean | `true` jika `vehicleCount > 2`, else `false` |
| `recordedAt` | string (ISO 8601) | Timestamp server saat disimpan (UTC, timestamptz) |

**Error Responses:**

| Status | Response | Cause |
|--------|----------|-------|
| 400 | `{"error": "vehicleCount must be a non-negative integer"}` | Body missing, non-integer, negative, atau non-number |

---

### GET `/api/sensor-readings`

Mengambil riwayat bacaan sensor terbaru.

**Query Parameters:**

| Param | Type | Default | Max | Description |
|-------|------|---------|-----|-------------|
| `limit` | integer | 50 | 200 | Jumlah record dikembalikan (descending by `recordedAt`) |

**Example:**
```
GET /api/sensor-readings?limit=10
```

**Response 200 OK:**
```json
[
  {
    "id": 14,
    "vehicleCount": 2,
    "isCrowded": false,
    "recordedAt": "2026-08-05T13:06:21.211Z"
  },
  {
    "id": 13,
    "vehicleCount": 5,
    "isCrowded": true,
    "recordedAt": "2026-08-05T13:06:11.335Z"
  }
]
```

---

## Database Schema

**Table: `TrafficReading`**

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | SERIAL | PRIMARY KEY |
| `vehicleCount` | INTEGER | NOT NULL |
| `isCrowded` | BOOLEAN | NOT NULL |
| `recordedAt` | TIMESTAMPTZ(6) | NOT NULL DEFAULT CURRENT_TIMESTAMP |

**Index:** `recordedAt` (descending untuk query terbaru)

---

## IoT Integration Examples

### ESP32 / Arduino (C++)

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid = "YOUR_SSID";
const char* password = "YOUR_PASSWORD";
const char* apiUrl = "https://smart-traffic-intersection-dz31a7elq.vercel.app/api/sensor-readings";

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected");
}

void sendVehicleCount(int count) {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  http.begin(apiUrl);
  http.addHeader("Content-Type", "application/json");

  String body = "{\"vehicleCount\":" + String(count) + "}";
  int httpCode = http.POST(body);

  if (httpCode == 201) {
    String response = http.getString();
    Serial.println("Success: " + response);
  } else {
    Serial.printf("Error: %d - %s\n", httpCode, http.getString().c_str());
  }
  http.end();
}

void loop() {
  // Replace dengan pembacaan sensor aktual
  int count = readSensor(); // implement yourself
  sendVehicleCount(count);
  delay(5000); // kirim setiap 5 detik
}
```

### Python (Raspberry Pi / PC)

```python
import requests
import time

API_URL = "https://smart-traffic-intersection-dz31a7elq.vercel.app/api/sensor-readings"

def send_reading(count: int):
    try:
        resp = requests.post(API_URL, json={"vehicleCount": count}, timeout=10)
        if resp.status_code == 201:
            print(f"Sent: {resp.json()}")
        else:
            print(f"Error {resp.status_code}: {resp.text}")
    except Exception as e:
        print(f"Request failed: {e}")

while True:
    count = read_your_sensor()  # implement
    send_reading(count)
    time.sleep(5)
```

### cURL (Testing)

```bash
# Kirim bacaan
curl -X POST https://smart-traffic-intersection-dz31a7elq.vercel.app/api/sensor-readings \
  -H "Content-Type: application/json" \
  -d '{"vehicleCount": 5}'

# Ambil 10 terbaru
curl "https://smart-traffic-intersection-dz31a7elq.vercel.app/api/sensor-readings?limit=10"
```

---

## Logic: Keramaian (isCrowded)

```
isCrowded = (vehicleCount > 2)
```

| vehicleCount | isCrowded |
|--------------|-----------|
| 0, 1, 2      | false     |
| 3, 4, 5...   | true      |

Logika dihitung di server saat POST, bukan dikirim client.

---

## Environment Variables (Vercel)

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Supabase transaction pooler (port 6543, pgbouncer) | Yes |
| `DIRECT_URL` | Supabase session pooler (port 5432, migrations) | Yes |

---

## Notes

- Timestamp `recordedAt` di-generate server (PostgreSQL `CURRENT_TIMESTAMP`), bukan dari client
- `isCrowded` bersifat derived, tidak disediakan oleh sensor
- API public (no auth) — production deployment protection dimatikan
- Rate limit: default Vercel serverless (1000 req/10s per function instance)
- Untuk high-frequency sensor, pertimbangkan batch/queue di edge