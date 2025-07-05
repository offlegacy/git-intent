import { Command } from "commander";

import * as commands from "./core/commands";
import { ensureBranch } from "./core/utils/branch";
import { ensureProject } from "./core/utils/project";

const program = new Command();

program
  .name("git-intent")
  .description("Git workflow tool designed for creating intentional commits.")
  .version("0.0.1");

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return String(error);
};

program
  .command("start")
  .description("Start a new intent")
  .argument("<message>", "Intent message")
  .action((message: string) => {
    try {
      const projectId = ensureProject();
      const branchId = ensureBranch(projectId);

      const rowid = commands.start({ message, branchId });
      console.log(`Started intent #${rowid}: ${message}`);
    } catch (error) {
      console.error("Failed to start intent:", getErrorMessage(error));
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
