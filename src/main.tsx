import { render } from "ink";
import { App } from "./ui/App";

async function main() {
  const _app = render(<App />, { exitOnCtrlC: false });
}

main();
