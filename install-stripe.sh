#!/bin/bash
# Try to find npm
NPM_PATH=$(which npm)

if [ -z "$NPM_PATH" ]; then
  # Check common locations
  if [ -f "/usr/local/bin/npm" ]; then
    NPM_PATH="/usr/local/bin/npm"
  elif [ -f "$HOME/.nvm/versions/node/$(node -v)/bin/npm" ]; then
    NPM_PATH="$HOME/.nvm/versions/node/$(node -v)/bin/npm"
  fi
fi

if [ -z "$NPM_PATH" ]; then
  echo "Error: npm not found. Please install 'stripe' and '@stripe/stripe-js' manually."
  exit 1
fi

echo "Found npm at $NPM_PATH"
$NPM_PATH install stripe @stripe/stripe-js
echo "Stripe dependencies installed."
