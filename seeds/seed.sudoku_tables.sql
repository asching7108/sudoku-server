BEGIN;

TRUNCATE
	users,
	puzzles,
	puzzle_cells,
	records,
	record_snapshots,
	snapshot_memos,
	record_steps,
	step_memos
	RESTART IDENTITY CASCADE;

/* 
 * unhashed password: P@ssw0rd 
 * bcrypt salt iteration count: 12
 */
INSERT INTO users (email, user_name, password)
VALUES
	('guest@gmail.com', 'guest', '$2a$12$y2olsPjdjW9z.JtJq0np1.gPQrF4/OifnFSOLXqkJ9DXviyzbFbIe'),
	('demo@gmail.com', 'Blair', '$2a$12$y2olsPjdjW9z.JtJq0np1.gPQrF4/OifnFSOLXqkJ9DXviyzbFbIe');

COMMIT;