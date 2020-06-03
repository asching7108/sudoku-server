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
	('demo@gmail.com', 'Blair', '$2a$12$y2olsPjdjW9z.JtJq0np1.gPQrF4/OifnFSOLXqkJ9DXviyzbFbIe'),
	('test@gmail.com', 'Esther', '$2a$12$y2olsPjdjW9z.JtJq0np1.gPQrF4/OifnFSOLXqkJ9DXviyzbFbIe');

INSERT INTO puzzles (level, difficulty, num_empty_cells)
VALUES
	(3, 253, 53),
	(5, 953, 53),
	(1, 43, 43);

INSERT INTO puzzle_cells (cell_id, puzzle_id, is_default, value)
VALUES
	(0, 1, false, 8),
	(1, 1, true, 7),
	(2, 1, false, 6),
	(3, 1, true, 3),
	(4, 1, false, 2),
	(5, 1, false, 5),
	(6, 1, false, 9),
	(7, 1, true, 4),
	(8, 1, false, 1),
	(9, 1, true, 3),
	(10, 1, false, 4),
	(11, 1, false, 5),
	(12, 1, false, 1),
	(13, 1, true, 8),
	(14, 1, false, 9),
	(15, 1, true, 2),
	(16, 1, false, 6),
	(17, 1, false, 7),
	(18, 1, true, 2),
	(19, 1, false, 9),
	(20, 1, true, 1),
	(21, 1, true, 4),
	(22, 1, false, 6),
	(23, 1, true, 7),
	(24, 1, false, 5),
	(25, 1, false, 3),
	(26, 1, false, 8),
	(27, 1, true, 5),
	(28, 1, false, 3),
	(29, 1, true, 4),
	(30, 1, false, 2),
	(31, 1, false, 7),
	(32, 1, false, 1),
	(33, 1, false, 8),
	(34, 1, true, 9),
	(35, 1, false, 6),
	(36, 1, false, 7),
	(37, 1, true, 2),
	(38, 1, false, 8),
	(39, 1, false, 6),
	(40, 1, false, 9),
	(41, 1, false, 3),
	(42, 1, false, 1),
	(43, 1, true, 5),
	(44, 1, false, 4),
	(45, 1, false, 6),
	(46, 1, true, 1),
	(47, 1, false, 9),
	(48, 1, false, 5),
	(49, 1, false, 4),
	(50, 1, false, 8),
	(51, 1, true, 7),
	(52, 1, false, 2),
	(53, 1, true, 3),
	(54, 1, false, 4),
	(55, 1, false, 8),
	(56, 1, false, 7),
	(57, 1, true, 9),
	(58, 1, false, 5),
	(59, 1, true, 6),
	(60, 1, true, 3),
	(61, 1, false, 1),
	(62, 1, true, 2),
	(63, 1, false, 1),
	(64, 1, false, 5),
	(65, 1, true, 2),
	(66, 1, false, 8),
	(67, 1, true, 3),
	(68, 1, false, 4),
	(69, 1, false, 6),
	(70, 1, false, 7),
	(71, 1, true, 9),
	(72, 1, false, 9),
	(73, 1, true, 6),
	(74, 1, false, 3),
	(75, 1, false, 7),
	(76, 1, false, 1),
	(77, 1, true, 2),
	(78, 1, false, 4),
	(79, 1, true, 8),
	(80, 1, false, 5);

INSERT INTO records (puzzle_id, user_id, num_empty_cells, num_wrong_cells, is_solved, date_solved, step_id)
VALUES
	(1, 2, 53, 0, FALSE, NULL, NULL),
	(2, 1, 0, 0, TRUE, '2020-04-06T16:15:00.000Z', 265);

INSERT INTO record_snapshots (cell_id, record_id, is_default, def_value, value, has_conflict)
VALUES
	(0, 2, FALSE, 8, null, FALSE),
	(1, 2, TRUE, 1, 1, FALSE),
	(2, 2, FALSE, 5, 5, FALSE);

INSERT INTO snapshot_memos (memo_no, cell_id, record_id, is_on)
VALUES
	(1, 0, 2, false),
	(2, 0, 2, false),
	(3, 0, 2, false),
	(4, 0, 2, true),
	(5, 0, 2, false),
	(6, 0, 2, false),
	(7, 0, 2, false),
	(8, 0, 2, false),
	(9, 0, 2, true);

COMMIT;