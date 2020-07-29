## HiveTrackerJS

### What?

This repo contains a simulation and a Web Bluetooth test using simple Serial-like communication.

To try it, install the following in your computer and BLE device.


### How?

#### Firmware

First, install the following environment:

https://github.com/sandeepmistry/arduino-nRF5

And using your freshly improved arduino IDE, install the example in the "firmware" folder.



#### Software

It requires Chrome (or chromium), and works on almost any OS (android too).
The minimum requirements are listed here:
https://github.com/WebBluetoothCG/web-bluetooth/blob/master/implementation-status.md#notes

##### Windows users

TODO


##### Ubuntu 16.04 users

You must update Bluez, the following tutorial should help, but use the version *5.43* (the new ones are missing useful tools):

https://acassis.wordpress.com/2016/06/28/how-to-get-chrome-web-bluetooth-working-on-linux/

If it's the 1st time you're using BLE devices with your linux machine, you might need to check that your OS sees your dongle / BLE hardware:

    hciconfig

If it's off, you might want to make sure that `bluetoothd` is started at boot, this tuto should help:

https://www.digitalocean.com/community/tutorials/how-to-use-systemctl-to-manage-systemd-services-and-units

...but this command should allow turning it on at least once:

    sudo hciconfig hci0 up



...and don't forget to enable the "Experimental Web Platform features":

    chrome://flags/#enable-experimental-web-platform-features


##### Enjoy!

If everything works, you should be able to see a counter once connected to your BLE device with this interface:

https://hivetracker.github.io/hivetrackerjs/visualization

