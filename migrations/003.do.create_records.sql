CREATE TABLE records (
	id SERIAL PRIMARY KEY,
	puzzle_id INTEGER
		REFERENCES puzzles(id) ON DELETE CASCADE NOT NULL,
	user_id INTEGER
		REFERENCES USERS(id) ON DELETE CASCADE NOT NULL,
	is_solved BOOLEAN NOT NULL DEFAULT FALSE,
	date_solved TIMESTAMP,
	step_id INTEGER,
	date_created TIMESTAMP NOT NULL DEFAULT (now() AT TIME ZONE 'UTC')
);

CREATE TABLE record_steps (
	step_id INTEGER NOT NULL,
	record_id INTEGER
		REFERENCES records(id) ON DELETE CASCADE NOT NULL,
	cell_id INTEGER NOT NULL,
	before_value INTEGER,
	after_value INTEGER,
	remove_note_num INTEGER,
	add_note_num INTEGER,
	date_created TIMESTAMP NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
	PRIMARY KEY (step_id, record_id)
);

CREATE TABLE step_before_notes (
	step_id INTEGER NOT NULL,
	record_id INTEGER
		REFERENCES records(id) ON DELETE CASCADE NOT NULL,
	note_num INTEGER NOT NULL,
	PRIMARY KEY (note_num, step_id, record_id)
);

CREATE TABLE record_snapshots (
	cell_id INTEGER NOT NULL,
	record_id INTEGER
		REFERENCES records(id) ON DELETE CASCADE NOT NULL,
	is_default BOOLEAN NOT NULL,
	value INTEGER,
	PRIMARY KEY (cell_id, record_id)
);

CREATE TABLE snapshot_notes (
	note_num INTEGER NOT NULL,
	cell_id INTEGER NOT NULL,
	record_id INTEGER
		REFERENCES records(id) ON DELETE CASCADE NOT NULL,
	PRIMARY KEY (note_num, cell_id, record_id)
);