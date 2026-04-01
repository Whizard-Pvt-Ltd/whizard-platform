-- Migration: align_schema_to_target
--
-- Drops all existing IAM + WRCF tables and recreates them to match the target
-- schema (pg_dump 2026-03-27). Key changes:
--   - IAM layer replaced by a flat user_accounts table
--   - public_uuid UUID is the PRIMARY KEY on every table (application-facing ID)
--   - id BIGINT GENERATED ALWAYS AS IDENTITY is kept as a unique internal ordering column
--   - FK columns are UUID type, referencing public_uuid of the parent table
--   - Uniform audit columns (created_at/by, updated_at/by, version) everywhere
--   - industry_sectors gains a required `type` enum column
--   - proficiencies: level changed from INT to VARCHAR(5) (L1–L5)
--   - capability_instances: pwo_id / swo_id made nullable
--   - control_points: kpi_threshold INT, escalation_required BOOLEAN, evidenceType removed
--   - Table renames: industry_roles→roles, capability_instances_industry_roles→role_capability_instances
--                    departments_functional_groups→department_functional_groups
--   - roles simplified (seniority_level, reporting_to, role_criticality_score removed)
--   - role_capability_instances gains is_mandatory, is_active, version, audit columns
--   - New table: learner_evidences

-- ─── Drop existing tables (reverse FK order) ─────────────────────────────────

DROP TABLE IF EXISTS iam_user_credentials                CASCADE;
DROP TABLE IF EXISTS iam_user_sessions                   CASCADE;
DROP TABLE IF EXISTS iam_scope_restrictions              CASCADE;
DROP TABLE IF EXISTS iam_permission_grants               CASCADE;
DROP TABLE IF EXISTS iam_role_assignments                CASCADE;
DROP TABLE IF EXISTS iam_access_principals               CASCADE;
DROP TABLE IF EXISTS iam_outbox_events                   CASCADE;
DROP TABLE IF EXISTS iam_user_accounts                   CASCADE;
DROP TABLE IF EXISTS capability_instances_industry_roles CASCADE;
DROP TABLE IF EXISTS departments_functional_groups       CASCADE;
DROP TABLE IF EXISTS industry_roles                      CASCADE;
DROP TABLE IF EXISTS departments                         CASCADE;
DROP TABLE IF EXISTS control_points                      CASCADE;
DROP TABLE IF EXISTS tasks                               CASCADE;
DROP TABLE IF EXISTS skills                              CASCADE;
DROP TABLE IF EXISTS capability_instances                CASCADE;
DROP TABLE IF EXISTS swos                                CASCADE;
DROP TABLE IF EXISTS pwos                                CASCADE;
DROP TABLE IF EXISTS functional_groups                   CASCADE;
DROP TABLE IF EXISTS capabilities                        CASCADE;
DROP TABLE IF EXISTS proficiencies                       CASCADE;
DROP TABLE IF EXISTS industries                          CASCADE;
DROP TABLE IF EXISTS industry_sectors                    CASCADE;

-- ─── user_accounts ────────────────────────────────────────────────────────────

CREATE TABLE user_accounts (
    id               BIGINT        NOT NULL GENERATED ALWAYS AS IDENTITY,
    public_uuid      UUID          NOT NULL DEFAULT gen_random_uuid(),
    primary_login_id VARCHAR(50)   NOT NULL,
    primary_email    VARCHAR(50)   NOT NULL,
    auth_mode        VARCHAR(30)   NOT NULL,
    is_active        BOOLEAN       NOT NULL DEFAULT true,
    mfa_required     BOOLEAN       NOT NULL DEFAULT false,
    activated_at     TIMESTAMPTZ,
    last_login_at    TIMESTAMPTZ,
    version          REAL          NOT NULL DEFAULT 1,
    created_at       TIMESTAMPTZ   NOT NULL DEFAULT now(),
    created_by       UUID,
    updated_at       TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_by       UUID,
    CONSTRAINT user_accounts_pkey                   PRIMARY KEY (public_uuid),
    CONSTRAINT uq_user_accounts_id                  UNIQUE (id),
    CONSTRAINT uq_user_accounts_primary_login_id    UNIQUE (primary_login_id),
    CONSTRAINT uq_user_accounts_primary_email       UNIQUE (primary_email),
    CONSTRAINT chk_user_accounts_auth_mode          CHECK (auth_mode IN ('Password', 'SSO', 'LDAP', 'OAuth')),
    CONSTRAINT chk_user_accounts_version            CHECK (version >= 1)
);

CREATE INDEX idx_user_accounts_active_true    ON user_accounts (public_uuid)    WHERE is_active = true;
CREATE INDEX idx_user_accounts_last_login_at  ON user_accounts (last_login_at);

ALTER TABLE user_accounts
    ADD CONSTRAINT fk_user_accounts_created_by FOREIGN KEY (created_by) REFERENCES user_accounts(public_uuid),
    ADD CONSTRAINT fk_user_accounts_updated_by FOREIGN KEY (updated_by) REFERENCES user_accounts(public_uuid);

-- ─── industry_sectors ─────────────────────────────────────────────────────────

