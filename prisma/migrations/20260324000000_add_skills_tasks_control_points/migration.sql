-- CreateTable
CREATE TABLE "skills" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "ciId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "cognitiveType" TEXT NOT NULL,
    "skillCriticality" TEXT NOT NULL,
    "recertificationCycle" INTEGER NOT NULL,
    "aiImpact" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "frequency" TEXT NOT NULL,
    "complexity" TEXT NOT NULL,
    "standardDuration" INTEGER,
    "requiredProficiencyLevel" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "control_points" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "riskLevel" TEXT NOT NULL,
    "failureImpactType" TEXT NOT NULL,
    "kpiThreshold" TEXT,
    "escalationRequired" TEXT NOT NULL,
    "evidenceType" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "control_points_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "skills" ADD CONSTRAINT "skills_ciId_fkey" FOREIGN KEY ("ciId") REFERENCES "capability_instances"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skills"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "control_points" ADD CONSTRAINT "control_points_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
