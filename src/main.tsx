import { withFullScreen } from "fullscreen-ink";
import { App } from "./ui/App";

async function main() {
  const app = withFullScreen(<App />);
  await app.start();
  await app.waitUntilExit();
}

main();
