# git-intent

Git workflow tool for intentional commits - Define your commit intentions before coding to write more meaningful and purposeful code.

## Installation & Usage

You can use this tool without installation via `npx`:

```bash
npx gintent [command]
```

Or install it globally:

```bash
npm install -g gintent
```

### Git Integration

You can also use it as a git command by adding an alias to your git config:

```bash
git config --global alias.intent '!npx gintent'
```

Then you can use it like this:

```bash
git intent [command]
```

## Commands

### Create a new intent

```bash
npx gintent "implement login form"
# or
npx gintent  # will prompt for commit message
```

### List all intents

```bash
npx gintent list
```

### Start working on an intent

```bash
npx gintent start [id]  # id is optional, will prompt if not provided
```

### Check current status

```bash
npx gintent status
```

### Finish current intent

```bash
npx gintent finish
```

## How it works

1. **Define your intent**: Before you start coding, define what you're going to commit.
2. **Start working**: Begin implementing your intent.
3. **Finish with purpose**: Complete your work with a clear, pre-defined commit message.

This workflow helps you:

- Write more focused and purposeful code
- Create cleaner, more meaningful commits
- Stay aligned with your original intentions

## License

MIT
