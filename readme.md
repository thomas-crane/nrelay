# nrelay
A console based modular client for Realm of the Mad God build with Node.js and TypeScript.


## Install
1. Clone the repo to your computer
```bash
git clone https://github.com/thomas-crane/nrelay.git/
```

2. Change directory into the new `nrelay` directory
```bash
cd nrelay
```

3. Install the required dependencies
```bash
npm install
```

4. Install typescript globally
```bash
npm install -g typescript
```

5. Compile the typescript. This will generate a folder called `dist` containing the compiled JavaScript.
```bash
tsc
```

__Note__

Step 6 and 7 are optional, but not performing them will restrict how you can run nrelay. See the [Run](#Run) section for more info.

6. Install nrelay as an npm module. This will let you use nrelay from any directory in the console.
```bash
npm install -g
```

7. Link the installed module to this folder to automatically update the module when any code changes happen.
```bash
npm link
```

## Setup
Now that nrelay is installed, you will need to set up your `acc-config.json` file. This can be done in a few steps:
1. Open the nrelay folder in your file explorer
2. Rename the file `acc-config-sample.json` to `acc-config.json`. (Note: Depending on your computer's settings you might not see the `.json` part of the file name)
3. Replace the account info with your own account info.
```
// acc-config-sample.json
{
    "buildVersion": "X18.0.0",      // When the RotMG build version is updated, this should be changed.
    "guid": "john@email.com",       // Your RotMG account email.
    "password": "SecretPassWord11", // Your RotMG account password.
    "serverPref": "AsiaSouthEast"   // The preferred server to connect to.
}
```

## Run
After setting up the `acc-config.json` file, nrelay is ready to go. To run nrelay, simply use the command `nrelay` in the console. If you have setup your `acc-config` properly (and used the correct credentials) you should see an output similar to this
```bash
C:\Documents>nrelay
[NRelay] Starting...
[NRelay] Authorized account
[NRelay] Connecting to AsiaSouthEast
[Client] Starting connection.
[Client] Connected to server!
```

__Note__

You will only be able to use the command `nrelay` if you performed step 6 and 7 during the installation. If you didn't do these steps, you will have to run nrelay by following these steps:
1. Open a console in the nrelay directory
2. Use the command `npm start`.

`npm start` will only work if the console is in the nrelay directory, whereas the `nrelay` command can be run anywhere.

## Build
Whenever any changes are made to the TypeScript source files, they will need to be recompiled in order for the changes to take effect.

To recompile the TypeScript simply use
```bash
tsc
```

Alternatively, if you are using [Visual Studio Code](https://code.visualstudio.com/), you can press `Ctrl` + `Shift` + `B`, then select the build task `tsc: build - tsconfig.json`