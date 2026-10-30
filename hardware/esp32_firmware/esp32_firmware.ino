/*
 * =====================================================================================
 * PROJECT: AURA // NYMPH - Wearable Biometric Ingestion Firmware
 * TARGET: ESP32 DevKit V1 (30-pin) / ESP32-C3
 * SENSORS: MAX30102 (PPG), MAX30205 (Medical Temp), MPU-6050 (Motion), SSD1306 (OLED)
 * COMMUNICATION: Bluetooth Low Energy 5.0 (Standard BLE GATT)
 * =====================================================================================
 */

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include "MAX30105.h"
#include "heartRate.h"
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

// -------------------------------------------------------------------------------------
// 1. HARDWARE PIN DEFINITIONS & CONSTANTS
// -------------------------------------------------------------------------------------
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
#define VIBRATION_PIN 25

// I2C Address Definitions
#define OLED_ADDR 0x3C
#define MAX30205_ADDR 0x48

// Standard Bluetooth SIG GATT Service & Characteristic UUIDs
#define HEART_RATE_SERVICE_UUID        "0000180d-0000-1000-8000-00805f9b34fb"
#define HR_MEASUREMENT_CHAR_UUID       "00002a37-0000-1000-8000-00805f9b34fb"
#define HEALTH_THERMOMETER_UUID        "00001809-0000-1000-8000-00805f9b34fb"
#define TEMP_MEASUREMENT_CHAR_UUID     "00002a1c-0000-1000-8000-00805f9b34fb"

// -------------------------------------------------------------------------------------
// 2. PERIPHERAL OBJECTS
// -------------------------------------------------------------------------------------
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);
MAX30105 particleSensor;
Adafruit_MPU6050 mpu;

// BLE Pointers
BLEServer* pServer = NULL;
BLECharacteristic* pHrCharacteristic = NULL;
BLECharacteristic* pTempCharacteristic = NULL;
bool deviceConnected = false;

// Telemetry State
int currentBpm = 0;
long lastBeat = 0;
float currentTempC = 36.6;
float stepIntensity = 0.0;
unsigned long lastTelemetryMillis = 0;

// -------------------------------------------------------------------------------------
// 3. BLE SERVER CALLBACKS
// -------------------------------------------------------------------------------------
class MyServerCallbacks : public BLEServerCallbacks {
    void onConnect(BLEServer* pServer) {
        deviceConnected = true;
        digitalWrite(VIBRATION_PIN, HIGH);
        delay(120);
        digitalWrite(VIBRATION_PIN, LOW);
        Serial.println(">>> [BLE] Client connected successfully!");
    }
    void onDisconnect(BLEServer* pServer) {
        deviceConnected = false;
        Serial.println(">>> [BLE] Client disconnected. Re-advertising...");
        BLEDevice::startAdvertising();
    }
};

// -------------------------------------------------------------------------------------
// 4. MAX30205 TEMPERATURE HELPER
// -------------------------------------------------------------------------------------
float readMAX30205Temperature() {
    Wire.beginTransmission(MAX30205_ADDR);
    Wire.write(0x00); // Temperature Register
    if (Wire.endTransmission() != 0) {
        return -1.0; // Sensor not responding
    }
    Wire.requestFrom(MAX30205_ADDR, 2);
    if (Wire.available() == 2) {
        int8_t msb = Wire.read();
        uint8_t lsb = Wire.read();
        int16_t raw = (msb << 8) | lsb;
        return (float)raw * 0.00390625; // 0.00390625°C per LSB
    }
    return -1.0;
}

// -------------------------------------------------------------------------------------
// 5. OLED DISPLAY RENDERER
// -------------------------------------------------------------------------------------
void updateDisplay() {
    display.clearDisplay();
    display.setTextColor(SSD1306_WHITE);
    
    // Header
    display.setTextSize(1);
    display.setCursor(0, 0);
    display.print("AURA//NYMPH ");
    if (deviceConnected) {
        display.print("[BLE: SYNC]");
    } else {
        display.print("[BLE: ADV]");
    }
    display.drawLine(0, 10, 128, 10, SSD1306_WHITE);

    // Heart Rate
    display.setCursor(0, 16);
    display.setTextSize(2);
    if (currentBpm > 30 && currentBpm < 220) {
        display.print(currentBpm);
    } else {
        display.print("--");
    }
    display.setTextSize(1);
    display.print(" bpm");

    // Body Temp
    display.setCursor(75, 16);
    display.setTextSize(2);
    display.print(currentTempC, 1);
    display.setTextSize(1);
    display.print("C");

    // Phase & Workout Effort Info
    display.setCursor(0, 40);
    display.setTextSize(1);
    display.print("Phase: Follicular D8");
    display.setCursor(0, 52);
    display.print("Effort Limit: 85% PR");

    display.display();
}

