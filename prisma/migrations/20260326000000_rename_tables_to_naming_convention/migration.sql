-- Rename tables to follow project naming convention:
-- Entities: plural, lowercase, snake_case
-- Mappings: entity1_entity2 alphabetical, no _mappings suffix
-- Abbreviations: only for entity names longer than 2 words (SWOs, PWOs)

ALTER TABLE "primary_work_objects"   RENAME TO "pwos";
ALTER TABLE "secondary_work_objects" RENAME TO "swos";
ALTER TABLE "department_fg_mappings" RENAME TO "departments_functional_groups";
ALTER TABLE "role_ci_mappings"       RENAME TO "capability_instances_industry_roles";
