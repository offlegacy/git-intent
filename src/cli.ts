import { Command } from "commander";

const program = new Command();

program
  .name("git-intent")
  .description("Git workflow tool designed for creating intentional commits.")
  .version("0.0.1");

async function main() {
  try {
    await program.parseAsync(process.argv);
    console.log("hello world");
  } catch (error) {
    console.error("An unexpected error occurred:", error);
  }
}

main();
