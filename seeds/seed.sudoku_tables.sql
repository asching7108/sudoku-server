BEGIN;

TRUNCATE
	users,
	puzzles,
	puzzle_cells,
	records,
	record_steps,
	step_before_notes,
	record_snapshots,
	snapshot_notes
	RESTART IDENTITY CASCADE;

/* 
 * unhashed password: P@ssw0rd 
 * bcrypt salt iteration count: 12
 */
INSERT INTO users (email, user_name, password)
VALUES
	('demo@gmail.com', 'Blair Waldorf', '$2a$12$y2olsPjdjW9z.JtJq0np1.gPQrF4/OifnFSOLXqkJ9DXviyzbFbIe'),
	('test@gmail.com', 'Esther Lin', '$2a$12$y2olsPjdjW9z.JtJq0np1.gPQrF4/OifnFSOLXqkJ9DXviyzbFbIe');

INSERT INTO puzzles (level, difficulty)
VALUES
	(3, 253),
	(5, 953),
	(3, 251);

INSERT INTO puzzle_cells (cell_id, puzzle_id, is_default, value)
VALUES
	(0, 1, FALSE, 9),
	(1, 1, TRUE, 7),
	(2, 1, FALSE, 3);

INSERT INTO records (puzzle_id, user_id, is_solved, date_solved, step_id)
VALUES
	(1, 2, FALSE, NULL, NULL),
	(3, 1, FALSE, NULL, 2),
	(2, 1, TRUE, '2020-04-06T16:15:00.000Z', 265);

COMMIT;