# git-intent

Git workflow tool for intentional commits - Define your commit intentions before coding to write more meaningful and purposeful code.

Inspired by [intentionalcommits.org](https://intentionalcommits.org/), this tool helps you create more focused and purposeful commits by defining your intentions before you start coding.

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

## How it works

1. **Define your intent**: Before you start coding, define what you're going to commit.
2. **Start working**: Begin implementing your intent when you're ready.
3. **Track progress**: Keep track of what you're working on with clear status updates.
4. **Finish with purpose**: Complete your work with a clear, pre-defined commit message.

This workflow helps you:

- Write more focused and purposeful code
- Create cleaner, more meaningful commits
- Stay aligned with your original intentions
- Avoid writing vague commit messages after the fact

## Contributing

We welcome contribution from everyone in the community. Read below for detailed contribution guide.

[CONTRIBUTING.md](./CONTRIBUTING.md)

## License

See [LICENSE](./LICENSE) for more information.

MIT @ [OffLegacy](https://github.com/offlegacy)
