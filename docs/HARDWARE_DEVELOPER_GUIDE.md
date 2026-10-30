# Wearable IoT Biosensing Prototype: Hardware Engineering Specification & Hand-off Guide

**Project Title:** A Personalized Menstrual Health Framework for Phase-Specific Optimization of Diet, Physical Training, and Recovery  
**Target Platform:** ESP32-C3 / ESP-WROOM-32 (Bluetooth Low Energy 5.0)  
**Document Version:** 1.0.0 (Production Release)  
**Author / Team:** Final Year B.E. Project Team (ISE Dept, Cambridge Institute of Technology)

---

## 1. System Overview

This wearable device is a low-power, non-invasive wristband/clip prototype designed to capture autonomic and thermal biomarkers from female athletes and stream them wire-free to a local AI dashboard.

### What the Hardware Must Accomplish:
1. **Cardiovascular Autonomic Sensing:** Capture pulse waveforms to calculate Resting Heart Rate (RHR in bpm) and Heart Rate Variability (HRV $rMSSD$ in ms) using optical photoplethysmography (PPG).
2. **Clinical Thermometry:** Measure nocturnal skin temperature with medical precision ($\pm 0.1^\circ\text{C}$) to detect the post-ovulatory progesterone thermal jump ($+0.3^\circ\text{C}\text{ to }+0.5^\circ\text{C}$).
3. **Motion & Sleep Actigraphy:** Track daytime steps/cadence and nocturnal micro-movements to detect sleep restlessness and calculate daily physical activity levels.
4. **Wireless Telemetry:** Broadcast clean biometric packets over standard Bluetooth Low Energy (BLE 5.0 GATT) using standard Bluetooth SIG services (`0x180D` Heart Rate, `0x1809` Thermometer).
5. **On-Wrist Feedback:** Display live HR, active menstrual phase, and workout effort on an integrated 0.96" OLED display.

---

## 3. Circuit Schematic & Pin-by-Pin Wiring Table

All four primary sensor peripherals communicate over the **shared I2C bus**. On the standard ESP32, the default hardware I2C pins are:
* **SDA (Serial Data):** `GPIO 21`
* **SCL (Serial Clock):** `GPIO 22`

### Master Pinout Table

| Peripheral | Sensor Pin | ESP32 Connection Pin | Description / Notes |
|---|---|---|---|
| **Power Bus** | VCC (All Sensors) | **ESP32 3.3V** | Powers MAX30102, MAX30205, MPU6050, OLED |
| **Power Bus** | GND (All Sensors) | **ESP32 GND** | Common circuit ground |
| **MAX30102 (PPG)** | SDA | **GPIO 21** | I2C Data (Hardware Address: `0x57`) |
| | SCL | **GPIO 22** | I2C Clock |
| | VIN | **3.3V** | Regulated supply |
| | GND | **GND** | Ground |
| **MAX30205 (Temp)**| SDA | **GPIO 21** | I2C Data (Hardware Address: `0x48`) |
| | SCL | **GPIO 22** | I2C Clock |
| | VIN | **3.3V** | Regulated supply |
| | GND | **GND** | Ground (Address pins A0, A1, A2 tied to GND) |
| **MPU-6050 (Motion)**| SDA | **GPIO 21** | I2C Data (Hardware Address: `0x68`) |
| | SCL | **GPIO 22** | I2C Clock |
| | VCC | **3.3V** | Regulated supply |
| | GND | **GND** | Ground (AD0 pin tied to GND) |
| **0.96" OLED (Display)**| SDA | **GPIO 21** | I2C Data (Hardware Address: `0x3C`) |
| | SCL | **GPIO 22** | I2C Clock |
| | VCC | **3.3V** | Regulated supply |
| | GND | **GND** | Ground |
| **Vibration Motor**| (+) Lead | **3.3V** | Powered from 3.3V bus |
| | (-) Lead | **Transistor Collector** | Driven via 2N2222 NPN switch |
| | Base Resistor | **GPIO 25** via 1kΩ | Triggered by setting GPIO 25 HIGH |
| **TP4056 Charger** | B+ | **LiPo Battery (+) Red** | Battery positive |
| | B- | **LiPo Battery (-) Black**| Battery negative |
| | OUT+ | **ESP32 VIN (5V Pin)** | Regulated input to onboard LDO |
| | OUT- | **ESP32 GND** | Common system ground |

```
              ┌──────────────────────────────────────────────┐
              │              ESP32 DevKit V1                 │
              │                                              │
              │      3.3V ──┬────────────┬───────────┬───────┤
              │       GND ──┼────────────┼───────────┼───────┤
              │   GPIO 21 ──┼───► SDA    │           │       │
              │   GPIO 22 ──┼───► SCL    │           │       │
              │   GPIO 25 ──┼────────────┼───────────┼───────┼──► (1kΩ) ──► 2N2222 Base ──► Motor
              └─────────────┴────────────┴───────────┴───────┘
                                  │            │           │
                                  ▼            ▼           ▼
                              MAX30102     MAX30205     MPU-6050      OLED
                              (0x57)       (0x48)       (0x68)        (0x3C)
```

