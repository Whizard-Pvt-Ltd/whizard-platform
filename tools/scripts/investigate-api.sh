#!/usr/bin/env bash
# ─── Investigate API Data ───────────────────────────────────────────────────
# Quick debug script to check roles, FGs, departments, capability instances,
# and their relationships in the database.
#
# Usage:
#   ./tools/scripts/investigate-api.sh <command> [args]
#
# Commands:
#   role <publicUuid>           — Show role details + its RoleCapabilityInstance mappings
#   role-fgs <publicUuid>       — Show FGs linked to a role (via CI chain)
#   fg <publicUuid>             — Show functional group details + its CIs
#   dept <bigintId>             — Show department details + its FG mappings
#   depts-by-industry <indId>   — List departments for an industry (bigint ID)
#   depts-by-tenant <tenantId>  — List departments for a tenant (bigint ID)
#   roles-by-dept <deptBigintId>— List roles for a department
#   ci <bigintId>               — Show capability instance details
#   company <tenantId>          — Show company info by tenant ID (bigint)
#   tenant <publicUuid>         — Show tenant info by publicUuid
#   sql <query>                 — Run raw SQL query
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

CMD="${1:-help}"
ARG="${2:-}"

run_ts() {
  npx tsx -e "$1" 2>&1 | grep -v "^npm warn"
}

