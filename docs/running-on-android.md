### Install on Android
If you wanna use nrelay on Android, you can setup Linux Deploy and configure system on work with nodejs.
Your phone need worked root-access!
You can see images: [Link](https://imgur.com/a/CvMOp)

How to install Linux Deploy:

You can download last release from GitHub repository: [LinuxDeploy](https://github.com/meefik/linuxdeploy/releases) and [BusyBox](https://github.com/meefik/busybox/releases)

To SSH-access you need terminal, here used ConnectBot.

First you need install BusyBox.

Check your location of BusyBox in settings, make sure it's /system/xbin.

After installing LinuxDeploy apk, open LinuxDeploy and go to "Settings"

Select PATH to your BusyBox, default PATH: /system/xbin

Choose Update ENV

Open options on right-down corner and set this settings:
```
Containerization Method: chroot
Distribution: Debian
Architecture: armhf
Distribution suite: stretch
Source path: default
Installation type: Directory
User name: android
User password: set your password here [You need password to SSH-access]
Privileged Users: root
Localization: en_US.UTF-8 (ru_RU.UTF-8 to me ;)
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
Go to the start screen - open menu on right-up corner and choose Install, make sure you have stable connection, give root permissions to application. (This may take 10-30 min, you can watch YT on this time)

After downloading, in terminl you can see "<<< deploy"

Next choose "START"

Now you need SSH-Terminal, here i use ConnectBot.

After you open app, you can see button in corner, click on it to add new host and set this options:
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
During the connection you will be asked for the password, enter the one that was in the settings.

Next tell this in console to download/installing java/nodejs/nrelay: (you can copy-paste all commands in one line, but then don't delete ";" after commands )
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
Next edit your acc-config.json and save changes on Ctrl+O, close nano on Ctrl+X.
If you enable Mount in options, you can copy your acc-config in nrelay from sdcard/internal storage.
