import { log } from "console";
import fs from "fs";
import OpenAI from "openai";
import notifier from "node-notifier";
import { veryCondensedChatInstructions } from "./benchmark/chat-completion-instructions";

const openai = new OpenAI();

async function main() {
  // const files = await openai.files.list();
  // log({ files: files.data });
  //   const file = await openai.files.create({
  //     file: fs.createReadStream("dataset-cc.jsonl"),
  //     purpose: "fine-tune",
  //   });
  //   console.log("File:", file);
  //   const fineTune = await openai.fineTuning.jobs.create({
  //     training_file: "file-e2S8ILDEdmthfF8TZ5tPh5WR",
  //     model: "gpt-3.5-turbo",
  //     suffix: "flyde-23-08-27",
  //   });
  //   console.log("Fine-tune:", fineTune);
  // }

  // let completed = false;
  // let lastData = "";
  // while (!completed) {
  //   const job = await openai.fineTuning.jobs.retrieve(
  //     "ftjob-qDUjcaL5jei4j1VnyUKbY6Kl"
  //   );
  //   const strJob = JSON.stringify(job);
  //   if (lastData !== strJob) {
  //     console.log(job);
  //     notifier.notify({ message: "Something changed in the fine-tune job!" });
  //   }
  //   lastData = strJob;
  //   await new Promise((resolve) => setTimeout(resolve, 60000));
  // }

  async function main() {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "you create flyde code nodes" },
        { role: "user", content: "create a node add 2 numbers" },
      ],
      model: "ft:gpt-3.5-turbo-0613:personal:flyde-23-08-27:7s9Gy7SR",
    });

    console.log(completion.choices[0]);
  }

  main();
}

main();
