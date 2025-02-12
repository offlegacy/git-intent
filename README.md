# commit-todo

A CLI tool for TODO-Driven Git Workflow - Define your intentions before you code.

## Overview

commit-todo introduces a new paradigm in Git workflow that encourages developers to define their intentions before coding. Similar to how Test-Driven Development (TDD) promotes writing tests first, TODO-Driven Git Workflow suggests planning your commits beforehand.

By managing your tasks as TODOs that naturally become your commits, you create more focused and atomic changes in your codebase.

## Installation

```bash
npx commit-todo <command>
```

To use as a git command:

```bash
git config --global alias.todo '!npx commit-todo'
```

## Basic Usage

Here's a typical workflow example:

1. **Create a Task**

```bash
$ npx commit-todo add "feat: implement user profile"
✓ Task created successfully

Title: feat: implement user profile
ID: dK9m2nP8
```

2. **View Tasks**

```bash
$ npx commit-todo list
┌──────────┬─────────────┬─────────────────────────────┐
│ ID       │ Status      │ Title                       │
├──────────┼─────────────┼─────────────────────────────┤
│ dK9m2nP8 │ TODO        │ feat: implement user profile│
│ xQ7vR4nM │ IN-PROGRESS │ feat: add activity history  │
│ wL2kJ9pY │ DONE        │ feat: create settings panel │
└──────────┴─────────────┴─────────────────────────────┘
```

3. **Start a Task**

```bash
$ npx commit-todo start dK9m2nP8
✓ Task started successfully

Title: feat: implement user profile
```

4. **Complete a Task**

```bash
$ npx commit-todo done dK9m2nP8
✓ Task completed successfully

Title: feat: implement user profile
Commit: feat: implement user profile
```

## Commands

| Command | Description |
|---------|-------------|
| `add <title>` | Create a new task with the specified title |
| `list` | Display all tasks in a table format |
| `start <id>` | Mark a task as in progress |
| `done <id>` | Complete a task and create a commit |
| `remove <id>` | Delete a task |
| `help` | Show command usage information |

## Features

- **Task-Based Workflow**: Manage your work as discrete, focused tasks
- **Git Integration**: Tasks automatically become commit messages
- **Status Tracking**: Monitor task progress (TODO → IN-PROGRESS → DONE)
- **Simple Interface**: Intuitive CLI commands for task management

## Contributing

We welcome contribution from everyone in the community. Read below for detailed contribution guide.

[CONTRIBUTING.md](https://github.com/offlegacy/commit-todo/blob/main/CONTRIBUTING.md)

### Contributors

[![contributors](https://contrib.rocks/image?repo=offlegacy/commit-todo)](https://github.com/offlegacy/commit-todo/contributors)

## License

See [LICENSE](LICENSE) for more information.

MIT @ [OffLegacy](https://github.com/OffLegacy)

## About OffLegacy

<img align="left" height="88" src="https://static.offlegacy.org/logo.svg"/>

**Open-source Development Team in South Korea 🇰🇷**

We believe that open source is the fastest way to change the world with software. Through open source, we aim to contribute to building a better technological ecosystem.
