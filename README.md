# git-intent

Git workflow tool for intentional commits - Define your commit intentions before coding to write more meaningful and purposeful code.

Inspired by [intentionalcommits.org](https://intentionalcommits.org/), this tool helps you create more focused and purposeful commits by defining your intentions before you start coding.

## Installation

### Using Homebrew (Recommended)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/offlegacy/git-intent/main/scripts/install.sh)"
```

### Using NPM

```bash
npm install -g git-intent
```

## Usage

Git Intent is a Git workflow tool for intentional commits. Plan your commits before coding to write more meaningful and purposeful code.

```bash
# Add multiple intentions
git intent add "feat: implement login page"
git intent add "feat: add password validation"
git intent add "feat: implement session management"

# List all intentions
git intent list

# Start working on a specific intention
git intent start <intention-id>

# Show current intention
git intent show

# Complete current intention and commit
git intent commit

# Cancel current intention
git intent cancel

# Reset all intentions
git intent reset

# Divide an intention into smaller parts
git intent divide <intention-id>

# Drop a specific intention
git intent drop <intention-id>
```

### Workflow Example

```bash
# 1. Add multiple intentions
git intent add "feat: implement login page"
git intent add "feat: add form validation"

# 2. List all intentions
git intent list

# 3. Start working on the first intention
git intent start <intention-id>

# 4. Stage your changes
git add .

# 5. Review your intention
git intent show

# 6. Complete your intention
git intent commit

# 7. Start next intention
git intent start <next-intention-id>
```

## Contributing

We welcome contribution from everyone in the community. Read below for detailed contribution guide.

[CONTRIBUTING.md](./CONTRIBUTING.md)

## License

See [LICENSE](./LICENSE) for more information.

MIT @ [OffLegacy](https://github.com/offlegacy)