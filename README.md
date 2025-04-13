# git-intent

![npm version](https://img.shields.io/npm/v/git-intent.svg) ![license](https://img.shields.io/github/license/offlegacy/git-intent)

**git-intent** is a Git workflow tool designed for creating [intentional commits](https://intentionalcommits.org/).

### Why git-intent?

Most developers write code first and craft commit messages as an afterthought. This practice often leads to large, unclear, and unfocused commits. Inspired by the Test-Driven Development (TDD) approach, git-intent encourages defining clear intentions before you begin coding, transforming your commit process into a proactive part of development.


By focusing on your intentions upfront, git-intent enables you to:
- Maintain a clean, easily navigable commit history
- Clearly communicate your development intentions
- Prevent scope creep and maintain atomic changes
- Enhance collaboration and project maintainability

> Special thanks to [Joohoon Cha](https://github.com/jcha0713) for introducing the [Intent-Driven Git Workflow](https://youtu.be/yDRs4Pl1Lq0?feature=shared) concept.

## Quick Start

```bash
# 1. Install Using Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/offlegacy/git-intent/main/scripts/install.sh)"

# 2. Add an intention
git intent add "feat: create user login page"

# 3. Start working
git intent start
```

## Requirements

- Git (>= 2.0)
- Node.js (>= 18)

## Installation

### Using Homebrew (macOS, Linux)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/offlegacy/git-intent/main/scripts/install.sh)"
```
[View install script](https://github.com/offlegacy/git-intent/blob/main/scripts/install.sh)

### Using NPM (All platforms)

```bash
npm install -g git-intent
```

### Updating

```bash
# Homebrew
brew update && brew upgrade git-intent

# NPM
npm update -g git-intent

# Check version
git intent --version
```

## Usage

### Basic Commands

```bash
# Add intentions
git intent add "feat: implement login page"
git intent add  # opens editor

# List and manage
git intent list    # show all intentions
git intent show    # show current intention
git intent start   # start working (interactive)
git intent start <id>  # start specific intention

# Complete or modify
git intent commit  # commit current intention
git intent commit -m "Additional message"  # with extra details
git intent cancel  # cancel current intention
git intent reset   # clear all intentions

# Advanced
git intent divide  # split intention (interactive)
git intent divide <id>  # split specific intention
git intent drop  # remove intention (interactive)
git intent drop <id>    # remove specific intention
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

MIT [OffLegacy](https://github.com/offlegacy) — [LICENSE](./LICENSE)