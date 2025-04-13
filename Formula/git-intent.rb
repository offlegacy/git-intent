class GitIntent < Formula
  desc "Git workflow tool for intentional commits"
  homepage "https://github.com/offlegacy/git-intent"
  license "MIT"
  version "0.0.1"

  on_macos do
    url "https://github.com/offlegacy/git-intent/releases/download/v#{version}/git-intent-#{version}-darwin-amd64.tar.gz"
    sha256 "REPLACE_WITH_ACTUAL_SHA256"
  end

  def install
    bin.install "git-intent"
  end

  test do
    system "#{bin}/git-intent", "--version"
  end
end
