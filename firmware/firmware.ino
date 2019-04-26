#include <SPI.h>
#include <BLEPeripheral.h>
#include "BLESerial.h"

#define BLE_NAME             "HT-UART"
#define PIN_SERIAL_RX        (25) /* J4 - E */
#define PIN_SERIAL_TX        (27) /* J4 - D */

BLESerial bleSerial;


void setup() {
    Serial.setPins(PIN_SERIAL_RX, PIN_SERIAL_TX);
    Serial.begin(115200 * 2);
    Serial.println("UART OK");

    bleSerial.setLocalName(BLE_NAME);
    bleSerial.setDeviceName(BLE_NAME);
    bleSerial.begin();
}

void loop() {
    const float refresh_period_us = 1000 * 1000/120.; // 120Hz => 8.3 ms
    static float timestamp_us = 0;

    bleSerial.poll();

    if (micros() - timestamp_us > refresh_period_us) {
        timestamp_us = micros();
        data_tx_simulation();
    }
}

// Simulate sending data to check if we lose packets
void data_tx_simulation() {
    static int base_axis = 0;
    static int centroid = 0;

    Serial.write(0xFF);
    Serial.write(0xFF);

    // simulate 2 bases x 2 directions
    if (bleSerial) bleSerial.write((  base_axis) % 4);
                      Serial.write((++base_axis) % 4);

    // simulate time stamps that make no sense but should increment
    // it should be 8 bytes (4 timings on 2 bytes each)
    for (int i = 0; i < 4; i++) {
        Serial.write((centroid >> 0) & 0xFF);
        Serial.write((centroid >> 8) & 0xFF);

        if (bleSerial) {
            bleSerial.write((centroid >> 0) & 0xFF);
            bleSerial.write((centroid >> 8) & 0xFF);
        }
    }
    centroid++;

    if (bleSerial) bleSerial.write('\n');
}

