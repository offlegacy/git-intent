import { Command } from "commander";

import * as commands from "./core/commands";
import { ensureBranch } from "./core/utils/branch";
import { getErrorMessage } from "./core/utils/error";
import { ensureProject } from "./core/utils/project";

const program = new Command();

program
  .name("git-intent")
  .description("Git workflow tool designed for creating intentional commits.")
  .version("0.0.1");

program
  .command("start")
  .description("Start a new intent")
  .argument("<message>", "Intent message")
  .action(async (message: string) => {
    try {
      const projectId = await ensureProject();
      const branchId = await ensureBranch(projectId);

      const rowid = commands.start({ message, branchId });
      console.log(`Started intent #${rowid}: ${message}`);
    } catch (error) {
      console.error("Failed to start intent:", getErrorMessage(error));
      process.exit(1);
    }
  });

program
  .command("list")
  .description("List all intents")
  .action(() => {
    try {
      const intents = commands.list();
      console.table(intents);
    } catch (error) {
      console.error("Failed to list intents:", getErrorMessage(error));
      process.exit(1);
    }
  });

async function main() {
  try {
    await program.parseAsync(process.argv);
  } catch (error) {
    console.error("An unexpected error occurred:", getErrorMessage(error));
  }
}

main();
