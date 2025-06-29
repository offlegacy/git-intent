# git-intent

English | [한국어](https://github.com/offlegacy/git-intent/blob/main/README.ko.md)


**git-intent** is a Git workflow tool designed for creating [intentional commits](https://intentionalcommits.org/).

## Why git-intent?

Most developers tend to write code first and only think about commit messages afterward.  
This often results in large, unfocused, and unclear commits.  
Inspired by the Test-Driven Development (TDD) approach, **git-intent** helps you define clear intents before you start coding, making your commit process an intentional part of development.

By focusing on your intent before coding, **git-intent** helps you:

- Maintain a clean and navigable commit history
- Clearly communicate your development purpose
- Prevent scope creep and ensure atomic changes
- Improve collaboration and project maintainability

## Requirements

- Git (>= 2.0)
- Node.js (>= 22)

## Usage (for testing)

```bash
# To add an intent
pnpm start add <intention>

# To list all intents
pnpm start list
```

## Contributing

We warmly welcome contributions from the community. See our detailed guide:

[CONTRIBUTING.md](https://github.com/offlegacy/git-intent/blob/main/CONTRIBUTING.md)

## License

MIT [OffLegacy](https://www.offlegacy.org/) — [LICENSE](https://github.com/offlegacy/git-intent/blob/main/LICENSE)
