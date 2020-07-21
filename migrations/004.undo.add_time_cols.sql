ALTER TABLE record_steps
	ADD COLUMN IF NOT EXISTS
		date_created TIMESTAMP NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  ADD COLUMN IF NOT EXISTS
    is_solved BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE records
	DROP COLUMN IF EXISTS
		date_modified,
  DROP COLUMN IF EXISTS
		duration;

ALTER TABLE records
	ADD COLUMN IF NOT EXISTS
		date_solved TIMESTAMP;