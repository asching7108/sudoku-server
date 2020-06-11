ALTER TABLE records
	DROP COLUMN IF EXISTS
		date_solved,
	DROP COLUMN IF EXISTS
		is_solved;

ALTER TABLE records
	ADD COLUMN IF NOT EXISTS
		date_modified TIMESTAMP DEFAULT (now() AT TIME ZONE 'UTC'),
	ADD COLUMN IF NOT EXISTS
		duration INTEGER NOT NULL DEFAULT 0;

ALTER TABLE record_steps
	DROP COLUMN IF EXISTS
		date_created;
