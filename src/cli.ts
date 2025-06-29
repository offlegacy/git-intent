import { Command } from "commander";
import { desc, eq } from "drizzle-orm";
import { add } from "./core/commands";
import { db } from "./core/db";
import { type Intent, intents } from "./core/db/schema";

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
      const rowid = add(message, options.status);
      console.log(`Added intent #${rowid}: ${message} [${options.status}]`);
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
      let intentList: Intent[];

      if (options.status) {
        intentList = db
          .select()
          .from(intents)
          .where(eq(intents.status, options.status))
          .orderBy(desc(intents.id))
          .all();
      } else {
        intentList = db.select().from(intents).orderBy(desc(intents.id)).all();
      }

      if (intentList.length === 0) {
        console.log("No intents found.");
        return;
      }

      console.log(`\nFound ${intentList.length} intent(s):\n`);

      intentList.forEach((intent) => {
        console.log(`#${intent.id} ${intent.message}`);
        console.log(
          `   Status: ${intent.status} | Created: ${new Date(intent.createdAt).toLocaleString()}`,
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
