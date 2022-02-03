import { createServer } from "http";
import { parse, fileURLToPath } from "url";
import { Worker } from "worker_threads";
import { dirname } from "path";

import sharp from "sharp";

const currentFolder = dirname(fileURLToPath(import.meta.url));
const workerFileName = "worker.js";

async function joinImages(images) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(`${currentFolder}/${workerFileName}`);

    worker.postMessage(images);

    worker.once("message", resolve);

    worker.once("error", reject);

    worker.once("exit", (code) => {
      if (code !== 0) {
        return reject(new Error(`Thread ${worker.threadId} stopped with code ${code}`));
      }
    });
  });
}

async function handler(req, res) {
  if (req.url.includes("joinImages")) {
    const {
      query: { img, background },
    } = parse(req.url, true);

    const response = await joinImages({
      image: img,
      background,
    });
    res.writeHead(200, {
      "Content-Type": "text/html",
    });

    res.end(`<img style="width: 100%; height: 100%;" src="data:image/jpeg;base64,${response}" />`);

    return;
  }

  return res.end("ok");
}

createServer(handler).listen(3000, console.log("Running at 3000"));

//https://images.contentstack.io/v3/assets/blt187521ff0727be24/bltcea170f820e544c5/60ee0e19a471a34acb2c1f66/ionia-01.jpg

//https://static.wikia.nocookie.net/leagueoflegends/images/b/ba/Yasuo_Armored_3_Render.png
//https://i.pinimg.com/originals/83/80/c8/8380c814cc2060baf485a867c1d98200.png

//localhost:3000/joinImages?img=https://static.wikia.nocookie.net/liberproeliis/images/8/8c/Riven-spirit-blossom.png&background=https://images.contentstack.io/v3/assets/blt187521ff0727be24/bltcea170f820e544c5/60ee0e19a471a34acb2c1f66/ionia-01.jpg
