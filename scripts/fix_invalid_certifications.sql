-- Cleanup script: normalize invalid certifications in user_skills
-- Safe to run multiple times (idempotent)
--
-- What it does:
-- 1) Sets NULL or empty certifications to '[]'
-- 2) Sets any non-JSON certifications to '[]'
--
-- Preview helpers (uncomment to inspect before applying):
-- SELECT id, user_id, skill_id, certifications
-- FROM user_skills
-- WHERE certifications IS NULL
--    OR LENGTH(TRIM(certifications)) = 0
--    OR (certifications IS NOT NULL AND LENGTH(TRIM(certifications)) > 0 AND json_valid(certifications) = 0)
-- ORDER BY updated_at DESC
-- LIMIT 100;

BEGIN TRANSACTION;

-- Normalize NULL or empty strings to valid empty JSON array
UPDATE user_skills
SET certifications = '[]'
WHERE certifications IS NULL
   OR LENGTH(TRIM(certifications)) = 0;

-- Normalize invalid JSON values to empty array
UPDATE user_skills
SET certifications = '[]'
WHERE certifications IS NOT NULL
  AND LENGTH(TRIM(certifications)) > 0
  AND json_valid(certifications) = 0;

COMMIT;
