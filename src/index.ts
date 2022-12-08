import { promises as fs } from "fs";
import { join } from "path";
import * as yargs from "yargs";
import * as zmq from "zeromq";

import Recorder from "./record";

export interface Opts {
  /// ZMQ Configuration
  address: string;
  port: number;

  gameId: string;
  folderName: string;
  feedName: string;
}

// Constants
const PROTOCOL = "tcp";

const FEEDNAMES = ["tracking-fast", "tracking-fast-prime", "tracking-pose", "tracking-pose-prime"];

async function main(opts: Opts): Promise<void> {
  const clientFolder = await setupFolder(opts.folderName);
  const recorder = new Recorder(clientFolder);

  let socket = zmq.socket("sub");
  socket.connect(`${PROTOCOL}://${opts.address}:${opts.port}`);
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
  } else if (feedName === "tracking-fast-prime") {
    return `flex_cv_tracks_prime_${gameId}`;
  } else if (feedName === "tracking-pose") {
    return `flex_cv_pose_${gameId}`;
  } else if (feedName === "tracking-pose-prime") {
    return `flex_cv_pose_prime_${gameId}`;
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
        default: "tracking-pose",
        choices: FEEDNAMES,
      },
      // optional args
      address: { type: "string", default: "0.0.0.0" },
      port: { type: "number", default: 8585 },
    },
    main
  )
  .demandCommand()
  .help()
  .parse();
