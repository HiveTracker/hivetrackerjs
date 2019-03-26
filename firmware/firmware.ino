#include <SPI.h>
#include <BLEPeripheral.h>
#include "BLESerial.h"

#define BLE_NAME             "HT mini"
#define PIN_SERIAL_RX        (25) /* J4 - E */
#define PIN_SERIAL_TX        (27) /* J4 - D */

BLESerial bleSerial;


void setup() {
    bleSerial.setLocalName(BLE_NAME);
    bleSerial.setDeviceName(BLE_NAME);

    Serial.setPins(PIN_SERIAL_RX, PIN_SERIAL_TX);
    Serial.begin(115200);
    Serial.println("UART OK");

    bleSerial.begin();
    bleSerial.print("BLE OK - device name");
    bleSerial.println(BLE_NAME);
}

void loop() {
    bleSerial.poll();

    forward();
    loopback();
    spam();
}


// forward received from Serial to BLESerial and vice versa
void forward() {
    if (bleSerial && Serial) {
        int byte;
        while ((byte = bleSerial.read()) > 0) Serial.write((char)byte);
        while ((byte = Serial.read()) > 0) bleSerial.write((char)byte);
    }
}

// echo all received data back
void loopback() {
    if (bleSerial && Serial) {
        int byte;
        while ((byte = bleSerial.read()) > 0) bleSerial.write(byte);
        while ((byte = Serial.read()) > 0) Serial.write((char)byte);
    }
}

// periodically sent time stamps
void spam() {
    int time = millis() / 1000;

    if (bleSerial && Serial) {
        bleSerial.println(time);
        Serial.println(time);
        delay(1000);
    }
}