// -------------------------------------------------------------------------------------
// 6. SETUP ROUTINE
// -------------------------------------------------------------------------------------
void setup() {
    Serial.begin(115200);
    delay(500);
    Serial.println("\n=======================================================");
    Serial.println("  AURA // NYMPH - Wearable Hardware Initializing...");
    Serial.println("=======================================================");

    pinMode(VIBRATION_PIN, OUTPUT);
    digitalWrite(VIBRATION_PIN, LOW);

    // Initialize I2C Bus (Default: SDA=21, SCL=22)
    Wire.begin(21, 22);

    // 1. OLED Display Init
    if (!display.begin(SSD1306_SWITCHCAPVCC, OLED_ADDR)) {
        Serial.println("[ERROR] SSD1306 OLED initialization failed!");
    } else {
        Serial.println("[OK] SSD1306 OLED ready.");
        display.clearDisplay();
        display.setCursor(10, 25);
        display.setTextSize(1);
        display.setTextColor(SSD1306_WHITE);
        display.print("AURA//NYMPH Booting...");
        display.display();
    }

    // 2. MAX30102 PPG Init
    if (!particleSensor.begin(Wire, I2C_SPEED_FAST)) {
        Serial.println("[ERROR] MAX30102 biosensor not found on I2C bus!");
    } else {
        Serial.println("[OK] MAX30102 Biosensor ready.");
        particleSensor.setup();
        particleSensor.setPulseAmplitudeRed(0x0A);
        particleSensor.setPulseAmplitudeGreen(0);
    }

    // 3. MPU6050 Motion Sensor Init
    if (!mpu.begin()) {
        Serial.println("[ERROR] MPU-6050 accelerometer not detected!");
    } else {
        Serial.println("[OK] MPU-6050 6-Axis Motion Sensor ready.");
        mpu.setAccelerometerRange(MPU6050_RANGE_4_G);
        mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);
    }

    // 4. Bluetooth Low Energy (BLE 5.0) Stack Setup
    BLEDevice::init("AURA-Biometrics");
    pServer = BLEDevice::createServer();
    pServer->setCallbacks(new MyServerCallbacks());

    // Service: Heart Rate (0x180D)
    BLEService* pHrService = pServer->createService(HEART_RATE_SERVICE_UUID);
    pHrCharacteristic = pHrService->createCharacteristic(
        HR_MEASUREMENT_CHAR_UUID,
        BLECharacteristic::PROPERTY_NOTIFY
    );
    pHrCharacteristic->addDescriptor(new BLE2902());
    pHrService->start();

    // Service: Health Thermometer (0x1809)
    BLEService* pTempService = pServer->createService(HEALTH_THERMOMETER_UUID);
    pTempCharacteristic = pTempService->createCharacteristic(
        TEMP_MEASUREMENT_CHAR_UUID,
        BLECharacteristic::PROPERTY_NOTIFY
    );
    pTempCharacteristic->addDescriptor(new BLE2902());
    pTempService->start();

    // Advertising Setup
    BLEAdvertising* pAdvertising = BLEDevice::getAdvertising();
    pAdvertising->addServiceUUID(HEART_RATE_SERVICE_UUID);
    pAdvertising->addServiceUUID(HEALTH_THERMOMETER_UUID);
    pAdvertising->setScanResponse(true);
    pAdvertising->setMinPreferred(0x06);
    BLEDevice::startAdvertising();

    Serial.println("[OK] BLE Server Broadcasting as 'AURA-Biometrics'");
    Serial.println("=======================================================\n");
}

// -------------------------------------------------------------------------------------
// 7. MAIN LOOP ROUTINE
// -------------------------------------------------------------------------------------
void loop() {
    // 1. Sample PPG sensor for heartbeat
    long irValue = particleSensor.getIR();
    if (checkForBeat(irValue) == true) {
        long delta = millis() - lastBeat;
        lastBeat = millis();
        int beatsPerMinute = 60 / (delta / 1000.0);
        if (beatsPerMinute > 40 && beatsPerMinute < 200) {
            currentBpm = (currentBpm * 3 + beatsPerMinute) / 4; // Moving average
        }
    }

    // 2. Transmit BLE & Update Display every 1000ms
    if (millis() - lastTelemetryMillis > 1000) {
        lastTelemetryMillis = millis();

        // Sample Temperature
        float t = readMAX30205Temperature();
        if (t > 25.0 && t < 45.0) {
            currentTempC = t;
        }

        // Sample Motion
        sensors_event_t a, g, temp;
        mpu.getEvent(&a, &g, &temp);
        stepIntensity = sqrt(a.acceleration.x * a.acceleration.x +
                             a.acceleration.y * a.acceleration.y +
                             a.acceleration.z * a.acceleration.z);

        // Update Wrist OLED
        updateDisplay();

        // Print Debug Log to Serial Monitor
        Serial.printf("[TELEMETRY] HR: %d bpm | Temp: %.2f C | Accel: %.2f m/s2 | BLE: %s\n",
                      currentBpm, currentTempC, stepIntensity, deviceConnected ? "CONNECTED" : "WAITING");

        // Transmit via Bluetooth if connected
        if (deviceConnected) {
            // Send Heart Rate Measurement Packet (Flags: 0x00 = 8-bit HR)
            uint8_t hrPacket[2] = { 0x00, (uint8_t)currentBpm };
            pHrCharacteristic->setValue(hrPacket, 2);
            pHrCharacteristic->notify();

            // Send Health Thermometer IEEE-11073 FLOAT Packet
            int32_t mantissa = (int32_t)(currentTempC * 100);
            uint8_t tempPacket[5] = {
                0x00, // Celcius
                (uint8_t)(mantissa & 0xFF),
                (uint8_t)((mantissa >> 8) & 0xFF),
                (uint8_t)((mantissa >> 16) & 0xFF),
                (uint8_t)0xFE // Exponent (-2)
            };
            pTempCharacteristic->setValue(tempPacket, 5);
            pTempCharacteristic->notify();
        }
    }
}