CREATE TABLE industry_sectors (
    id          BIGINT      NOT NULL GENERATED ALWAYS AS IDENTITY,
    public_uuid UUID        NOT NULL DEFAULT gen_random_uuid(),
    name        VARCHAR(50) NOT NULL,
    description TEXT,
    is_active   BOOLEAN     NOT NULL DEFAULT true,
    type        VARCHAR(50) NOT NULL,
    version     REAL        NOT NULL DEFAULT 1,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by  UUID,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by  UUID,
    CONSTRAINT industry_sectors_pkey            PRIMARY KEY (public_uuid),
    CONSTRAINT uq_industry_sectors_id           UNIQUE (id),
    CONSTRAINT uq_industry_sectors_name         UNIQUE (name),
    CONSTRAINT chk_industry_sectors_type        CHECK (type IN (
        'PROCESS_CONTINUOUS', 'PROCESS_BATCH', 'DISCRETE_MANUFACTURING',
        'PROJECT_BASED', 'SERVICE', 'ASSET_INTENSIVE', 'R_AND_D_KNOWLEDGE_DRIVEN'
    )),
    CONSTRAINT chk_industry_sectors_version     CHECK (version >= 1)
);

CREATE INDEX idx_industry_sectors_active_true ON industry_sectors (public_uuid) WHERE is_active = true;

ALTER TABLE industry_sectors
    ADD CONSTRAINT fk_industry_sectors_created_by FOREIGN KEY (created_by) REFERENCES user_accounts(public_uuid),
    ADD CONSTRAINT fk_industry_sectors_updated_by FOREIGN KEY (updated_by) REFERENCES user_accounts(public_uuid);

-- ─── industries ───────────────────────────────────────────────────────────────

CREATE TABLE industries (
    id          BIGINT      NOT NULL GENERATED ALWAYS AS IDENTITY,
    public_uuid UUID        NOT NULL DEFAULT gen_random_uuid(),
    sector_id   UUID        NOT NULL,
    name        VARCHAR(50) NOT NULL,
    description TEXT,
    is_active   BOOLEAN     NOT NULL DEFAULT true,
    version     REAL        NOT NULL DEFAULT 1,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by  UUID,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by  UUID,
    CONSTRAINT industries_pkey              PRIMARY KEY (public_uuid),
    CONSTRAINT uq_industries_id             UNIQUE (id),
    CONSTRAINT uq_industries_sector_name    UNIQUE (sector_id, name),
    CONSTRAINT chk_industries_version       CHECK (version >= 1)
);

CREATE INDEX idx_industries_active_true ON industries (public_uuid) WHERE is_active = true;
CREATE INDEX idx_industries_sector_id   ON industries (sector_id);

ALTER TABLE industries
    ADD CONSTRAINT fk_industries_sector     FOREIGN KEY (sector_id)  REFERENCES industry_sectors(public_uuid),
    ADD CONSTRAINT fk_industries_created_by FOREIGN KEY (created_by) REFERENCES user_accounts(public_uuid),
    ADD CONSTRAINT fk_industries_updated_by FOREIGN KEY (updated_by) REFERENCES user_accounts(public_uuid);

-- ─── proficiencies ────────────────────────────────────────────────────────────

CREATE TABLE proficiencies (
    id          BIGINT      NOT NULL GENERATED ALWAYS AS IDENTITY,
    public_uuid UUID        NOT NULL DEFAULT gen_random_uuid(),
    level       VARCHAR(5)  NOT NULL,
    label       VARCHAR(50) NOT NULL,
    description TEXT,
    weightage   REAL,
    is_active   BOOLEAN     NOT NULL DEFAULT true,
    version     REAL        NOT NULL DEFAULT 1,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by  UUID,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by  UUID,
    CONSTRAINT proficiencies_pkey                   PRIMARY KEY (public_uuid),
    CONSTRAINT uq_proficiencies_id                  UNIQUE (id),
    CONSTRAINT uq_proficiencies_level               UNIQUE (level),
    CONSTRAINT uq_proficiencies_label               UNIQUE (label),
    CONSTRAINT chk_proficiencies_level              CHECK (level IN ('L1', 'L2', 'L3', 'L4', 'L5')),
    CONSTRAINT chk_proficiencies_label              CHECK (label IN (
        'Plant Awareness',
        'Assisted Execution',
        'Conditional Independence \u2013 Supervised',
        'Conditional Independence \u2013 Scoped',
        'Full Independence'
    )),
    CONSTRAINT chk_proficiencies_level_label_map    CHECK (
        (level = 'L1' AND label = 'Plant Awareness') OR
        (level = 'L2' AND label = 'Assisted Execution') OR
        (level = 'L3' AND label = 'Conditional Independence \u2013 Supervised') OR
        (level = 'L4' AND label = 'Conditional Independence \u2013 Scoped') OR
        (level = 'L5' AND label = 'Full Independence')
    ),
    CONSTRAINT chk_proficiencies_version            CHECK (version >= 1)
);

CREATE INDEX idx_proficiencies_active_true ON proficiencies (public_uuid) WHERE is_active = true;

ALTER TABLE proficiencies
    ADD CONSTRAINT fk_proficiencies_created_by FOREIGN KEY (created_by) REFERENCES user_accounts(public_uuid),
    ADD CONSTRAINT fk_proficiencies_updated_by FOREIGN KEY (updated_by) REFERENCES user_accounts(public_uuid);

-- ─── capabilities ─────────────────────────────────────────────────────────────

