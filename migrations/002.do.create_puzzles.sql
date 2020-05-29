CREATE TABLE puzzles (
	id SERIAL PRIMARY KEY,
	level INTEGER NOT NULL,
	difficulty INTEGER NOT NULL,
	num_empty_cells INTEGER NOT NULL,
	is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
	date_created TIMESTAMP NOT NULL DEFAULT (now() AT TIME ZONE 'UTC')
);

CREATE TABLE puzzle_cells (
	cell_id INTEGER NOT NULL,
	puzzle_id INTEGER
		REFERENCES puzzles(id) ON DELETE CASCADE NOT NULL,
	is_default BOOLEAN NOT NULL,
	value INTEGER NOT NULL,
	date_created TIMESTAMP NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
	PRIMARY KEY (cell_id, puzzle_id)
);