How to Install lm-sensors Version
=================================
**By Kenny Richards, KU7M**

The ircDashboard is a node.js dashboard written by John Hays - K7VE. This is a great little dashboard if you are running the ircDDBGateway server and the latest version includes some system level information, including CPU temperature. The method John gets the current CPU temperature works great on a Raspberry Pi, but is problematic on a more standard platform. Since I run ircDDBGateway on an Intel based system, I figured out an alternative solution for getting CPU temperature using the lm-sensors application. The following steps have been tested on a Ubuntu 15.10 system and I believe should work on just about any standard linux host, just adapt the installation to the included package management.

##Step 1: Install lm-sensors

Using apt-get, update the catalog and then install the lm-sensors package.

**sudo apt-get update**
**sudo apt-get install lm-sensors**
	
Once this is finished, assuming there were no errors, you should be able to call the 'sensors' application from the command line. 

**sensors**
	
The output will differ based on your particular motherboard and what options are available, but the default "coretemp-isa-0000" values should be displayed. Here is what mine looks like:

coretemp-isa-0000
Adapter: ISA adapter
Core 0:       +42.0°C  (crit = +100.0°C)

w83627dhg-isa-0290
Adapter: ISA adapter
Vcore:        +1.22 V  (min =  +0.92 V, max =  +1.48 V)
in1:          +1.87 V  (min =  +1.62 V, max =  +2.00 V)
AVCC:         +3.41 V  (min =  +2.98 V, max =  +3.63 V)
+3.3V:        +3.41 V  (min =  +2.98 V, max =  +3.63 V)
in4:          +1.87 V  (min =  +1.62 V, max =  +1.99 V)
in5:          +1.29 V  (min =  +1.13 V, max =  +1.38 V)
in6:          +1.53 V  (min =  +1.35 V, max =  +1.65 V)
3VSB:         +3.41 V  (min =  +2.98 V, max =  +3.63 V)
Vbat:         +3.30 V  (min =  +2.70 V, max =  +3.63 V)
fan1:           0 RPM  (min =  753 RPM, div = 128)  ALARM
fan2:           0 RPM  (min =  753 RPM, div = 128)  ALARM
fan3:           0 RPM  (min =  753 RPM, div = 128)  ALARM
fan4:        5625 RPM  (min =  712 RPM, div = 8)
fan5:           0 RPM  (min =  753 RPM, div = 128)  ALARM
temp1:        +30.0°C  (high = +75.0°C, hyst = +70.0°C)  sensor = thermistor
temp2:        +35.0°C  (high = +85.0°C, hyst = +83.0°C)  sensor = CPU diode
temp3:         -4.5°C  (high = +80.0°C, hyst = +75.0°C)  sensor = CPU diode
cpu0_vid:    +0.000 V
intrusion0:  ALARM


##Step 2: Install sensors.js

The next step is to add the node.js package which provides support for parsing the output of the sensors application for the dashboard. This is pretty simple if you already have node.js installed and working for ircDashboard.

**sudo npm install sensors.js**
	
##Step 3: Replace default webserver.js with modified version to use lm-sensors.

**cd /var/www-node/ircNodeDashboard**
**sudo mv webserver.js webserver-pi.js**
**sudo mv webserver-lm.js webserver.js**
	
Restart webserver.js
	
