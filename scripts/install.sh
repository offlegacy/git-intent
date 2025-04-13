#!/bin/bash

set -e

echo "Installing git-intent..."

# Check if Homebrew is installed
if ! command -v brew &> /dev/null; then
  echo "Homebrew is required but not installed. Installing Homebrew..."
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

# Add tap and install git-intent
echo "Adding Homebrew tap..."
brew tap offlegacy/git-intent

echo "Installing git-intent..."
brew install git-intent

echo "Installation complete! You can now use 'git intent' command."
