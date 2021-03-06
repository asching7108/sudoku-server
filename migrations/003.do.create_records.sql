CREATE TABLE records (
	id SERIAL PRIMARY KEY,
	puzzle_id INTEGER
		REFERENCES puzzles(id) ON DELETE CASCADE NOT NULL,
	user_id INTEGER
		REFERENCES USERS(id) ON DELETE CASCADE NOT NULL,
	num_empty_cells INTEGER NOT NULL,
	num_wrong_cells INTEGER NOT NULL DEFAULT 0,
	is_solved BOOLEAN NOT NULL DEFAULT FALSE,
	date_solved TIMESTAMP,
	step_id INTEGER,
	max_step_id INTEGER,
	date_created TIMESTAMP NOT NULL DEFAULT (now() AT TIME ZONE 'UTC')
);

CREATE TABLE record_snapshots (
	cell_id INTEGER NOT NULL,
	record_id INTEGER
		REFERENCES records(id) ON DELETE CASCADE NOT NULL,
	is_default BOOLEAN NOT NULL,
	def_value INTEGER NOT NULL,
	value INTEGER,
	has_conflict BOOLEAN NOT NULL,
	PRIMARY KEY (cell_id, record_id)
);

CREATE TABLE snapshot_memos (
	memo_no INTEGER NOT NULL,
	cell_id INTEGER NOT NULL,
	record_id INTEGER
		REFERENCES records(id) ON DELETE CASCADE NOT NULL,
	is_on BOOLEAN NOT NULL DEFAULT FALSE,
	PRIMARY KEY (memo_no, cell_id, record_id)
);

CREATE TYPE STEP_TYPE AS ENUM (
	'BEFORE',
	'AFTER'
);

CREATE TABLE record_steps (
	step_id INTEGER NOT NULL,
	record_id INTEGER
		REFERENCES records(id) ON DELETE CASCADE NOT NULL,
	cell_id INTEGER NOT NULL,
	step_type STEP_TYPE NOT NULL,
	value INTEGER,
	has_conflict BOOLEAN NOT NULL,
	date_created TIMESTAMP NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
	PRIMARY KEY (step_id, record_id, step_type)
);

CREATE TABLE step_memos (
	memo_no INTEGER NOT NULL,
	step_id INTEGER NOT NULL,
	record_id INTEGER
		REFERENCES records(id) ON DELETE CASCADE NOT NULL,
	cell_id INTEGER NOT NULL,
	step_type STEP_TYPE NOT NULL,
	is_on BOOLEAN NOT NULL,
	PRIMARY KEY (memo_no, step_id, record_id, step_type)
);
