# Second Spectrum ZeroMQ Reference Client

## Setup

### Prerequisites

* Node v12.0 or later and NPM
  * You can check your node version by running `npm run version`.
  * The latest version can be downloaded at https://nodejs.org/.
* Python
  * You can check your Python version by running `python -V` or `python3 -V`.
  * Latest version can be downloaded at https://www.python.org/downloads/.
    * Note: on Windows, if you see checkboxes for `Add Python 3.x to PATH` or `Add Python to Environment Variables` during installation, make sure to select them
* Windows: Visual Studio Build Tools
  * Can be downloaded at https://visualstudio.microsoft.com/thank-you-downloading-visual-studio/?sku=BuildTools.
* Unix: A C++ compiler (`gcc`, or `XCode Command Line Tools` on MacOS)

For more details on the prerequisites see https://github.com/nodejs/node-gyp#on-unix.

### Setting up the reference client

```bash
npm ci
npm install -g ts-node
```

## Connecting to Feeds

```bash
ts-node src/index.ts record \
  --gameId <game ID> \
  --feedName <feed name, default tracking-pose> \
  --address <IP address of the zeromq feed> \
  --port <port number of the zeromq feed>
  --folderName <folder to write data to>
```

The availble feeds are:
* `tracking-fast`: High-quality tracking data at a slight delay
* `tracking-fast-prime`: Low-latency tracking data
* `tracking-pose`: High-quality pose data at a slight delay
* `tracking-pose-prime`: Low-latency pose data

### Sample Command

Unix:
```
ts-node src/index.ts record --gameId 8adee3fd-e17b-4aac-8190-b251112c0160 --address 0.0.0.0 --port 8585 --folderName 20220316-nba-min-lal
```

Windows:
```
npx ts-node src/index.ts record --gameId 8adee3fd-e17b-4aac-8190-b251112c0160 --address 0.0.0.0 --port 8585 --folderName 20220316-nba-min-lal
```

## Recording Data
* When you run the command, data will be written to `folderName/client/msg_[messageNumber]_[timestamp].json`