CREATE TABLE capabilities (
    id          BIGINT      NOT NULL GENERATED ALWAYS AS IDENTITY,
    public_uuid UUID        NOT NULL DEFAULT gen_random_uuid(),
    code        VARCHAR(15) NOT NULL,
    name        VARCHAR(50) NOT NULL,
    description TEXT,
    type        VARCHAR(30) NOT NULL,
    is_active   BOOLEAN     NOT NULL DEFAULT true,
    version     REAL        NOT NULL DEFAULT 1,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by  UUID,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by  UUID,
    CONSTRAINT capabilities_pkey            PRIMARY KEY (public_uuid),
    CONSTRAINT uq_capabilities_id           UNIQUE (id),
    CONSTRAINT uq_capabilities_code         UNIQUE (code),
    CONSTRAINT chk_capabilities_type        CHECK (type IN ('Cognitive', 'Execution', 'Diagnostic')),
    CONSTRAINT chk_capabilities_version     CHECK (version >= 1)
);

CREATE INDEX idx_capabilities_active_true ON capabilities (public_uuid) WHERE is_active = true;
CREATE INDEX idx_capabilities_type        ON capabilities (type);

ALTER TABLE capabilities
    ADD CONSTRAINT fk_capabilities_created_by FOREIGN KEY (created_by) REFERENCES user_accounts(public_uuid),
    ADD CONSTRAINT fk_capabilities_updated_by FOREIGN KEY (updated_by) REFERENCES user_accounts(public_uuid);

-- ─── functional_groups ────────────────────────────────────────────────────────

CREATE TABLE functional_groups (
    id                 BIGINT      NOT NULL GENERATED ALWAYS AS IDENTITY,
    public_uuid        UUID        NOT NULL DEFAULT gen_random_uuid(),
    industry_id        UUID        NOT NULL,
    tenant_id          TEXT        NOT NULL,
    name               VARCHAR(50) NOT NULL,
    description        TEXT,
    source_template_id UUID,
    domain_type        VARCHAR(20) NOT NULL,
    is_active          BOOLEAN     NOT NULL DEFAULT true,
    version            REAL        NOT NULL DEFAULT 1,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by         UUID,
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by         UUID,
    CONSTRAINT functional_groups_pkey           PRIMARY KEY (public_uuid),
    CONSTRAINT uq_functional_groups_id          UNIQUE (id),
    CONSTRAINT chk_functional_groups_domain_type CHECK (domain_type IN ('Operations', 'Maintenance', 'Quality')),
    CONSTRAINT chk_functional_groups_version     CHECK (version >= 1)
);

CREATE UNIQUE INDEX uq_functional_groups_industry_name_ci ON functional_groups (industry_id, lower(name));
CREATE INDEX idx_functional_groups_active_true  ON functional_groups (industry_id) WHERE is_active = true;
CREATE INDEX idx_functional_groups_industry_id  ON functional_groups (industry_id);
CREATE INDEX idx_functional_groups_tenant_id    ON functional_groups (tenant_id);

ALTER TABLE functional_groups
    ADD CONSTRAINT fk_functional_groups_industry          FOREIGN KEY (industry_id)        REFERENCES industries(public_uuid),
    ADD CONSTRAINT fk_functional_groups_source_template   FOREIGN KEY (source_template_id) REFERENCES functional_groups(public_uuid),
    ADD CONSTRAINT fk_functional_groups_created_by        FOREIGN KEY (created_by)         REFERENCES user_accounts(public_uuid),
    ADD CONSTRAINT fk_functional_groups_updated_by        FOREIGN KEY (updated_by)         REFERENCES user_accounts(public_uuid);

-- ─── pwos ─────────────────────────────────────────────────────────────────────

CREATE TABLE pwos (
    id                         BIGINT       NOT NULL GENERATED ALWAYS AS IDENTITY,
    public_uuid                UUID         NOT NULL DEFAULT gen_random_uuid(),
    functional_group_id        UUID         NOT NULL,
    tenant_id                  TEXT         NOT NULL,
    name                       VARCHAR(100) NOT NULL,
    source_template_id         UUID,
    strategic_importance_level SMALLINT     NOT NULL,
    revenue_impact_level       VARCHAR(10)  NOT NULL,
    downtime_sensitivity       VARCHAR(10)  NOT NULL,
    is_active                  BOOLEAN      NOT NULL DEFAULT true,
    version                    REAL         NOT NULL DEFAULT 1,
    created_at                 TIMESTAMPTZ  NOT NULL DEFAULT now(),
    created_by                 UUID,
    updated_at                 TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_by                 UUID,
    CONSTRAINT pwos_pkey                    PRIMARY KEY (public_uuid),
    CONSTRAINT uq_pwos_id                   UNIQUE (id),
    CONSTRAINT chk_pwos_strategic_importance CHECK (strategic_importance_level >= 1 AND strategic_importance_level <= 5),
    CONSTRAINT chk_pwos_revenue_impact       CHECK (revenue_impact_level IN ('Low', 'Medium', 'High')),
    CONSTRAINT chk_pwos_downtime_sensitivity CHECK (downtime_sensitivity IN ('Low', 'Medium', 'High')),
    CONSTRAINT chk_pwos_version              CHECK (version >= 1)
);

CREATE UNIQUE INDEX uq_pwos_functional_group_name_ci ON pwos (functional_group_id, lower(name));
CREATE INDEX idx_pwos_active_true           ON pwos (functional_group_id) WHERE is_active = true;
CREATE INDEX idx_pwos_functional_group_id   ON pwos (functional_group_id);
CREATE INDEX idx_pwos_tenant_id             ON pwos (tenant_id);
CREATE INDEX idx_pwos_strategic_importance  ON pwos (strategic_importance_level);
CREATE INDEX idx_pwos_revenue_impact        ON pwos (revenue_impact_level);
CREATE INDEX idx_pwos_downtime_sensitivity  ON pwos (downtime_sensitivity);

