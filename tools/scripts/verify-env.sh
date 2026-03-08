#!/usr/bin/env bash
set -euo pipefail

# Verify required environment variables for IAM bounded context
# This script checks for essential configuration before build/runtime

required_vars=(
  DATABASE_URL
  JWT_ACCESS_SECRET
  JWT_REFRESH_SECRET
)

# Optional but recommended for full functionality
optional_vars=(
  KAFKA_BROKERS
  KAFKA_CLIENT_ID
  AUTH0_DOMAIN
  AUTH0_CLIENT_ID
  AUTH0_CLIENT_SECRET
)

echo "================================================"
echo "Environment Variable Verification"
echo "================================================"

missing=0
for var in "${required_vars[@]}"; do
  if [ -z "${!var:-}" ]; then
    echo "[ERROR] ✗ Missing required env var: $var"
    missing=1
  else
    echo "[OK] ✓ $var is set"
  fi
done

echo ""
echo "Optional variables (for extended features):"
for var in "${optional_vars[@]}"; do
  if [ -z "${!var:-}" ]; then
    echo "[WARN] ⚠ Optional env var not set: $var"
  else
    echo "[OK] ✓ $var is set"
  fi
done

echo ""
if [ "$missing" -ne 0 ]; then
  echo "[FAIL] Missing required environment variables"
  echo "Copy .env.example to .env and fill in the values"
  exit 1
fi

echo "[SUCCESS] All required environment variables are present"
echo "================================================"