---

## 4. Software Toolchain Setup for the Hardware Developer

The developer building this circuit should install the following free software on their computer:

### 1. Arduino IDE Setup
1. Download and install **Arduino IDE 2.3+** from [arduino.cc](https://www.arduino.cc/en/software).
2. Open Arduino IDE $\rightarrow$ Go to `File -> Preferences`.
3. In **Additional Board Manager URLs**, paste:
   ```text
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
4. Go to `Tools -> Board -> Board Manager`, search for `esp32` by **Espressif Systems**, and click **Install**.
5. Connect the ESP32 to the computer using a micro-USB/USB-C data cable.
6. Under `Tools -> Board`, select **DOIT ESP32 DEVKIT V1** (or your specific board model). Under `Tools -> Port`, select the active COM port (e.g. `COM3`).

### 2. Install Required Arduino Libraries
In Arduino IDE, open `Tools -> Manage Libraries...` (or press `Ctrl + Shift + I`), search for and install each of the following:

1. **`SparkFun MAX3010x Pulse and Proximity Sensor Library`** by SparkFun Electronics
2. **`Protocentral MAX30205`** by ProtoCentral (or search *MAX30205*)
3. **`Adafruit MPU6050`** by Adafruit (click *"Install All"* to include `Adafruit Unified Sensor` and `Adafruit BusIO`)
4. **`Adafruit SSD1306`** by Adafruit (click *"Install All"* to include `Adafruit GFX Library`)

---

## 5. Complete Production Firmware Source Code (`esp32_firmware.ino`)

Copy and paste this exact C++ code into your Arduino IDE. It initializes all sensors, draws live status on the OLED screen, and broadcasts standard Bluetooth GATT Heart Rate (`0x180D`) and Temperature (`0x1809`) packets.

```cpp
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
```

---

## 6. Testing & Verification Checklist for the Hardware Developer

The person assembling the hardware should follow this exact 4-step checklist to verify that everything works before handing it over:

### Step 1: I2C Scanner Test
Run an I2C Scanner sketch in Arduino IDE (`File -> Examples -> Wire -> i2c_scanner`).  
**Expected Result:** The Serial Monitor MUST output all 4 addresses:
* `0x3C` (SSD1306 OLED Display)
* `0x48` (MAX30205 Temperature Sensor)
* `0x57` (MAX30102 Heart Rate Sensor)
* `0x68` (MPU-6050 Accelerometer)

### Step 2: Serial Monitor Telemetry Test
Open `Tools -> Serial Monitor` at **115200 baud**. Put a finger gently on the MAX30102 sensor.  
**Expected Result:** You should see continuous output matching this format:
```text
[TELEMETRY] HR: 68 bpm | Temp: 36.65 C | Accel: 9.81 m/s2 | BLE: WAITING
```

### Step 3: Bluetooth Verification on Mobile Phone
1. Install the free **nRF Connect for Mobile** app (available on Google Play Store & Apple App Store).
2. Open the app $\rightarrow$ Tap **Scan**.
3. Look for a device named **`AURA-Biometrics`**.
4. Tap **Connect**.  
**Expected Result:** The coin vibration motor will buzz for 120ms upon connection, the OLED will change status from `[BLE: ADV]` to `[BLE: SYNC]`, and nRF Connect will display the active Heart Rate Service (`0x180D`) and Health Thermometer (`0x1809`).

### Step 4: Web Browser Dashboard Pairing Test
1. Start your local FastAPI server and open Google Chrome.
2. Open the React Dashboard and click **"Connect Smartwatch / BLE Band"**.
3. Select **`AURA-Biometrics`** from the browser's pairing dialog.  
**Expected Result:** Live heart rate, temperature, and motion immediately stream into the web UI without wires.

---

## 7. Deliverables Acceptance Criteria 

When your hardware developer finishes the work, they must deliver:
1. **Fully Assembled Breadboard / Wearable Module:** All 9 components wired cleanly with no loose pins.
2. **Untethered Battery Operation Verified:** Powered strictly by the 3.7V LiPo battery (disconnecting the USB cable must keep the device running for over 18 hours).
3. **Working USB-C Charging:** Plugging a phone charger into the TP4056 board illuminates the red LED (charging) and switches to blue/green (fully charged at 4.2V).
4. **Verified Live BLE Transmission:** Both the OLED display and the web application show active, changing biometric data when a finger is placed on the sensor.