ALTER TABLE pwos
    ADD CONSTRAINT fk_pwos_functional_group  FOREIGN KEY (functional_group_id) REFERENCES functional_groups(public_uuid),
    ADD CONSTRAINT fk_pwos_source_template   FOREIGN KEY (source_template_id)  REFERENCES pwos(public_uuid),
    ADD CONSTRAINT fk_pwos_created_by        FOREIGN KEY (created_by)          REFERENCES user_accounts(public_uuid),
    ADD CONSTRAINT fk_pwos_updated_by        FOREIGN KEY (updated_by)          REFERENCES user_accounts(public_uuid);

-- ─── swos ─────────────────────────────────────────────────────────────────────

CREATE TABLE swos (
    id                    BIGINT       NOT NULL GENERATED ALWAYS AS IDENTITY,
    public_uuid           UUID         NOT NULL DEFAULT gen_random_uuid(),
    pwo_id                UUID         NOT NULL,
    tenant_id             TEXT         NOT NULL,
    name                  VARCHAR(100) NOT NULL,
    source_template_id    UUID,
    operational_complexity VARCHAR(10) NOT NULL,
    asset_criticality     VARCHAR(10)  NOT NULL,
    failure_frequency     VARCHAR(10)  NOT NULL,
    is_active             BOOLEAN      NOT NULL DEFAULT true,
    version               REAL         NOT NULL DEFAULT 1,
    created_at            TIMESTAMPTZ  NOT NULL DEFAULT now(),
    created_by            UUID,
    updated_at            TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_by            UUID,
    CONSTRAINT swos_pkey                        PRIMARY KEY (public_uuid),
    CONSTRAINT uq_swos_id                       UNIQUE (id),
    CONSTRAINT chk_swos_operational_complexity  CHECK (operational_complexity IN ('Low', 'Medium', 'High')),
    CONSTRAINT chk_swos_asset_criticality       CHECK (asset_criticality IN ('Low', 'Medium', 'High')),
    CONSTRAINT chk_swos_failure_frequency       CHECK (failure_frequency IN ('Low', 'Medium', 'High')),
    CONSTRAINT chk_swos_version                 CHECK (version >= 1)
);

CREATE UNIQUE INDEX uq_swos_pwo_name_ci       ON swos (pwo_id, lower(name));
CREATE INDEX idx_swos_active_true             ON swos (pwo_id)                WHERE is_active = true;
CREATE INDEX idx_swos_pwo_id                  ON swos (pwo_id);
CREATE INDEX idx_swos_tenant_id               ON swos (tenant_id);
CREATE INDEX idx_swos_operational_complexity  ON swos (operational_complexity);
CREATE INDEX idx_swos_asset_criticality       ON swos (asset_criticality);
CREATE INDEX idx_swos_failure_frequency       ON swos (failure_frequency);

ALTER TABLE swos
    ADD CONSTRAINT fk_swos_pwo              FOREIGN KEY (pwo_id)             REFERENCES pwos(public_uuid),
    ADD CONSTRAINT fk_swos_source_template  FOREIGN KEY (source_template_id) REFERENCES swos(public_uuid),
    ADD CONSTRAINT fk_swos_created_by       FOREIGN KEY (created_by)          REFERENCES user_accounts(public_uuid),
    ADD CONSTRAINT fk_swos_updated_by       FOREIGN KEY (updated_by)          REFERENCES user_accounts(public_uuid);

-- ─── capability_instances ─────────────────────────────────────────────────────

CREATE TABLE capability_instances (
    id                  BIGINT      NOT NULL GENERATED ALWAYS AS IDENTITY,
    public_uuid         UUID        NOT NULL DEFAULT gen_random_uuid(),
    functional_group_id UUID        NOT NULL,
    pwo_id              UUID,
    swo_id              UUID,
    capability_id       UUID        NOT NULL,
    proficiency_id      UUID        NOT NULL,
    tenant_id           TEXT        NOT NULL,
    is_active           BOOLEAN     NOT NULL DEFAULT true,
    version             REAL        NOT NULL DEFAULT 1,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by          UUID,
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by          UUID,
    CONSTRAINT capability_instances_pkey            PRIMARY KEY (public_uuid),
    CONSTRAINT uq_capability_instances_id           UNIQUE (id),
    CONSTRAINT chk_capability_instances_hierarchy   CHECK (swo_id IS NULL OR pwo_id IS NOT NULL),
    CONSTRAINT chk_capability_instances_version     CHECK (version >= 1)
);

CREATE UNIQUE INDEX uq_capability_instances_hierarchy        ON capability_instances (functional_group_id, pwo_id, swo_id, capability_id, proficiency_id);
CREATE INDEX idx_capability_instances_active_true            ON capability_instances (functional_group_id) WHERE is_active = true;
CREATE INDEX idx_capability_instances_functional_group_id    ON capability_instances (functional_group_id);
CREATE INDEX idx_capability_instances_pwo_id                 ON capability_instances (pwo_id);
CREATE INDEX idx_capability_instances_swo_id                 ON capability_instances (swo_id);
CREATE INDEX idx_capability_instances_capability_id          ON capability_instances (capability_id);
CREATE INDEX idx_capability_instances_proficiency_id         ON capability_instances (proficiency_id);
CREATE INDEX idx_capability_instances_tenant_id              ON capability_instances (tenant_id);

