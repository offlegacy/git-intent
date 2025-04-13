#!/bin/bash

set -e

echo "Installing git-intent..."

# Check if Homebrew is installed
if ! command -v brew &> /dev/null; then
  echo "Error: Homebrew is required but not installed."
  echo "Please install Homebrew first:"
  echo "  /bin/bash -c \"$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
  echo "Then run this script again."
  exit 1
fi

# Add tap and install git-intent
echo "Adding Homebrew tap..."
brew tap offlegacy/git-intent

echo "Installing git-intent..."
brew install git-intent

echo "Installation complete! You can now use 'git intent' command."
