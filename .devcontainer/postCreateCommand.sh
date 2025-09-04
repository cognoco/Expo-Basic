#!/usr/bin/env bash
sed -i 's/\r$//' "$0"

# Above lines enforce correct handling of LF/CRLF

echo -e "\nStarting post create command script..."
# echo "Dev machine:"
uname -a

# Installing Expo specific tooling (Expo CLIs and Watchman)
echo "Installing Expo CLI..."
npm install -g expo-cli

echo "Installing Expo Application Services (EAS) CLI..."
npm install -g eas-cli

echo -e "\nInstalling watchman...\n"
sudo apt-get update && sudo apt-get install -y watchman
watchman version

# Installing general tooling (utilities, AI CLIs, audio capabilities etc.)

# Install dos2unix (tool to fix Windows/Linux file ending incompatibilities)
echo "Installing dos2unix..."
sudo apt update
sudo apt install -y dos2unix

# Use sudo for global npm installations
echo "Installing Claude CLI..."
npm install -g @anthropic-ai/claude-code

echo "Installing Gemini CLI..."
npm install -g @google/gemini-cli

echo "Installing Codex CLI..."
npm install -g @openai/codex

# Append MCP servers config for Codex CLI
echo "Appending MCP servers to /home/node/.codex/config.toml ..."
sudo install -d -o node -g node /home/node/.codex
sudo -u node bash -lc 'touch /home/node/.codex/config.toml && { echo; cat .devcontainer/codex-mcp.txt; } >> /home/node/.codex/config.toml'

echo "Installing Markdown tree parser..."
sudo npm install -g @kayvan/markdown-tree-parser

echo "Installing Pulse Audio utils..."
sudo apt-get update && sudo apt-get install -y pulseaudio-utils alsa-utils


# Install uv system-wide using official installer - used for MCP servers even if project doesn't use Python!
echo "Installing uv (Python package manager)..."
curl -LsSf https://astral.sh/uv/install.sh | sudo sh
# Make uv available system-wide by moving from root to /usr/local/bin
sudo mv /root/.local/bin/uv /usr/local/bin/uv 2>/dev/null || echo "uv already in system path"
sudo mv /root/.local/bin/uvx /usr/local/bin/uvx 2>/dev/null || echo "uvx already in system path"

# --- Add Shell Alias for Claude ---
echo "Creating 'cc' alias for 'claude --dangerously-skip-permissions'..."
# This command appends the alias to the node user's .bashrc file.
# This makes the alias available in all future terminal sessions.
echo 'alias cc="claude --dangerously-skip-permissions"' >> /home/node/.bashrc

echo -e "\n*******************************"
echo -e "\nDev container ready!".
echo -e "\n*******************************\n"