import { Command } from "commander";
import { db } from "./database";

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
  .command("add")
  .description("Add a new intent")
  .argument("<message>", "Intent message")
  .option("-s, --status <status>", "Initial status", "created")
  .action((message: string, options: { status: string }) => {
    try {
      const result = db.run(
        "INSERT INTO intents (message, status) VALUES (?, ?)",
        [message, options.status],
      );

      console.log(
        `Added intent #${result.lastInsertRowid}: ${message} [${options.status}]`,
      );
    } catch (error) {
      console.error("Failed to add intent:", getErrorMessage(error));
      process.exit(1);
    }
  });

program
  .command("list")
  .alias("ls")
  .description("List all intents")
  .option("-s, --status <status>", "Filter by status")
  .action((options: { status?: string }) => {
    try {
      let query: string;
      let params: any[] = [];

      if (options.status) {
        query = "SELECT * FROM intents WHERE status = ? ORDER BY id DESC";
        params = [options.status];
      } else {
        query = "SELECT * FROM intents ORDER BY id DESC";
      }

      const intents = db.query(query).all(...params);

      if (intents.length === 0) {
        console.log("No intents found.");
        return;
      }

      console.log(`\nFound ${intents.length} intent(s):\n`);

      intents.forEach((intent: any) => {
        console.log(`#${intent.id} ${intent.message}`);
        console.log(
          `   Status: ${intent.status} | Created: ${intent.timestamp}`,
        );
        console.log("");
      });
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
