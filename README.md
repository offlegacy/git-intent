# git-intent

![npm version](https://img.shields.io/npm/v/git-intent.svg) ![license](https://img.shields.io/github/license/offlegacy/git-intent)

Git workflow tool for intentional commits - Define your commit intentions before coding to write more meaningful and purposeful code. You can learn more about intentional commits at [intentionalcommits.org](https://intentionalcommits.org/).

> Special thanks to [Joohoon Cha](https://github.com/jcha0713) for introducing the [Intent Driven Git Workflow](https://youtu.be/yDRs4Pl1Lq0?feature=shared) concept.

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

To update to the latest version:

**If installed via Homebrew:**
```bash
brew update
brew upgrade git-intent
```

**If installed via NPM:**
```bash
npm update -g git-intent
```

To check your currently installed version:
```bash
git intent --version
```

## Usage

Git Intent is a Git workflow tool for intentional commits. Plan your commits before coding to write more meaningful and purposeful code.

```bash
# Add multiple intentions
git intent add "feat: implement login page"
git intent add "feat: add password validation"
git intent add "feat: implement session management"

# Alternatively, omit the message to open your editor:
git intent add

# List all intentions
git intent list

# Start working on a specific intention
git intent start <intention-id>

# Alternatively, omit the ID to select interactively:
git intent start

# Show current intention
git intent show

# Complete current intention and commit
git intent commit

# You can also append an additional message:
git intent commit -m "Add tests and fix edge case"

# Cancel current intention
git intent cancel

# Reset all intentions
git intent reset

# Divide an intention into smaller parts
git intent divide <intention-id>

# Alternatively, omit the ID to select interactively and open the editor:
git intent divide

# Drop a specific intention
git intent drop <intention-id>
```

## FAQ

**Q: Why define intentions before coding?**  
A: It helps you stay focused and write more purposeful commits. It also improves collaboration and commit history readability.

**Q: Where are my intentions stored? Are they shared or committed to Git?**  
A: All intentions are stored locally inside your repository’s `.git` directory and are not committed to version control. Each project maintains its own separate intentions. They are private to your local setup unless you explicitly share them.

## Contributing

We welcome contribution from everyone in the community. Read below for detailed contribution guide.

[CONTRIBUTING.md](./CONTRIBUTING.md)

## License

See [LICENSE](./LICENSE) for more information.

MIT @ [OffLegacy](https://github.com/offlegacy)