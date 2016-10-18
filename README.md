ircDDBGateway “Node” Dashboard
==============================

IrcDDBGateway node dashboard is a lightweight, real-time, self configuring dashboard for G4KLX's D-STAR gateway. Both the server and client are written in JavaScript.
Presentation is in a single index.html file with css styling.

Adding local content to the webpage is simply a matter of editing the **index.html** file.

Additional html pages can be added to the 'public' folder.

The dashboard will run on the computer where ircDDBGateway is installed.  **ircddbgateway must have been started on the computer, at least once before the dashboard will run, it is dependent on configuration and log files that are part of ircddbgateway in order to startup and run.**

Preparation
-----------

This dashboard requires the installation of node.js, a framework to run server applications written in JavaScript.

A fairly recent version of node.js should be used v0.10.0 or newer should be sufficient. Due to limited availability of v4.0.0 or newer on ARM based computers like the Raspberry Pi, it has not been extensively tested on that platform.

All testing has been on Linux based systems, mostly Raspbian and Ubuntu. It will likely run on Windows<sup id="a1">[1](#foot1)</sup> or MacOS if the paths to configuration and log files are available.

The main **node.js** installation site is [https://nodejs.org/en/download/](https://nodejs.org/en/download/), with many Linux package manager installations documented at [https://github.com/nodejs/node-v0.x-archive/wiki/Installing-Node.js-via-package-manager](https://github.com/nodejs/node-v0.x-archive/wiki/Installing-Node.js-via-package-manager)

Users of Raspbian Jesse or Compass Linux can simply install:

**sudo apt-get update**

**sudo apt-get install nodejs npm**

Once **node.js** has been successfully installed, install the package forever.  

**sudo npm install forever**

See: [http://blog.nodejitsu.com/keep-a-nodejs-server-up-with-forever/](http://blog.nodejitsu.com/keep-a-nodejs-server-up-with-forever/)


Installation
------------

When installing the dashboard, you will probably want to run it from a system directory.  I typically create a directory of **/var/www-node** and perform the following under that directory.  I recommend the **git** install. If you haven't installed git:

**sudo apt-get install git**

You may want to perform the steps as root, either by logging in or executing **sudo su -** but be very careful using this method because with superuser power, comes super responsibility.

1.  Download the and unpack the zip file by selecting the button on https://github.com/johnhays/ircNodeDashboard or use git 

    **git clone https://github.com/johnhays/ircNodeDashboard.git**
    
    If you used git:
    
    **cd ircNodeDashboard**
    
    If you use the zip file and uncompressed it:
    
    **cd ircNodeDashboard-master**

2.  Install needed libraries
    
    **npm install**

    (This will take some time, and there will be 'errors' for optional sub-components, you can ignore these warnings.)

3.  Make sure no other webserver is running on port 80 (e.g. Apache)

4.  Start up a test run in a terminal window
    
    **node webserver.js**
    
5.  Open a web browser and see if you see the webpage using either http://localhost or http://**the ip address** (if you have been successful kill (Control-C) the program)


Running ircNodeDashboard
------------------------

In a terminal run

**sudo nohup forever webserver.js \> webserver.log &**

Note: Some distributions may install node as nodejs, if the node or forever commands fail, you may need to navigate to the directory where nodejs is installed and create a soft link from node.

**ln -s nodejs node**

You may want to create a script to start and stop the webserver and have it automatically restart on reboot.

<b id='foot1'>1</b> Windows may be problematic due to configuration being held in the registry, though one could extract the registry data into a ircDDBGateway text configuration file or an industrious developer could modify **webserver.js** to populate the config object directly from the registry using a library like [https://www.npmjs.com/package/winreg](https://www.npmjs.com/package/winreg) - The author is not a fan of Windows for server applications, so he has not undertaken any work in this area.[↩](#a1)
