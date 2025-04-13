# git-intent

![npm version](https://img.shields.io/npm/v/git-intent.svg) ![license](https://img.shields.io/github/license/offlegacy/git-intent)

**git-intent** is a Git workflow tool designed for creating [intentional commits](https://intentionalcommits.org/).

### Why git-intent?

Most developers write code first and craft commit messages as an afterthought. This practice often leads to large, unclear, and unfocused commits. Inspired by the Test-Driven Development (TDD) approach, git-intent encourages defining clear intentions before you begin coding, transforming your commit process into a proactive part of development.

### Benefits

By focusing on your intentions upfront, git-intent promotes a more thoughtful development approach. This enables you to:

- Maintain a clean, easily navigable commit history.
- Clearly communicate your development intentions to collaborators and reviewers.
- Prevent scope creep and maintain smaller, more atomic changes.

git-intent is more than just a CLI tool—it represents a fundamental shift in how you approach version control, enhancing collaboration and project maintainability.

> Special thanks to [Joohoon Cha](https://github.com/jcha0713) for introducing the [Intent-Driven Git Workflow](https://youtu.be/yDRs4Pl1Lq0?feature=shared) concept.

## Requirements

- Git (>= 2.0)
- Node.js (>= 18)

## Installation

### Using Homebrew (macOS, Linux)

1. Install Homebrew (if not installed):
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

2. Install git-intent:
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/offlegacy/git-intent/main/scripts/install.sh)"
```
[View install script](https://github.com/offlegacy/git-intent/blob/main/scripts/install.sh)

### Using NPM

```bash
npm install -g git-intent
```

## Updating

To update to the latest version, follow these steps based on your installation method:

**Homebrew**
```bash
brew update
brew upgrade git-intent
```

**NPM**
```bash
npm update -g git-intent
```

Check your installed version:
```bash
git intent --version
```

## Usage

Plan your commits ahead of time for clearer, more purposeful development.

### Adding Intentions

Add new commit intentions with clear messages:

```bash
git intent add "feat: implement login page"
git intent add "feat: add password validation"
```

Or launch an editor to draft your intention:

```bash
git intent add
```

### Listing Intentions

Review all defined intentions:

```bash
git intent list
```

### Starting an Intention

Begin working on a specific intention by providing its ID:

```bash
git intent start <intention-id>
```

Or interactively select one:

```bash
git intent start
```

### Checking Current Intention

Check the intention you're currently working on:

```bash
git intent show
```

### Committing an Intention

Commit your current intention directly:

```bash
git intent commit
```

Or append an additional descriptive message:

```bash
git intent commit -m "Add tests and fix edge case"
```

### Canceling, Resetting, and Managing Intentions

Cancel the current intention:

```bash
git intent cancel
```

Reset (clear) all intentions:

```bash
git intent reset
```

Divide an intention into smaller tasks by providing an ID or interactively selecting one:

```bash
git intent divide <intention-id>
# or interactively:
git intent divide
```

Drop (remove) a specific intention:

```bash
git intent drop <intention-id>
```

## FAQ

**Q: Why define intentions before coding?**  
A: Clearly defined intentions help you stay focused, create more meaningful commits, and improve collaboration and readability of commit history.

**Q: Where are my intentions stored? Are they shared or committed to Git?**  
A: Intentions are stored locally in your repository's `.git` directory and are not shared or committed. They remain private unless explicitly shared.

## Contributing

We warmly welcome contributions from the community. See our detailed guide:

[CONTRIBUTING.md](./CONTRIBUTING.md)

## License

MIT © [OffLegacy](https://github.com/offlegacy) — see [LICENSE](./LICENSE) for details.