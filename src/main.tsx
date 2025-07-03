import { withFullScreen } from "fullscreen-ink";
import { App } from "./ui/App";

async function main() {
  const app = withFullScreen(<App />, { exitOnCtrlC: false });
  await app.start();
  await app.waitUntilExit();
}

main();