ALTER TABLE capability_instances
    ADD CONSTRAINT fk_capability_instances_functional_group FOREIGN KEY (functional_group_id) REFERENCES functional_groups(public_uuid),
    ADD CONSTRAINT fk_capability_instances_pwo              FOREIGN KEY (pwo_id)              REFERENCES pwos(public_uuid),
    ADD CONSTRAINT fk_capability_instances_swo              FOREIGN KEY (swo_id)              REFERENCES swos(public_uuid),
    ADD CONSTRAINT fk_capability_instances_capability       FOREIGN KEY (capability_id)       REFERENCES capabilities(public_uuid),
    ADD CONSTRAINT fk_capability_instances_proficiency      FOREIGN KEY (proficiency_id)      REFERENCES proficiencies(public_uuid),
    ADD CONSTRAINT fk_capability_instances_created_by       FOREIGN KEY (created_by)          REFERENCES user_accounts(public_uuid),
    ADD CONSTRAINT fk_capability_instances_updated_by       FOREIGN KEY (updated_by)          REFERENCES user_accounts(public_uuid);

-- ─── skills ───────────────────────────────────────────────────────────────────

CREATE TABLE skills (
    id                          BIGINT       NOT NULL GENERATED ALWAYS AS IDENTITY,
    public_uuid                 UUID         NOT NULL DEFAULT gen_random_uuid(),
    capability_instance_id      UUID         NOT NULL,
    tenant_id                   TEXT         NOT NULL,
    name                        VARCHAR(100) NOT NULL,
    source_template_id          UUID,
    cognitive_type              VARCHAR(20)  NOT NULL,
    skill_criticality           VARCHAR(10)  NOT NULL,
    recertification_cycle_months INTEGER     NOT NULL,
    ai_impact                   VARCHAR(10)  NOT NULL,
    is_active                   BOOLEAN      NOT NULL DEFAULT true,
    version                     REAL         NOT NULL DEFAULT 1,
    created_at                  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    created_by                  UUID,
    updated_at                  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_by                  UUID,
    CONSTRAINT skills_pkey                  PRIMARY KEY (public_uuid),
    CONSTRAINT uq_skills_id                 UNIQUE (id),
    CONSTRAINT chk_skills_cognitive_type    CHECK (cognitive_type IN ('Procedural', 'Decision', 'Diagnostic')),
    CONSTRAINT chk_skills_criticality       CHECK (skill_criticality IN ('Low', 'Medium', 'High')),
    CONSTRAINT chk_skills_recertification_cycle CHECK (recertification_cycle_months >= 1 AND recertification_cycle_months <= 12),
    CONSTRAINT chk_skills_ai_impact         CHECK (ai_impact IN ('Low', 'Medium', 'High')),
    CONSTRAINT chk_skills_version           CHECK (version >= 1)
);

CREATE UNIQUE INDEX uq_skills_capability_instance_name_ci ON skills (capability_instance_id, lower(name));
CREATE INDEX idx_skills_active_true             ON skills (capability_instance_id) WHERE is_active = true;
CREATE INDEX idx_skills_capability_instance_id  ON skills (capability_instance_id);
CREATE INDEX idx_skills_tenant_id               ON skills (tenant_id);
CREATE INDEX idx_skills_cognitive_type          ON skills (cognitive_type);
CREATE INDEX idx_skills_criticality             ON skills (skill_criticality);
CREATE INDEX idx_skills_ai_impact               ON skills (ai_impact);

ALTER TABLE skills
    ADD CONSTRAINT fk_skills_capability_instance FOREIGN KEY (capability_instance_id) REFERENCES capability_instances(public_uuid),
    ADD CONSTRAINT fk_skills_source_template     FOREIGN KEY (source_template_id)     REFERENCES skills(public_uuid),
    ADD CONSTRAINT fk_skills_created_by          FOREIGN KEY (created_by)             REFERENCES user_accounts(public_uuid),
    ADD CONSTRAINT fk_skills_updated_by          FOREIGN KEY (updated_by)             REFERENCES user_accounts(public_uuid);

-- ─── tasks ────────────────────────────────────────────────────────────────────

CREATE TABLE tasks (
    id                         BIGINT       NOT NULL GENERATED ALWAYS AS IDENTITY,
    public_uuid                UUID         NOT NULL DEFAULT gen_random_uuid(),
    skill_id                   UUID         NOT NULL,
    tenant_id                  TEXT         NOT NULL,
    name                       VARCHAR(100) NOT NULL,
    description                TEXT,
    source_template_id         UUID,
    frequency                  VARCHAR(20)  NOT NULL,
    complexity                 VARCHAR(10)  NOT NULL,
    standard_duration          INTEGER      NOT NULL,
    required_proficiency_level VARCHAR(5)   NOT NULL,
    is_active                  BOOLEAN      NOT NULL DEFAULT true,
    version                    REAL         NOT NULL DEFAULT 1,
    created_at                 TIMESTAMPTZ  NOT NULL DEFAULT now(),
    created_by                 UUID,
    updated_at                 TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_by                 UUID,
    CONSTRAINT tasks_pkey                           PRIMARY KEY (public_uuid),
    CONSTRAINT uq_tasks_id                          UNIQUE (id),
    CONSTRAINT chk_tasks_frequency                  CHECK (frequency IN ('Daily', 'Weekly', 'Rare')),
    CONSTRAINT chk_tasks_complexity                 CHECK (complexity IN ('Low', 'Medium', 'High')),
    CONSTRAINT chk_tasks_standard_duration          CHECK (standard_duration >= 1 AND standard_duration <= 150),
    CONSTRAINT chk_tasks_required_proficiency_level CHECK (required_proficiency_level IN ('L1', 'L2', 'L3', 'L4', 'L5')),
    CONSTRAINT chk_tasks_version                    CHECK (version >= 1)
);