case "$CMD" in

  role)
    [ -z "$ARG" ] && echo "Usage: $0 role <publicUuid>" && exit 1
    run_ts "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  const role = await p.role.findFirst({
    where: { publicUuid: '$ARG' },
    include: { department: { select: { id: true, name: true } }, tenant: { select: { id: true, publicUuid: true } } }
  });
  if (!role) { console.log('Role not found'); return; }
  console.log('Role:', { id: role.id.toString(), name: role.name, isActive: role.isActive, seniorityLevel: role.seniorityLevel, industryId: role.industryId?.toString() });
  console.log('Department:', { id: role.department.id.toString(), name: role.department.name });
  console.log('Tenant:', { id: role.tenant.id.toString(), uuid: role.tenant.publicUuid });

  const rcis = await p.roleCapabilityInstance.findMany({ where: { roleId: role.id } });
  const active = rcis.filter(r => r.isActive).length;
  const inactive = rcis.filter(r => !r.isActive).length;
  console.log('RoleCapabilityInstances:', { total: rcis.length, active, inactive });
  for (const rci of rcis.slice(0, 20)) {
    console.log('  ', { id: rci.id.toString(), ciId: rci.capabilityInstanceId.toString(), isActive: rci.isActive });
  }
  if (rcis.length > 20) console.log('  ... and', rcis.length - 20, 'more');
  await p.\$disconnect();
})();
"
    ;;

  role-fgs)
    [ -z "$ARG" ] && echo "Usage: $0 role-fgs <publicUuid>" && exit 1
    run_ts "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  const role = await p.role.findFirst({ where: { publicUuid: '$ARG', isActive: true }, select: { id: true, name: true } });
  if (!role) { console.log('Role not found'); return; }
  console.log('Role:', role.name, '(id:', role.id.toString() + ')');

  const rcis = await p.roleCapabilityInstance.findMany({
    where: { roleId: role.id },
    select: { isActive: true, capabilityInstance: { select: { functionalGroup: { select: { publicUuid: true, name: true, isActive: true } } } } }
  });

  const fgMap = new Map();
  for (const rci of rcis) {
    const fg = rci.capabilityInstance.functionalGroup;
    if (!fgMap.has(fg.publicUuid)) fgMap.set(fg.publicUuid, { id: fg.publicUuid, name: fg.name, isActive: fg.isActive, fromActiveRCI: rci.isActive });
  }
  console.log('Functional Groups (' + fgMap.size + '):');
  for (const fg of [...fgMap.values()].sort((a, b) => a.name.localeCompare(b.name))) {
    console.log('  ', fg.name, '| uuid:', fg.id, '| fgActive:', fg.isActive, '| rciActive:', fg.fromActiveRCI);
  }
  await p.\$disconnect();
})();
"
    ;;

  fg)
    [ -z "$ARG" ] && echo "Usage: $0 fg <publicUuid>" && exit 1
    run_ts "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  const fg = await p.functionalGroup.findFirst({
    where: { publicUuid: '$ARG' },
    include: { tenant: { select: { id: true, publicUuid: true } }, industry: { select: { id: true, name: true } } }
  });
  if (!fg) { console.log('FG not found'); return; }
  console.log('FG:', { id: fg.id.toString(), name: fg.name, isActive: fg.isActive });
  console.log('Industry:', { id: fg.industry?.id?.toString(), name: fg.industry?.name });
  console.log('Tenant:', { id: fg.tenant.id.toString(), uuid: fg.tenant.publicUuid });

  const cis = await p.capabilityInstance.findMany({ where: { functionalGroupId: fg.id, isActive: true }, select: { id: true, publicUuid: true } });
  console.log('CapabilityInstances (active):', cis.length);
  await p.\$disconnect();
})();
"
    ;;

  dept)
    [ -z "$ARG" ] && echo "Usage: $0 dept <bigintId>" && exit 1
    run_ts "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  const dept = await p.department.findUnique({
    where: { id: BigInt('$ARG') },
    include: {
      tenant: { select: { id: true, publicUuid: true } },
      industry: { select: { id: true, name: true } },
      functionalGroups: { include: { functionalGroup: { select: { id: true, publicUuid: true, name: true } } } }
    }
  });
  if (!dept) { console.log('Department not found'); return; }
  console.log('Department:', { id: dept.id.toString(), name: dept.name, isActive: dept.isActive });
  console.log('Industry:', { id: dept.industry?.id?.toString(), name: dept.industry?.name });
  console.log('Tenant:', { id: dept.tenant.id.toString(), uuid: dept.tenant.publicUuid });
  console.log('FG mappings (' + dept.functionalGroups.length + '):');
  for (const m of dept.functionalGroups) {
    console.log('  ', m.functionalGroup.name, '| id:', m.functionalGroup.id.toString(), '| uuid:', m.functionalGroup.publicUuid);
  }
  await p.\$disconnect();
})();
"
    ;;

  depts-by-industry)
    [ -z "$ARG" ] && echo "Usage: $0 depts-by-industry <industryBigintId>" && exit 1
    run_ts "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  const depts = await p.department.findMany({
    where: { industryId: BigInt('$ARG'), isActive: true },
    include: { tenant: { select: { id: true, publicUuid: true } } },
    orderBy: { name: 'asc' }
  });
  console.log('Departments for industryId=' + '$ARG' + ' (' + depts.length + '):');
  for (const d of depts) {
    console.log('  ', d.name, '| id:', d.id.toString(), '| tenantId:', d.tenant.id.toString(), '| tenantUuid:', d.tenant.publicUuid);
  }
  await p.\$disconnect();
})();
"
    ;;

  depts-by-tenant)
    [ -z "$ARG" ] && echo "Usage: $0 depts-by-tenant <tenantBigintId>" && exit 1
    run_ts "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  const depts = await p.department.findMany({
    where: { tenantId: BigInt('$ARG'), isActive: true },
    include: { industry: { select: { id: true, name: true } } },
    orderBy: { name: 'asc' }
  });
  console.log('Departments for tenantId=' + '$ARG' + ' (' + depts.length + '):');
  for (const d of depts) {
    console.log('  ', d.name, '| id:', d.id.toString(), '| industryId:', d.industry?.id?.toString(), '| industry:', d.industry?.name);
  }
  await p.\$disconnect();
})();
"
    ;;

  roles-by-dept)
    [ -z "$ARG" ] && echo "Usage: $0 roles-by-dept <deptBigintId>" && exit 1
    run_ts "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  const roles = await p.role.findMany({
    where: { departmentId: BigInt('$ARG'), isActive: true },
    include: { tenant: { select: { id: true, publicUuid: true } } },
    orderBy: { name: 'asc' }
  });
  console.log('Roles for departmentId=' + '$ARG' + ' (' + roles.length + '):');
  for (const r of roles) {
    console.log('  ', r.name, '| uuid:', r.publicUuid, '| tenantId:', r.tenant.id.toString(), '| seniority:', r.seniorityLevel);
  }
  await p.\$disconnect();
})();
"
    ;;

  ci)
    [ -z "$ARG" ] && echo "Usage: $0 ci <bigintId>" && exit 1
    run_ts "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  const ci = await p.capabilityInstance.findUnique({
    where: { id: BigInt('$ARG') },
    include: {
      functionalGroup: { select: { id: true, name: true, publicUuid: true } },
      capability: { select: { id: true, name: true } },
      proficiency: { select: { id: true, name: true } },
      pwo: { select: { id: true, name: true } },
      swo: { select: { id: true, name: true } }
    }
  });
  if (!ci) { console.log('CI not found'); return; }
  console.log('CapabilityInstance:', { id: ci.id.toString(), uuid: ci.publicUuid, isActive: ci.isActive });
  console.log('FG:', ci.functionalGroup.name, '(' + ci.functionalGroup.publicUuid + ')');
  console.log('Capability:', ci.capability?.name);
  console.log('Proficiency:', ci.proficiency?.name);
  console.log('PWO:', ci.pwo?.name);
  console.log('SWO:', ci.swo?.name);
  await p.\$disconnect();
})();
"
    ;;

  company)
    [ -z "$ARG" ] && echo "Usage: $0 company <tenantBigintId>" && exit 1
    run_ts "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  const company = await p.company.findFirst({
    where: { tenantId: BigInt('$ARG') },
    include: { tenant: { select: { id: true, publicUuid: true } }, industry: { select: { id: true, name: true } } }
  });
  if (!company) { console.log('Company not found for tenantId=' + '$ARG'); return; }
  console.log('Company:', { name: company.name, code: company.companyCode });
  console.log('Tenant:', { id: company.tenant.id.toString(), uuid: company.tenant.publicUuid });
  console.log('Industry:', { id: company.industry?.id?.toString(), name: company.industry?.name });
  await p.\$disconnect();
})();
"
    ;;

  tenant)
    [ -z "$ARG" ] && echo "Usage: $0 tenant <publicUuid>" && exit 1
    run_ts "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  const t = await p.tenant.findFirst({
    where: { publicUuid: '$ARG' },
    include: { industry: { select: { id: true, name: true } } }
  });
  if (!t) { console.log('Tenant not found'); return; }
  console.log('Tenant:', { id: t.id.toString(), uuid: t.publicUuid, type: t.tenantType, name: t.name, isActive: t.isActive });
  console.log('Industry:', { id: t.industry?.id?.toString(), name: t.industry?.name });
  await p.\$disconnect();
})();
"
    ;;

  sql)
    [ -z "$ARG" ] && echo "Usage: $0 sql \"SELECT ...\"" && exit 1
    run_ts "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  const rows = await p.\$queryRawUnsafe('$ARG');
  console.table(rows.map(r => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, typeof v === 'bigint' ? v.toString() : v]))));
  await p.\$disconnect();
})();
"
    ;;

  help|*)
    echo "Usage: $0 <command> [args]"
    echo ""
    echo "Commands:"
    echo "  role <publicUuid>             Show role details + RCI mappings"
    echo "  role-fgs <publicUuid>         Show FGs linked to a role (via CI chain)"
    echo "  fg <publicUuid>               Show functional group details"
    echo "  dept <bigintId>               Show department + FG mappings"
    echo "  depts-by-industry <indId>     List departments for an industry"
    echo "  depts-by-tenant <tenantId>    List departments for a tenant"
    echo "  roles-by-dept <deptId>        List roles for a department"
    echo "  ci <bigintId>                 Show capability instance details"
    echo "  company <tenantId>            Show company by tenant ID"
    echo "  tenant <publicUuid>           Show tenant by UUID"
    echo "  sql \"SELECT ...\"              Run raw SQL"
    ;;
esac
