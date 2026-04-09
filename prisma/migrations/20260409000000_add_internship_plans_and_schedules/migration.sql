-- CreateTable
CREATE TABLE "internship_plans" (
    "id" BIGSERIAL NOT NULL,
    "public_uuid" TEXT NOT NULL,
    "internship_id" BIGINT NOT NULL,
    "pwo_id" BIGINT NOT NULL,
    "capability_instance_id" BIGINT NOT NULL,
    "mentor_user_id" BIGINT NOT NULL,
    "no_of_weeks" INTEGER NOT NULL,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "created_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "internship_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "internship_schedules" (
    "id" BIGSERIAL NOT NULL,
    "public_uuid" TEXT NOT NULL,
    "internship_plan_id" BIGINT NOT NULL,
    "task_id" BIGINT NOT NULL,
    "week_number" INTEGER NOT NULL,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "evidence" TEXT,
    "created_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "internship_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "internship_plans_public_uuid_key" ON "internship_plans"("public_uuid");

-- CreateIndex
CREATE INDEX "internship_plans_internship_id_idx" ON "internship_plans"("internship_id");

-- CreateIndex
CREATE UNIQUE INDEX "internship_schedules_public_uuid_key" ON "internship_schedules"("public_uuid");

-- CreateIndex
CREATE INDEX "internship_schedules_internship_plan_id_idx" ON "internship_schedules"("internship_plan_id");

-- AddForeignKey
ALTER TABLE "internship_plans" ADD CONSTRAINT "internship_plans_internship_id_fkey" FOREIGN KEY ("internship_id") REFERENCES "internships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internship_plans" ADD CONSTRAINT "internship_plans_pwo_id_fkey" FOREIGN KEY ("pwo_id") REFERENCES "pwos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internship_plans" ADD CONSTRAINT "internship_plans_capability_instance_id_fkey" FOREIGN KEY ("capability_instance_id") REFERENCES "capability_instances"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internship_schedules" ADD CONSTRAINT "internship_schedules_internship_plan_id_fkey" FOREIGN KEY ("internship_plan_id") REFERENCES "internship_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internship_schedules" ADD CONSTRAINT "internship_schedules_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
