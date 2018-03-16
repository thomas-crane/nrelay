# Installing nrelay on Android
nrelay can be installed and run on an Android device by using Linux Deploy and BusyBox. To run the required software your phone **must have root access**.
Image examples of the configuration options [can be found here.](https://imgur.com/a/CvMOp)

## Installing the required software
Both Linux Deploy and BusyBox can be downloaded from their respective GitHub repositories.
 + [Linux Deploy](https://github.com/meefik/linuxdeploy/releases)
 + [BusyBox](https://github.com/meefik/busybox/releases)

Since SSH access is required, you also need access to a terminal. ConnectBot is a free console emulator on the Google Play Store, and will work just fine.

After installing BusyBox, check your location of BusyBox in the settings, make sure it's `/system/xbin`.

After installing the Linux Deploy apk, open Linux Deploy and go to `Settings`, then
 1. Select the correct PATH to your BusyBox. The default PATH is: `/system/xbin`
 2. Choose Update ENV
 3. Open options from the bottom right corner and set your configuration as follows:

```
Containerization Method: chroot
Distribution: Debian
Architecture: armhf
Distribution suite: stretch
Source path: default
Installation type: Directory
User name: android
User password: Set your password here (Required later for SSH access)
Privileged Users: root
Localization: en_US.UTF-8 (Any language is fine)
-
Init: Disable
-
Mounts: Disable (optional)
default path: /mnt/sdcard
-
SSH: Enable
Default settings
-
PulseAudio: Disable
-
GUI: Enable (optional)
Graphics subsystem: VNC
GUI settings: change your resolution
Desktop Environment: LXDE
```
Go to the start screen and open the menu from the top right corner, then choose `Install`. Make sure you have given root permissions to the application and have a stable connection as this process may take anywhere from 10 to 30 minutes.

After the process is finished, in the terminal you will see `<<< deploy`. Next, choose `START`.

Now you will require an SSH Terminal, for this tutorial, ConnectBot will be used.

After opening ConnectBot, add a new host and use the following configuration:
```
Protocol: SSH
-
username:android
host:localhost
port:22
-
Nickname: DEBIAN
-
Start shell session: true
Stay connected: true
```
During the connection you will be asked for the password, enter the password that you chose earlier when setting up Linux Deploy.

Next, use the following commands in the console to download and install nrelay and its dependencies. If you want to copy and paste all of the commands in a single line, do not delete the `;` at the end of each line.
```
su ;
apt-get install default-jdk curl git -y ;
curl -sL https://deb.nodesource.com/setup_9.x -o nodesource_setup.sh ;
bash nodesource_setup.sh ;
rm -R nodesource_setup.sh ;
apt-get install nodejs -y ;
cd /opt;
git clone https://github.com/thomas-crane/nrelay.git/ ;
cd nrelay ;
npm install ;
npm install -g gulp-cli ;
gulp ;
npm install -g ;
npm link ;
mv acc-config-sample.json acc-config.json ;
nano acc-config.json ;
```
Next, edit your `acc-config.json` and save the changes using `Ctrl + O`. Nano can be closed by using `Ctrl + X`. Alternatively, if you enable `Mount` in the options, you can copy an existing `acc-config.json` from your phone's internal storage.
