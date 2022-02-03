import { createServer } from "http";
import { randomUUID } from "crypto";
import { pipeline } from "stream/promises";
import { createWriteStream } from "fs";

const handler = async (req, res) => {
  const fileName = `files/file-${randomUUID()}.csv`;
  await pipeline(req, createWriteStream(fileName));

  res.end("upload with success");
};

createServer(handler).listen(3000, () => console.log("running at 3000"));
