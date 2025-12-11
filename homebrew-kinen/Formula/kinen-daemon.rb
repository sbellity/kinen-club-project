class KinenDaemon < Formula
  desc "Background daemon for kinen semantic search and memory consolidation"
  homepage "https://kinen.club"
  version "0.1.0"
  license "MIT"

  on_macos do
    if Hardware::CPU.arm?
      url "https://github.com/sbellity/kinen/releases/download/v#{version}/kinen-daemon-darwin-arm64.tar.gz"
      sha256 "REPLACE_WITH_ACTUAL_SHA256"
    else
      url "https://github.com/sbellity/kinen/releases/download/v#{version}/kinen-daemon-darwin-amd64.tar.gz"
      sha256 "REPLACE_WITH_ACTUAL_SHA256"
    end
  end

  on_linux do
    url "https://github.com/sbellity/kinen/releases/download/v#{version}/kinen-daemon-linux-amd64.tar.gz"
    sha256 "REPLACE_WITH_ACTUAL_SHA256"
  end

  def install
    bin.install "kinen-daemon"
  end

  def post_install
    (var/"log/kinen").mkpath
    (etc/"kinen").mkpath
  end

  service do
    run [opt_bin/"kinen-daemon"]
    keep_alive true
    log_path var/"log/kinen/daemon.log"
    error_log_path var/"log/kinen/daemon.log"
    working_dir var
  end

  test do
    assert_match "kinen-daemon", shell_output("#{bin}/kinen-daemon --version")
  end
end


