#include <SPI.h>
#include <BLEPeripheral.h>
#include "BLESerial.h"

#define BLE_NAME             "HT-UART"
#define PIN_SERIAL_RX        (25) /* J4 - E */
#define PIN_SERIAL_TX        (27) /* J4 - D */

byte message[10];
BLESerial bleSerial;

void setup() {
    Serial.setPins(PIN_SERIAL_RX, PIN_SERIAL_TX);
    Serial.begin(115200 * 2);
    Serial.println("UART OK");

    bleSerial.setLocalName(BLE_NAME);
    bleSerial.setDeviceName(BLE_NAME);
    bleSerial.setConnectionInterval(0x0006,0x0006);
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
    static int centroid = 0x1717;

    message[0] = (++base_axis) % 4;
    message[1] = 0;
    // simulate time stamps that make no sense but should increment
    // it should be 8 bytes (4 timings on 2 bytes each)
    for (int i = 0; i < 4; i++) {
        message[i * 2 + 2] = (centroid >> 0) & 0xFF;
        message[i * 2 + 3] = (centroid >> 8) & 0xFF;
        message[1] += centroid & 0xFF;
    }

    // set the high-bits and metadata on message separator (base/axis + checksum)
    message[0] = 0x80 | (message[0] << 5) & 0x60 | (message[1] >> 4) & 0x0F;
    message[1] = 0x80 | (message[1] >> 0) & 0x0F;
    if (bleSerial)
        bleSerial.write(message, 10);
    else
        Serial.write(message, 10);
}
