const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function makeUsersArray() {
	return [
		{
			id: 1,
			email: 'test-user-1@test.com',
			user_name: 'test-user-1',
			password: 'P@ssw0rd',
			date_created: '2020-01-22T16:28:32.615Z'
		},
		{
			id: 2,
			email: 'test-user-2@test.com',
			user_name: 'test-user-2',
			password: 'P@ssw0rd',
			date_created: '2020-01-22T16:28:32.615Z'
		},
		{
			id: 3,
			email: 'test-user-3@test.com',
			user_name: 'test-user-3',
			password: 'P@ssw0rd',
			date_created: '2020-01-22T16:28:32.615Z'
		},
		{
			id: 4,
			email: 'test-user-4@test.com',
			user_name: 'test-user-4',
			password: 'P@ssw0rd',
			date_created: '2020-01-22T16:28:32.615Z'
		}
	];
}

function makePuzzlesArray() {
	return [
		{
			id: 1,
			level: 3,
			difficulty: 253
		},
		{
			id: 2,
			level: 5,
			difficulty: 953
		},
		{
			id: 3,
			level: 3,
			difficulty: 251
		}
	];
}

function makePuzzleCellsArray() {
	return [
		{
			cell_id: 0,
			puzzle_id: 1,
			is_default: false,
			value: 9
		},
		{
			cell_id: 1,
			puzzle_id: 1,
			is_default: true,
			value: 7
		},
		{
			cell_id: 2,
			puzzle_id: 1,
			is_default: false,
			value: 3
		}
	];
}

function makeRecordsArray() {
	return [
		{
			id: 1,
			puzzle_id: 1,
			user_id: 2,
			is_solved: false,
			date_solved: null,
			step_id: null
		},
		{
			id: 2,
			puzzle_id: 3,
			user_id: 1,
			is_solved: false,
			date_solved: null,
			step_id: 2
		},
		{
			id: 3,
			puzzle_id: 2,
			user_id: 1,
			is_solved: true,
			date_solved: '2020-04-06T16:15:00.000Z',
			step_id: 265
		}
	];
}

function makeSudokuFixtures() {
	const testUsers = makeUsersArray();
	const testPuzzles = makePuzzlesArray();
	const testPuzzleCells = makePuzzleCellsArray();
	const testRecords = makeRecordsArray();
	return {
		testUsers, 
		testPuzzles,
		testPuzzleCells,
		testRecords
	};
}

function cleanTables(db) {
	return db.raw(
		`TRUNCATE
			users,
			puzzles,
			puzzle_cells,
			records,
			record_steps,
			step_before_notes,
			record_snapshots,
			snapshot_notes
			RESTART IDENTITY CASCADE`
	);
}

function seedUsers(db, users) {
	const preppedUsers = users.map(user => ({
		...user,
		password: bcrypt.hashSync(user.password, 1)
	}));

	return db.into('users').insert(preppedUsers)
		.then(() => 
			// update the auto sequence to match the forced id values
			db.raw(
				`SELECT setval('users_id_seq', ?)`,
				[users[users.length - 1].id]
			)
		);
}

function seedSudokuTables(db, users, puzzles, puzzleCells, records) {
	return db.transaction(async trx => {
		await seedUsers(db, users);
		await trx.into('puzzles').insert(puzzles)
			.then(() =>
				trx.raw(
					`SELECT setval('puzzles_id_seq', ?)`,
					[puzzles[puzzles.length - 1].id]
				)
			);
		await trx.into('puzzle_cells').insert(puzzleCells);
		await trx.into('records').insert(records)
			.then(() =>
				trx.raw(
					`SELECT setval('records_id_seq', ?)`,
					[records[records.length - 1].id]
				)
			);
	});
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
	const token = jwt.sign({ user_id: user.id }, secret, {
		subject: user.email,
		algorithm: 'HS256'
	});
	return `Bearer ${token}`;
}

function makeExpectedPuzzle(puzzle, puzzleCells) {
	puzzleCells = puzzleCells.map(pc => {
		delete pc.puzzle_id;
		return pc;
	});
	return {
		puzzle_id: puzzle.id,
		puzzle: puzzleCells
	};
}

module.exports = {
	makeUsersArray,
	makePuzzlesArray,
	makePuzzleCellsArray,
	makeRecordsArray,
	makeSudokuFixtures,
	cleanTables,
	seedUsers,
	seedSudokuTables,
	makeAuthHeader,
	makeExpectedPuzzle
};