CREATE UNIQUE INDEX uq_tasks_skill_name_ci        ON tasks (skill_id, lower(name));
CREATE INDEX idx_tasks_active_true                ON tasks (skill_id) WHERE is_active = true;
CREATE INDEX idx_tasks_skill_id                   ON tasks (skill_id);
CREATE INDEX idx_tasks_tenant_id                  ON tasks (tenant_id);
CREATE INDEX idx_tasks_frequency                  ON tasks (frequency);
CREATE INDEX idx_tasks_complexity                 ON tasks (complexity);
CREATE INDEX idx_tasks_required_proficiency_level ON tasks (required_proficiency_level);

ALTER TABLE tasks
    ADD CONSTRAINT fk_tasks_skill           FOREIGN KEY (skill_id)           REFERENCES skills(public_uuid),
    ADD CONSTRAINT fk_tasks_source_template FOREIGN KEY (source_template_id) REFERENCES tasks(public_uuid),
    ADD CONSTRAINT fk_tasks_created_by      FOREIGN KEY (created_by)         REFERENCES user_accounts(public_uuid),
    ADD CONSTRAINT fk_tasks_updated_by      FOREIGN KEY (updated_by)         REFERENCES user_accounts(public_uuid);

-- ─── control_points ───────────────────────────────────────────────────────────

CREATE TABLE control_points (
    id                  BIGINT       NOT NULL GENERATED ALWAYS AS IDENTITY,
    public_uuid         UUID         NOT NULL DEFAULT gen_random_uuid(),
    task_id             UUID         NOT NULL,
    tenant_id           TEXT         NOT NULL,
    name                VARCHAR(100) NOT NULL,
    description         TEXT,
    source_template_id  UUID,
    risk_level          VARCHAR(20)  NOT NULL,
    failure_impact_type VARCHAR(20)  NOT NULL,
    kpi_threshold       INTEGER,
    escalation_required BOOLEAN      NOT NULL DEFAULT false,
    is_active           BOOLEAN      NOT NULL DEFAULT true,
    version             REAL         NOT NULL DEFAULT 1,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT now(),
    created_by          UUID,
    updated_at          TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_by          UUID,
    CONSTRAINT control_points_pkey                  PRIMARY KEY (public_uuid),
    CONSTRAINT uq_control_points_id                 UNIQUE (id),
    CONSTRAINT chk_control_points_risk_level        CHECK (risk_level IN ('Low', 'Medium', 'High', 'Critical')),
    CONSTRAINT chk_control_points_failure_impact_type CHECK (failure_impact_type IN ('Safety', 'Compliance', 'Financial')),
    CONSTRAINT chk_control_points_kpi_threshold     CHECK (kpi_threshold IS NULL OR (kpi_threshold >= 1 AND kpi_threshold <= 5)),
    CONSTRAINT chk_control_points_version           CHECK (version >= 1)
);

CREATE UNIQUE INDEX uq_control_points_task_name_ci          ON control_points (task_id, lower(name));
CREATE INDEX idx_control_points_active_true                  ON control_points (task_id)          WHERE is_active = true;
CREATE INDEX idx_control_points_escalation_required_true     ON control_points (task_id)          WHERE escalation_required = true;
CREATE INDEX idx_control_points_task_id                      ON control_points (task_id);
CREATE INDEX idx_control_points_tenant_id                    ON control_points (tenant_id);
CREATE INDEX idx_control_points_risk_level                   ON control_points (risk_level);
CREATE INDEX idx_control_points_failure_impact_type          ON control_points (failure_impact_type);

ALTER TABLE control_points
    ADD CONSTRAINT fk_control_points_task            FOREIGN KEY (task_id)            REFERENCES tasks(public_uuid),
    ADD CONSTRAINT fk_control_points_source_template FOREIGN KEY (source_template_id) REFERENCES control_points(public_uuid),
    ADD CONSTRAINT fk_control_points_created_by      FOREIGN KEY (created_by)         REFERENCES user_accounts(public_uuid),
    ADD CONSTRAINT fk_control_points_updated_by      FOREIGN KEY (updated_by)         REFERENCES user_accounts(public_uuid);

-- ─── learner_evidences ────────────────────────────────────────────────────────

