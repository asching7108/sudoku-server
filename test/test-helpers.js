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
			difficulty: 253,
			num_empty_cells: 53
		},
		{
			id: 2,
			level: 5,
			difficulty: 953,
			num_empty_cells: 53
		},
		{
			id: 3,
			level: 1,
			difficulty: 51,
			num_empty_cells: 51
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
		},
		{
			cell_id: 0,
			puzzle_id: 3,
			is_default: false,
			value: 6
		},
		{
			cell_id: 1,
			puzzle_id: 3,
			is_default: true,
			value: 1
		},
		{
			cell_id: 2,
			puzzle_id: 3,
			is_default: false,
			value: 4
		}
	];
}

function makeRecordsArray() {
	return [
		{
			id: 1,
			puzzle_id: 1,
			user_id: 2,
			num_empty_cells: 53,
			num_wrong_cells: 0,
			is_solved: false,
			date_solved: null,
			step_id: null
		},
		{
			id: 2,
			puzzle_id: 3,
			user_id: 1,
			num_empty_cells: 51,
			num_wrong_cells: 0,
			is_solved: false,
			date_solved: null,
			step_id: 2
		},
		{
			id: 3,
			puzzle_id: 2,
			user_id: 1,
			num_empty_cells: 53,
			num_wrong_cells: 0,
			is_solved: true,
			date_solved: '2020-04-06T16:15:00.000Z',
			step_id: 265
		}
	];
}

function makeRecordSnapshotsArray() {
	return [
		{
			cell_id: 0,
			record_id: 2,
			is_default: false,
			def_value: 8,
			value: null,
			has_conflict: false
		},
		{
			cell_id: 1,
			record_id: 2,
			is_default: true,
			def_value: 1,
			value: 1,
			has_conflict: false
		},
		{
			cell_id: 2,
			record_id: 2,
			is_default: false,
			def_value: 5,
			value: 5,
			has_conflict: false
		}
	];
}

function makeSnapshotMemosArray() {
	return [
		{
			memo_no: 1,
			cell_id: 0,
			record_id: 2,
			is_on: false
		},
		{
			memo_no: 2,
			cell_id: 0,
			record_id: 2,
			is_on: false
		},
		{
			memo_no: 3,
			cell_id: 0,
			record_id: 2,
			is_on: false
		},
		{
			memo_no: 4,
			cell_id: 0,
			record_id: 2,
			is_on: true
		},
		{
			memo_no: 5,
			cell_id: 0,
			record_id: 2,
			is_on: false
		},
		{
			memo_no: 6,
			cell_id: 0,
			record_id: 2,
			is_on: false
		},
		{
			memo_no: 7,
			cell_id: 0,
			record_id: 2,
			is_on: false
		},
		{
			memo_no: 8,
			cell_id: 0,
			record_id: 2,
			is_on: false
		},
		{
			memo_no: 9,
			cell_id: 0,
			record_id: 2,
			is_on: true
		}
	];
}

function makeSudokuFixtures() {
	const testUsers = makeUsersArray();
	const testPuzzles = makePuzzlesArray();
	const testPuzzleCells = makePuzzleCellsArray();
	const testRecords = makeRecordsArray();
	const testSnapshots = makeRecordSnapshotsArray();
	const testSnapshotMemos = makeSnapshotMemosArray();
	return {
		testUsers, 
		testPuzzles,
		testPuzzleCells,
		testRecords,
		testSnapshots,
		testSnapshotMemos
	};
}

function cleanTables(db) {
	return db.raw(
		`TRUNCATE
			users,
			puzzles,
			puzzle_cells,
			records,
			record_snapshots,
			snapshot_memos,
			record_steps,
			step_before_memos
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

function seedSudokuTables(db, users, puzzles, puzzleCells, records, snapshots, memos) {
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
		if (records) {
			await trx.into('records').insert(records)
			.then(() =>
				trx.raw(
					`SELECT setval('records_id_seq', ?)`,
					[records[records.length - 1].id]
				)
			);
		}
		await trx.into('record_snapshots').insert(snapshots);
		await trx.into('snapshot_memos').insert(memos);
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
	const expectPuzzleCells = [];
	puzzleCells.forEach(pc => {
		expectPuzzleCells.push({
			cell_id: pc.cell_id,
			is_default: pc.is_default,
			value: pc.value
		});
	})
	return {
		puzzle_id: puzzle.id,
		puzzle: expectPuzzleCells,
		num_empty_cells: puzzle.num_empty_cells
	};
}

function makeExpectedRecords(records) {
	const solved = records
		.filter(r => r.is_solved);
	const not_solved = records
		.filter(r => !r.is_solved);
	return ({ solved, not_solved });
}

function makeExpectedRecord(record, snapshot, memos) {
	return {
		record,
		snapshot: snapshot.map(sc => {
			const memoArr = memos
				.filter(m => m.cell_id === sc.cell_id)
				.map(m => m.is_on)
			sc.memos = memoArr;
			delete sc.record_id;
			delete sc.cell_id;
			return sc;
		})
	}
}

module.exports = {
	makeUsersArray,
	makePuzzlesArray,
	makePuzzleCellsArray,
	makeRecordsArray,
	makeRecordSnapshotsArray,
	makeSudokuFixtures,
	cleanTables,
	seedUsers,
	seedSudokuTables,
	makeAuthHeader,
	makeExpectedPuzzle,
	makeExpectedRecords,
	makeExpectedRecord
};