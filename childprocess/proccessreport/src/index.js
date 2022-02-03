import { fork } from "child_process";
import { createReadStream } from "fs";
import { pipeline } from "stream/promises";
import { setTimeout } from "timers/promises";
import csvtojson from "csvtojson";
import { Writable } from "stream";

const database = "./data/All_Pokemon.csv";

const PROCESS_COUNT = 10;

const replications = [];

const backgrundTaskFile = "./src/backgroundTask.js";

const procceses = new Map();

for (let index = 0; index < PROCESS_COUNT; index++) {
  const child = fork(backgrundTaskFile, [database]);
  child.on("exit", () => {
    console.log(`process ${child.pid} exited`);
    procceses.delete(child.pid);
  });

  child.on("error", (error) => {
    console.log(`process ${child.pid} has an error`);

    console.log(error);
    process.exit(1);
  });

  child.on("message", (msg) => {
    if (replications.includes(msg)) return;

    console.log(`${msg} is replicated`);
    replications.push(msg);
  });

  procceses.set(child.pid, child);
}

function roundRobin(array, index = 0) {
  return () => {
    if (index >= array.length) index = 0;

    return array[index++];
  };
}

const getProcces = roundRobin([...procceses.values()]);

console.log(`Starting with ${procceses.size}`);
await setTimeout(100);

await pipeline(
  createReadStream(database),
  csvtojson(),
  Writable({
    write(chunk, enc, callback) {
      const chosenProcces = getProcces();
      chosenProcces.send(JSON.parse(chunk));
      callback();
    },
  })
);