CREATE TABLE learner_evidences (
    id                BIGINT      NOT NULL GENERATED ALWAYS AS IDENTITY,
    public_uuid       UUID        NOT NULL DEFAULT gen_random_uuid(),
    learner_id        UUID        NOT NULL,
    control_point_id  UUID        NOT NULL,
    evidence_type     VARCHAR(30) NOT NULL,
    evidence_url      TEXT,
    validation_status VARCHAR(20) NOT NULL DEFAULT 'Pending',
    submission_date   TIMESTAMPTZ NOT NULL DEFAULT now(),
    remarks           TEXT,
    is_active         BOOLEAN     NOT NULL DEFAULT true,
    version           REAL        NOT NULL DEFAULT 1,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by        UUID,
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by        UUID,
    CONSTRAINT learner_evidences_pkey               PRIMARY KEY (public_uuid),
    CONSTRAINT uq_learner_evidences_id              UNIQUE (id),
    CONSTRAINT chk_learner_evidences_type           CHECK (evidence_type IN (
        'Log Entry Checklist', 'Alarm Log', 'Photo / Video',
        'Drill Record', 'Trend Review', 'Incident Report', 'Communication Log'
    )),
    CONSTRAINT chk_learner_evidences_validation_status CHECK (validation_status IN (
        'Pending', 'Approved', 'Rejected', 'Needs Review'
    )),
    CONSTRAINT chk_learner_evidences_version        CHECK (version >= 1)
);

CREATE INDEX idx_learner_evidences_active_true          ON learner_evidences (learner_id)       WHERE is_active = true;
CREATE INDEX idx_learner_evidences_learner_id            ON learner_evidences (learner_id);
CREATE INDEX idx_learner_evidences_control_point_id      ON learner_evidences (control_point_id);
CREATE INDEX idx_learner_evidences_submission_date       ON learner_evidences (submission_date DESC);
CREATE INDEX idx_learner_evidences_validation_status     ON learner_evidences (validation_status);
CREATE INDEX idx_learner_evidences_type                  ON learner_evidences (evidence_type);

ALTER TABLE learner_evidences
    ADD CONSTRAINT fk_learner_evidences_learner       FOREIGN KEY (learner_id)       REFERENCES user_accounts(public_uuid),
    ADD CONSTRAINT fk_learner_evidences_control_point FOREIGN KEY (control_point_id) REFERENCES control_points(public_uuid),
    ADD CONSTRAINT fk_learner_evidences_created_by    FOREIGN KEY (created_by)       REFERENCES user_accounts(public_uuid),
    ADD CONSTRAINT fk_learner_evidences_updated_by    FOREIGN KEY (updated_by)       REFERENCES user_accounts(public_uuid);

-- ─── departments ──────────────────────────────────────────────────────────────

CREATE TABLE departments (
    id                            BIGINT           NOT NULL GENERATED ALWAYS AS IDENTITY,
    public_uuid                   UUID             NOT NULL DEFAULT gen_random_uuid(),
    tenant_id                     TEXT             NOT NULL,
    name                          VARCHAR(100)     NOT NULL,
    description                   TEXT,
    source_template_id            UUID,
    is_active                     BOOLEAN          NOT NULL DEFAULT true,
    version                       REAL             NOT NULL DEFAULT 1,
    created_at                    TIMESTAMPTZ      NOT NULL DEFAULT now(),
    created_by                    UUID,
    updated_at                    TIMESTAMPTZ      NOT NULL DEFAULT now(),
    updated_by                    UUID,
    industry_id                   UUID,
    operational_criticality_score DOUBLE PRECISION,
    revenue_contribution_weight   DOUBLE PRECISION,
    regulatory_exposure_level     DOUBLE PRECISION,
    CONSTRAINT departments_pkey           PRIMARY KEY (public_uuid),
    CONSTRAINT uq_departments_id          UNIQUE (id),
    CONSTRAINT chk_departments_version    CHECK (version >= 1)
);

CREATE UNIQUE INDEX uq_departments_name_ci    ON departments (lower(name));
CREATE INDEX idx_departments_active_true       ON departments (public_uuid) WHERE is_active = true;
CREATE INDEX idx_departments_tenant_id         ON departments (tenant_id);
CREATE INDEX idx_departments_industry_id       ON departments (industry_id);
CREATE INDEX idx_departments_operational_score ON departments (operational_criticality_score);

ALTER TABLE departments
    ADD CONSTRAINT fk_departments_industry          FOREIGN KEY (industry_id)        REFERENCES industries(public_uuid),
    ADD CONSTRAINT fk_departments_source_template   FOREIGN KEY (source_template_id) REFERENCES departments(public_uuid),
    ADD CONSTRAINT fk_departments_created_by        FOREIGN KEY (created_by)         REFERENCES user_accounts(public_uuid),
    ADD CONSTRAINT fk_departments_updated_by        FOREIGN KEY (updated_by)         REFERENCES user_accounts(public_uuid);

-- ─── department_functional_groups ─────────────────────────────────────────────

CREATE TABLE department_functional_groups (
    id                  BIGINT      NOT NULL GENERATED ALWAYS AS IDENTITY,
    public_uuid         UUID        NOT NULL DEFAULT gen_random_uuid(),
    department_id       UUID        NOT NULL,
    functional_group_id UUID        NOT NULL,
    tenant_id           TEXT        NOT NULL,
    source_template_id  UUID,
    is_active           BOOLEAN     NOT NULL DEFAULT true,
    version             REAL        NOT NULL DEFAULT 1,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by          UUID,
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by          UUID,
    CONSTRAINT department_functional_groups_pkey        PRIMARY KEY (public_uuid),
    CONSTRAINT uq_department_functional_groups_id       UNIQUE (id),
    CONSTRAINT chk_department_functional_groups_version CHECK (version >= 1)
);

