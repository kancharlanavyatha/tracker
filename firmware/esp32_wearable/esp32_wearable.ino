/**
 * ESP32 → HTTP POST /api/v1/wearable-sync (no extra JSON libraries).
 * Set WIFI_SSID, WIFI_PASS, API_HOST, USER_UUID. Add NTP for real timestamps.
 */
#include <WiFi.h>
#include <HTTPClient.h>

const char *WIFI_SSID = "YOUR_WIFI";
const char *WIFI_PASS = "YOUR_PASSWORD";
const char *API_HOST = "192.168.0.10";
const uint16_t API_PORT = 8000;
const char *USER_UUID = "00000000-0000-0000-0000-000000000000";

unsigned long lastPost = 0;
const unsigned long intervalMs = 30000;

void setup() {
  Serial.begin(115200);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED) {
    delay(400);
    Serial.print(".");
  }
  Serial.println(" WiFi OK");
}

void loop() {
  unsigned long now = millis();
  if (now - lastPost < intervalMs) {
    delay(200);
    return;
  }
  lastPost = now;

  if (WiFi.status() != WL_CONNECTED) {
    WiFi.reconnect();
    return;
  }

  HTTPClient http;
  String url = String("http://") + API_HOST + ":" + String(API_PORT) + "/api/v1/wearable-sync";
  http.begin(url);
  http.addHeader("Content-Type", "application/json");

  long steps = 4000 + random(2000);
  float hrv = 38.0f + random(0, 80) / 10.0f;
  String body = String("{\"user_id\":\"") + USER_UUID + "\",\"points\":[{\"recorded_at\":\"2026-01-01T12:00:00Z\","
                  "\"hrv_ms\":" +
                  String(hrv, 1) + ",\"spo2_pct\":97.0,\"resting_hr\":60.0,\"steps\":" + steps +
                  ",\"workout_type\":\"demo\"}]}";

  int code = http.POST(body);
  Serial.printf("POST %d\n", code);
  http.end();
}
