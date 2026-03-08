#!/usr/bin/env bash
set -euo pipefail

echo "================================================"
echo "IAM Bounded Context - Build Process"
echo "================================================"

# Note: This script builds in the implementation order from the design:
# 1. UserIdentity & UserSession
# 2. AccessPolicy
# 3. ProvisioningLifecycle
# 4. FederatedIdentity
# 5. Infrastructure & messaging
# 6. Runtime apps (BFF, core-api, workers)
# 7. Angular consumers

echo ""
echo "[STEP 0] Bootstrap"
bash tools/scripts/bootstrap.sh

echo ""
echo "[STEP 1] Database Prerequisites"
echo "  Generating Prisma client..."
pnpm prisma:generate

echo ""
echo "[STEP 2] Build IAM Libraries"
echo "  Note: Using TypeScript compiler for now"
echo "  TODO: Add granular Nx build targets per domain slice"
pnpm build

echo ""
echo "[STEP 3] Typecheck Runtime Apps"
echo "  BFF..."
cd apps/api/bff && npx tsc --noEmit && cd ../../..
echo "  core-api..."
cd apps/api/core-api && npx tsc --noEmit && cd ../../..

echo ""
echo "[STEP 4] Build Angular Admin Portal"
pnpm build:web-admin

echo ""
echo "================================================"
echo "[SUCCESS] IAM build completed!"
echo "================================================"
echo ""
echo "Build outputs:"
echo "  - Prisma client: node_modules/@prisma/client"
echo "  - Angular app: dist/apps/web/admin-portal"
echo "  - Runtime apps: Ready to run with tsx/ts-node"
echo ""