CREATE UNIQUE INDEX uq_department_functional_groups_map          ON department_functional_groups (department_id, functional_group_id);
CREATE INDEX idx_department_functional_groups_active_true        ON department_functional_groups (department_id, functional_group_id) WHERE is_active = true;
CREATE INDEX idx_department_functional_groups_department_id      ON department_functional_groups (department_id);
CREATE INDEX idx_department_functional_groups_fg_id              ON department_functional_groups (functional_group_id);
CREATE INDEX idx_department_functional_groups_tenant_id          ON department_functional_groups (tenant_id);

ALTER TABLE department_functional_groups
    ADD CONSTRAINT fk_department_functional_groups_department       FOREIGN KEY (department_id)       REFERENCES departments(public_uuid),
    ADD CONSTRAINT fk_department_functional_groups_functional_group FOREIGN KEY (functional_group_id) REFERENCES functional_groups(public_uuid),
    ADD CONSTRAINT fk_department_functional_groups_source_template  FOREIGN KEY (source_template_id)  REFERENCES department_functional_groups(public_uuid),
    ADD CONSTRAINT fk_department_functional_groups_created_by       FOREIGN KEY (created_by)          REFERENCES user_accounts(public_uuid),
    ADD CONSTRAINT fk_department_functional_groups_updated_by       FOREIGN KEY (updated_by)          REFERENCES user_accounts(public_uuid);

-- ─── roles ────────────────────────────────────────────────────────────────────

CREATE TABLE roles (
    id                 BIGINT       NOT NULL GENERATED ALWAYS AS IDENTITY,
    public_uuid        UUID         NOT NULL DEFAULT gen_random_uuid(),
    department_id      UUID         NOT NULL,
    tenant_id          TEXT         NOT NULL,
    name               VARCHAR(100) NOT NULL,
    description        TEXT,
    source_template_id UUID,
    is_active          BOOLEAN      NOT NULL DEFAULT true,
    version            REAL         NOT NULL DEFAULT 1,
    created_at         TIMESTAMPTZ  NOT NULL DEFAULT now(),
    created_by         UUID,
    updated_at         TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_by         UUID,
    CONSTRAINT roles_pkey               PRIMARY KEY (public_uuid),
    CONSTRAINT uq_roles_id              UNIQUE (id),
    CONSTRAINT chk_roles_version        CHECK (version >= 1)
);

CREATE UNIQUE INDEX uq_roles_department_name_ci ON roles (department_id, lower(name));
CREATE INDEX idx_roles_active_true              ON roles (department_id) WHERE is_active = true;
CREATE INDEX idx_roles_department_id            ON roles (department_id);
CREATE INDEX idx_roles_tenant_id                ON roles (tenant_id);

ALTER TABLE roles
    ADD CONSTRAINT fk_roles_department      FOREIGN KEY (department_id)      REFERENCES departments(public_uuid),
    ADD CONSTRAINT fk_roles_source_template FOREIGN KEY (source_template_id) REFERENCES roles(public_uuid),
    ADD CONSTRAINT fk_roles_created_by      FOREIGN KEY (created_by)         REFERENCES user_accounts(public_uuid),
    ADD CONSTRAINT fk_roles_updated_by      FOREIGN KEY (updated_by)         REFERENCES user_accounts(public_uuid);

-- ─── role_capability_instances ────────────────────────────────────────────────

CREATE TABLE role_capability_instances (
    id                     BIGINT      NOT NULL GENERATED ALWAYS AS IDENTITY,
    public_uuid            UUID        NOT NULL DEFAULT gen_random_uuid(),
    role_id                UUID        NOT NULL,
    capability_instance_id UUID        NOT NULL,
    is_mandatory           BOOLEAN     NOT NULL DEFAULT true,
    is_active              BOOLEAN     NOT NULL DEFAULT true,
    version                REAL        NOT NULL DEFAULT 1,
    created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by             UUID,
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by             UUID,
    CONSTRAINT role_capability_instances_pkey        PRIMARY KEY (public_uuid),
    CONSTRAINT uq_role_capability_instances_id       UNIQUE (id),
    CONSTRAINT chk_role_capability_instances_version CHECK (version >= 1)
);

CREATE UNIQUE INDEX uq_role_capability_instances_map              ON role_capability_instances (role_id, capability_instance_id);
CREATE INDEX idx_role_capability_instances_active_true            ON role_capability_instances (role_id, capability_instance_id) WHERE is_active = true;
CREATE INDEX idx_role_capability_instances_role_id                ON role_capability_instances (role_id);
CREATE INDEX idx_role_capability_instances_capability_instance_id ON role_capability_instances (capability_instance_id);
CREATE INDEX idx_role_capability_instances_mandatory_true         ON role_capability_instances (role_id) WHERE is_mandatory = true;

ALTER TABLE role_capability_instances
    ADD CONSTRAINT fk_role_capability_instances_role               FOREIGN KEY (role_id)               REFERENCES roles(public_uuid),
    ADD CONSTRAINT fk_role_capability_instances_capability_instance FOREIGN KEY (capability_instance_id) REFERENCES capability_instances(public_uuid),
    ADD CONSTRAINT fk_role_capability_instances_created_by          FOREIGN KEY (created_by)             REFERENCES user_accounts(public_uuid),
    ADD CONSTRAINT fk_role_capability_instances_updated_by          FOREIGN KEY (updated_by)             REFERENCES user_accounts(public_uuid);
