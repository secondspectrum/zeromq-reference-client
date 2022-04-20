import { promises as fs } from "fs";
import { join } from "path";
import * as yargs from "yargs";
import * as zmq from "zeromq";

import Recorder from "./record";

export interface Opts {
  gameId: string;
  folderName: string;
  feedName: string;
}

// Constants
const PROTOCOL = "tcp";
const PORT = "8585";
const IP_ADDR = "0.0.0.0";

const FEEDNAMES = ["tracking-fast", "tracking-fast-refs"];

async function main(opts: Opts): Promise<void> {
  const clientFolder = await setupFolder(opts.folderName);
  const recorder = new Recorder(clientFolder);

  let socket = zmq.socket("sub");
  socket.connect(`${PROTOCOL}://${IP_ADDR}:${PORT}`);
  socket.subscribe(generateTopicName(opts.feedName, opts.gameId));

  let messageNumber = 1;
  socket.on("message", function (_topic, message) {
    recorder.recordMessage(messageNumber, message.toString());
    messageNumber += 1;
  });
}

function generateTopicName(feedName: string, gameId: string): string {
  if (feedName === "tracking-fast") {
    return `flex_cv_tracks_${gameId}`;
  } else if (feedName === "tracking-fast-refs") {
    return `flex_cv_tracks_refs_${gameId}`;
  } else {
    throw Error(`Unknown feedname ${feedName} found`);
  }
}

async function setupFolder(folderName: string): Promise<string> {
  try {
    await fs.access(folderName);
  } catch (_) {
    await fs.mkdir(folderName);
  }

  const clientFolder = join(folderName, `client`);

  try {
    await fs.access(clientFolder);
  } catch (_) {
    await fs.mkdir(clientFolder);
  }

  return clientFolder;
}

yargs
  .scriptName("Second Spectrum ZeroMQ Data Ingestion")
  .command(
    "record",
    "Ingest Data",
    {
      gameId: { type: "string", demandOption: true },
      folderName: { type: "string", demandOption: true },
      feedName: {
        type: "string",
        demandOption: true,
        default: "tracking-fast",
        choices: FEEDNAMES,
      },
    },
    main
  )
  .demandCommand()
  .help()
  .parse();
