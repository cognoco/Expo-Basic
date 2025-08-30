echo -e "\nStarting post create command script..."
echo "Dev machine:"
uname -a
echo -e "\nInstalling expo boiler plate..."
npm install --save-dev -y create-expo-app@2.1.1
echo -e "\nInstalling watchman...\n"
sudo apt update
sudo apt install watchman
watchman version

echo "Installing Claude CLI..."
# Use sudo for global npm installations
npm install -g @anthropic-ai/claude-code

sudo chown -R node:node /home/node/.claude

echo "Installing Markdown tree parser..."
# Use sudo for global npm installations
sudo npm install -g @kayvan/markdown-tree-parser

echo "Installing uv (Python package manager)..."
# Install uv system-wide using official installer
curl -LsSf https://astral.sh/uv/install.sh | sudo sh
# Make uv available system-wide by moving from root to /usr/local/bin
sudo mv /root/.local/bin/uv /usr/local/bin/uv 2>/dev/null || echo "uv already in system path"
sudo mv /root/.local/bin/uvx /usr/local/bin/uvx 2>/dev/null || echo "uvx already in system path"
# Ensure node user has access
sudo chmod +x /usr/local/bin/uv /usr/local/bin/uvx

# --- Add Shell Alias for Claude ---
echo "Creating 'cc' alias for 'claude --dangerously-skip-permissions'..."
# This command appends the alias to the node user's .bashrc file.
# This makes the alias available in all future terminal sessions.
echo 'alias cc="claude --dangerously-skip-permissions"' >> /home/node/.bashrc

echo -e "\n*******************************"
echo -e "\nDev container ready!".
echo -e "\n*******************************\n"