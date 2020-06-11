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
		{ cell_id: 0, puzzle_id: 1, is_default: false, value: 8 },
		{ cell_id: 1, puzzle_id: 1, is_default: true, value: 7 },
		{ cell_id: 2, puzzle_id: 1, is_default: false, value: 6 },
		{ cell_id: 3, puzzle_id: 1, is_default: true, value: 3 },
		{ cell_id: 4, puzzle_id: 1, is_default: false, value: 2 },
		{ cell_id: 5, puzzle_id: 1, is_default: false, value: 5 },
		{ cell_id: 6, puzzle_id: 1, is_default: false, value: 9 },
		{ cell_id: 7, puzzle_id: 1, is_default: true, value: 4 },
		{ cell_id: 8, puzzle_id: 1, is_default: false, value: 1 },
		{ cell_id: 9, puzzle_id: 1, is_default: true, value: 3 },
		{ cell_id: 10, puzzle_id: 1, is_default: false, value: 4 },
		{ cell_id: 11, puzzle_id: 1, is_default: false, value: 5 },
		{ cell_id: 12, puzzle_id: 1, is_default: false, value: 1 },
		{ cell_id: 13, puzzle_id: 1, is_default: true, value: 8 },
		{ cell_id: 14, puzzle_id: 1, is_default: false, value: 9 },
		{ cell_id: 15, puzzle_id: 1, is_default: true, value: 2 },
		{ cell_id: 16, puzzle_id: 1, is_default: false, value: 6 },
		{ cell_id: 17, puzzle_id: 1, is_default: false, value: 7 },
		{ cell_id: 18, puzzle_id: 1, is_default: true, value: 2 },
		{ cell_id: 19, puzzle_id: 1, is_default: false, value: 9 },
		{ cell_id: 20, puzzle_id: 1, is_default: true, value: 1 },
		{ cell_id: 21, puzzle_id: 1, is_default: true, value: 4 },
		{ cell_id: 22, puzzle_id: 1, is_default: false, value: 6 },
		{ cell_id: 23, puzzle_id: 1, is_default: true, value: 7 },
		{ cell_id: 24, puzzle_id: 1, is_default: false, value: 5 },
		{ cell_id: 25, puzzle_id: 1, is_default: false, value: 3 },
		{ cell_id: 26, puzzle_id: 1, is_default: false, value: 8 },
		{ cell_id: 27, puzzle_id: 1, is_default: true, value: 5 },
		{ cell_id: 28, puzzle_id: 1, is_default: false, value: 3 },
		{ cell_id: 29, puzzle_id: 1, is_default: true, value: 4 },
		{ cell_id: 30, puzzle_id: 1, is_default: false, value: 2 },
		{ cell_id: 31, puzzle_id: 1, is_default: false, value: 7 },
		{ cell_id: 32, puzzle_id: 1, is_default: false, value: 1 },
		{ cell_id: 33, puzzle_id: 1, is_default: false, value: 8 },
		{ cell_id: 34, puzzle_id: 1, is_default: true, value: 9 },
		{ cell_id: 35, puzzle_id: 1, is_default: false, value: 6 },
		{ cell_id: 36, puzzle_id: 1, is_default: false, value: 7 },
		{ cell_id: 37, puzzle_id: 1, is_default: true, value: 2 },
		{ cell_id: 38, puzzle_id: 1, is_default: false, value: 8 },
		{ cell_id: 39, puzzle_id: 1, is_default: false, value: 6 },
		{ cell_id: 40, puzzle_id: 1, is_default: false, value: 9 },
		{ cell_id: 41, puzzle_id: 1, is_default: false, value: 3 },
		{ cell_id: 42, puzzle_id: 1, is_default: false, value: 1 },
		{ cell_id: 43, puzzle_id: 1, is_default: true, value: 5 },
		{ cell_id: 44, puzzle_id: 1, is_default: false, value: 4 },
		{ cell_id: 45, puzzle_id: 1, is_default: false, value: 6 },
		{ cell_id: 46, puzzle_id: 1, is_default: true, value: 1 },
		{ cell_id: 47, puzzle_id: 1, is_default: false, value: 9 },
		{ cell_id: 48, puzzle_id: 1, is_default: false, value: 5 },
		{ cell_id: 49, puzzle_id: 1, is_default: false, value: 4 },
		{ cell_id: 50, puzzle_id: 1, is_default: false, value: 8 },
		{ cell_id: 51, puzzle_id: 1, is_default: true, value: 7 },
		{ cell_id: 52, puzzle_id: 1, is_default: false, value: 2 },
		{ cell_id: 53, puzzle_id: 1, is_default: true, value: 3 },
		{ cell_id: 54, puzzle_id: 1, is_default: false, value: 4 },
		{ cell_id: 55, puzzle_id: 1, is_default: false, value: 8 },
		{ cell_id: 56, puzzle_id: 1, is_default: false, value: 7 },
		{ cell_id: 57, puzzle_id: 1, is_default: true, value: 9 },
		{ cell_id: 58, puzzle_id: 1, is_default: false, value: 5 },
		{ cell_id: 59, puzzle_id: 1, is_default: true, value: 6 },
		{ cell_id: 60, puzzle_id: 1, is_default: true, value: 3 },
		{ cell_id: 61, puzzle_id: 1, is_default: false, value: 1 },
		{ cell_id: 62, puzzle_id: 1, is_default: true, value: 2 },
		{ cell_id: 63, puzzle_id: 1, is_default: false, value: 1 },
		{ cell_id: 64, puzzle_id: 1, is_default: false, value: 5 },
		{ cell_id: 65, puzzle_id: 1, is_default: true, value: 2 },
		{ cell_id: 66, puzzle_id: 1, is_default: false, value: 8 },
		{ cell_id: 67, puzzle_id: 1, is_default: true, value: 3 },
		{ cell_id: 68, puzzle_id: 1, is_default: false, value: 4 },
		{ cell_id: 69, puzzle_id: 1, is_default: false, value: 6 },
		{ cell_id: 70, puzzle_id: 1, is_default: false, value: 7 },
		{ cell_id: 71, puzzle_id: 1, is_default: true, value: 9 },
		{ cell_id: 72, puzzle_id: 1, is_default: false, value: 9 },
		{ cell_id: 73, puzzle_id: 1, is_default: true, value: 6 },
		{ cell_id: 74, puzzle_id: 1, is_default: false, value: 3 },
		{ cell_id: 75, puzzle_id: 1, is_default: false, value: 7 },
		{ cell_id: 76, puzzle_id: 1, is_default: false, value: 1 },
		{ cell_id: 77, puzzle_id: 1, is_default: true, value: 2 },
		{ cell_id: 78, puzzle_id: 1, is_default: false, value: 4 },
		{ cell_id: 79, puzzle_id: 1, is_default: true, value: 8 },
		{ cell_id: 80, puzzle_id: 1, is_default: false, value: 5 }
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
			step_id: null,
			max_step_id: null,
			duration: 0,
			date_created: '2020-04-06T16:15:05.000Z',
			date_modified: '2020-04-06T16:15:05.000Z'
		},
		{
			id: 2,
			puzzle_id: 3,
			user_id: 1,
			num_empty_cells: 51,
			num_wrong_cells: 0,
			step_id: null,
			max_step_id: null,
			duration: 0,
			date_created: '2020-04-06T16:15:05.000Z',
			date_modified: '2020-04-06T16:15:05.000Z'
		},
		{
			id: 3,
			puzzle_id: 3,
			user_id: 1,
			num_empty_cells: 51,
			num_wrong_cells: 0,
			step_id: 2,
			max_step_id: 2,
			duration: 65,
			date_created: '2020-04-06T16:15:05.000Z',
			date_modified: '2020-04-06T16:16:10.000Z'
		},
		{
			id: 4,
			puzzle_id: 2,
			user_id: 1,
			num_empty_cells: 53,
			num_wrong_cells: 0,
			step_id: 265,
			max_step_id: 265,
			duration: 485,
			date_created: '2020-04-06T16:15:05.000Z',
			date_modified: '2020-04-06T16:23:10.000Z'
		}
	];
}

function makeRecordSnapshotsArray() {
	return [
		{ cell_id: 0, record_id: 1, is_default: false, value: null, def_value: 8, has_conflict: false },
		{ cell_id: 1, record_id: 1, is_default: true, value: 7, def_value: 7, has_conflict: false },
		{ cell_id: 2, record_id: 1, is_default: false, value: null, def_value: 6, has_conflict: false },
		{ cell_id: 3, record_id: 1, is_default: true, value: 3, def_value: 3, has_conflict: false },
		{ cell_id: 4, record_id: 1, is_default: false, value: null, def_value: 2, has_conflict: false },
		{ cell_id: 5, record_id: 1, is_default: false, value: null, def_value: 5, has_conflict: false },
		{ cell_id: 6, record_id: 1, is_default: false, value: null, def_value: 9, has_conflict: false },
		{ cell_id: 7, record_id: 1, is_default: true, value: 4, def_value: 4, has_conflict: false },
		{ cell_id: 8, record_id: 1, is_default: false, value: null, def_value: 1, has_conflict: false },
		{ cell_id: 9, record_id: 1, is_default: true, value: 3, def_value: 3, has_conflict: false },
		{ cell_id: 10, record_id: 1, is_default: false, value: null, def_value: 4, has_conflict: false },
		{ cell_id: 11, record_id: 1, is_default: false, value: null, def_value: 5, has_conflict: false },
		{ cell_id: 12, record_id: 1, is_default: false, value: null, def_value: 1, has_conflict: false },
		{ cell_id: 13, record_id: 1, is_default: true, value: 8, def_value: 8, has_conflict: false },
		{ cell_id: 14, record_id: 1, is_default: false, value: null, def_value: 9, has_conflict: false },
		{ cell_id: 15, record_id: 1, is_default: true, value: 2, def_value: 2, has_conflict: false },
		{ cell_id: 16, record_id: 1, is_default: false, value: null, def_value: 6, has_conflict: false },
		{ cell_id: 17, record_id: 1, is_default: false, value: null, def_value: 7, has_conflict: false },
		{ cell_id: 18, record_id: 1, is_default: true, value: 2, def_value: 2, has_conflict: false },
		{ cell_id: 19, record_id: 1, is_default: false, value: null, def_value: 9, has_conflict: false },
		{ cell_id: 20, record_id: 1, is_default: true, value: 1, def_value: 1, has_conflict: false },
		{ cell_id: 21, record_id: 1, is_default: true, value: 4, def_value: 4, has_conflict: false },
		{ cell_id: 22, record_id: 1, is_default: false, value: null, def_value: 6, has_conflict: false },
		{ cell_id: 23, record_id: 1, is_default: true, value: 7, def_value: 7, has_conflict: false },
		{ cell_id: 24, record_id: 1, is_default: false, value: null, def_value: 5, has_conflict: false },
		{ cell_id: 25, record_id: 1, is_default: false, value: null, def_value: 3, has_conflict: false },
		{ cell_id: 26, record_id: 1, is_default: false, value: null, def_value: 8, has_conflict: false },
		{ cell_id: 27, record_id: 1, is_default: true, value: 5, def_value: 5, has_conflict: false },
		{ cell_id: 28, record_id: 1, is_default: false, value: null, def_value: 3, has_conflict: false },
		{ cell_id: 29, record_id: 1, is_default: true, value: 4, def_value: 4, has_conflict: false },
		{ cell_id: 30, record_id: 1, is_default: false, value: null, def_value: 2, has_conflict: false },
		{ cell_id: 31, record_id: 1, is_default: false, value: null, def_value: 7, has_conflict: false },
		{ cell_id: 32, record_id: 1, is_default: false, value: null, def_value: 1, has_conflict: false },
		{ cell_id: 33, record_id: 1, is_default: false, value: null, def_value: 8, has_conflict: false },
		{ cell_id: 34, record_id: 1, is_default: true, value: 9, def_value: 9, has_conflict: false },
		{ cell_id: 35, record_id: 1, is_default: false, value: null, def_value: 6, has_conflict: false },
		{ cell_id: 36, record_id: 1, is_default: false, value: null, def_value: 7, has_conflict: false },
		{ cell_id: 37, record_id: 1, is_default: true, value: 2, def_value: 2, has_conflict: false },
		{ cell_id: 38, record_id: 1, is_default: false, value: null, def_value: 8, has_conflict: false },
		{ cell_id: 39, record_id: 1, is_default: false, value: null, def_value: 6, has_conflict: false },
		{ cell_id: 40, record_id: 1, is_default: false, value: null, def_value: 9, has_conflict: false },
		{ cell_id: 41, record_id: 1, is_default: false, value: null, def_value: 3, has_conflict: false },
		{ cell_id: 42, record_id: 1, is_default: false, value: null, def_value: 1, has_conflict: false },
		{ cell_id: 43, record_id: 1, is_default: true, value: 5, def_value: 5, has_conflict: false },
		{ cell_id: 44, record_id: 1, is_default: false, value: null, def_value: 4, has_conflict: false },
		{ cell_id: 45, record_id: 1, is_default: false, value: null, def_value: 6, has_conflict: false },
		{ cell_id: 46, record_id: 1, is_default: true, value: 1, def_value: 1, has_conflict: false },
		{ cell_id: 47, record_id: 1, is_default: false, value: null, def_value: 9, has_conflict: false },
		{ cell_id: 48, record_id: 1, is_default: false, value: null, def_value: 5, has_conflict: false },
		{ cell_id: 49, record_id: 1, is_default: false, value: null, def_value: 4, has_conflict: false },
		{ cell_id: 50, record_id: 1, is_default: false, value: null, def_value: 8, has_conflict: false },
		{ cell_id: 51, record_id: 1, is_default: true, value: 7, def_value: 7, has_conflict: false },
		{ cell_id: 52, record_id: 1, is_default: false, value: null, def_value: 2, has_conflict: false },
		{ cell_id: 53, record_id: 1, is_default: true, value: 3, def_value: 3, has_conflict: false },
		{ cell_id: 54, record_id: 1, is_default: false, value: null, def_value: 4, has_conflict: false },
		{ cell_id: 55, record_id: 1, is_default: false, value: null, def_value: 8, has_conflict: false },
		{ cell_id: 56, record_id: 1, is_default: false, value: null, def_value: 7, has_conflict: false },
		{ cell_id: 57, record_id: 1, is_default: true, value: 9, def_value: 9, has_conflict: false },
		{ cell_id: 58, record_id: 1, is_default: false, value: null, def_value: 5, has_conflict: false },
		{ cell_id: 59, record_id: 1, is_default: true, value: 6, def_value: 6, has_conflict: false },
		{ cell_id: 60, record_id: 1, is_default: true, value: 3, def_value: 3, has_conflict: false },
		{ cell_id: 61, record_id: 1, is_default: false, value: null, def_value: 1, has_conflict: false },
		{ cell_id: 62, record_id: 1, is_default: true, value: 2, def_value: 2, has_conflict: false },
		{ cell_id: 63, record_id: 1, is_default: false, value: null, def_value: 1, has_conflict: false },
		{ cell_id: 64, record_id: 1, is_default: false, value: null, def_value: 5, has_conflict: false },
		{ cell_id: 65, record_id: 1, is_default: true, value: 2, def_value: 2, has_conflict: false },
		{ cell_id: 66, record_id: 1, is_default: false, value: null, def_value: 8, has_conflict: false },
		{ cell_id: 67, record_id: 1, is_default: true, value: 3, def_value: 3, has_conflict: false },
		{ cell_id: 68, record_id: 1, is_default: false, value: null, def_value: 4, has_conflict: false },
		{ cell_id: 69, record_id: 1, is_default: false, value: null, def_value: 6, has_conflict: false },
		{ cell_id: 70, record_id: 1, is_default: false, value: null, def_value: 7, has_conflict: false },
		{ cell_id: 71, record_id: 1, is_default: true, value: 9, def_value: 9, has_conflict: false },
		{ cell_id: 72, record_id: 1, is_default: false, value: null, def_value: 9, has_conflict: false },
		{ cell_id: 73, record_id: 1, is_default: true, value: 6, def_value: 6, has_conflict: false },
		{ cell_id: 74, record_id: 1, is_default: false, value: null, def_value: 3, has_conflict: false },
		{ cell_id: 75, record_id: 1, is_default: false, value: null, def_value: 7, has_conflict: false },
		{ cell_id: 76, record_id: 1, is_default: false, value: null, def_value: 1, has_conflict: false },
		{ cell_id: 77, record_id: 1, is_default: true, value: 2, def_value: 2, has_conflict: false },
		{ cell_id: 78, record_id: 1, is_default: false, value: null, def_value: 4, has_conflict: false },
		{ cell_id: 79, record_id: 1, is_default: true, value: 8, def_value: 8, has_conflict: false },
		{ cell_id: 80, record_id: 1, is_default: false, value: null, def_value: 5, has_conflict: false }
	];
}

function makeSnapshotMemosArray() {
	return [
		{ memo_no: 1, cell_id: 0, record_id: 1, is_on: false },
		{ memo_no: 2, cell_id: 0, record_id: 1, is_on: false },
		{ memo_no: 3, cell_id: 0, record_id: 1, is_on: false },
		{ memo_no: 4, cell_id: 0, record_id: 1, is_on: false },
		{ memo_no: 5, cell_id: 0, record_id: 1, is_on: false },
		{ memo_no: 6, cell_id: 0, record_id: 1, is_on: false },
		{ memo_no: 7, cell_id: 0, record_id: 1, is_on: false },
		{ memo_no: 8, cell_id: 0, record_id: 1, is_on: false },
		{ memo_no: 9, cell_id: 0, record_id: 1, is_on: false }
	];
}

function makeRecordStepsArray() {
	return [
		{
			step_id: 1,
			record_id: 1,
			cell_id: 0,
			step_type: 'BEFORE',
			value: null,
			has_conflict: false
		},
		{
			step_id: 1,
			record_id: 1,
			cell_id: 0,
			step_type: 'AFTER',
			value: 3,
			has_conflict: true 
		},
		{
			step_id: 2,
			record_id: 1,
			cell_id: 0,
			step_type: 'BEFORE',
			value: 3,
			has_conflict: true
		},
		{
			step_id: 2,
			record_id: 1,
			cell_id: 0,
			step_type: 'AFTER',
			value: null,
			has_conflict: false 
		}
	];
}

function makeStepMemosArray() {
	return [
		{ memo_no: 1, step_id: 1, step_type: 'BEFORE', cell_id: 0, record_id: 1, is_on: false },
		{ memo_no: 2, step_id: 1, step_type: 'BEFORE', cell_id: 0, record_id: 1, is_on: false },
		{ memo_no: 3, step_id: 1, step_type: 'BEFORE', cell_id: 0, record_id: 1, is_on: false },
		{ memo_no: 4, step_id: 1, step_type: 'BEFORE', cell_id: 0, record_id: 1, is_on: false },
		{ memo_no: 5, step_id: 1, step_type: 'BEFORE', cell_id: 0, record_id: 1, is_on: false },
		{ memo_no: 6, step_id: 1, step_type: 'BEFORE', cell_id: 0, record_id: 1, is_on: false },
		{ memo_no: 7, step_id: 1, step_type: 'BEFORE', cell_id: 0, record_id: 1, is_on: false },
		{ memo_no: 8, step_id: 1, step_type: 'BEFORE', cell_id: 0, record_id: 1, is_on: false },
		{ memo_no: 9, step_id: 1, step_type: 'BEFORE', cell_id: 0, record_id: 1, is_on: false },
		{ memo_no: 1, step_id: 1, step_type: 'AFTER', cell_id: 0, record_id: 1, is_on: false },
		{ memo_no: 2, step_id: 1, step_type: 'AFTER', cell_id: 0, record_id: 1, is_on: false },
		{ memo_no: 3, step_id: 1, step_type: 'AFTER', cell_id: 0, record_id: 1, is_on: false },
		{ memo_no: 4, step_id: 1, step_type: 'AFTER', cell_id: 0, record_id: 1, is_on: false },
		{ memo_no: 5, step_id: 1, step_type: 'AFTER', cell_id: 0, record_id: 1, is_on: false },
		{ memo_no: 6, step_id: 1, step_type: 'AFTER', cell_id: 0, record_id: 1, is_on: false },
		{ memo_no: 7, step_id: 1, step_type: 'AFTER', cell_id: 0, record_id: 1, is_on: false },
		{ memo_no: 8, step_id: 1, step_type: 'AFTER', cell_id: 0, record_id: 1, is_on: false },
		{ memo_no: 9, step_id: 1, step_type: 'AFTER', cell_id: 0, record_id: 1, is_on: false },
		{ memo_no: 1, step_id: 2, step_type: 'BEFORE', cell_id: 0, record_id: 1, is_on: false },
		{ memo_no: 2, step_id: 2, step_type: 'BEFORE', cell_id: 0, record_id: 1, is_on: false },
		{ memo_no: 3, step_id: 2, step_type: 'BEFORE', cell_id: 0, record_id: 1, is_on: false },
		{ memo_no: 4, step_id: 2, step_type: 'BEFORE', cell_id: 0, record_id: 1, is_on: false },
		{ memo_no: 5, step_id: 2, step_type: 'BEFORE', cell_id: 0, record_id: 1, is_on: false },
		{ memo_no: 6, step_id: 2, step_type: 'BEFORE', cell_id: 0, record_id: 1, is_on: false },
		{ memo_no: 7, step_id: 2, step_type: 'BEFORE', cell_id: 0, record_id: 1, is_on: false },
		{ memo_no: 8, step_id: 2, step_type: 'BEFORE', cell_id: 0, record_id: 1, is_on: false },
		{ memo_no: 9, step_id: 2, step_type: 'BEFORE', cell_id: 0, record_id: 1, is_on: false },
		{ memo_no: 1, step_id: 2, step_type: 'AFTER', cell_id: 0, record_id: 1, is_on: false },
		{ memo_no: 2, step_id: 2, step_type: 'AFTER', cell_id: 0, record_id: 1, is_on: true },
		{ memo_no: 3, step_id: 2, step_type: 'AFTER', cell_id: 0, record_id: 1, is_on: false },
		{ memo_no: 4, step_id: 2, step_type: 'AFTER', cell_id: 0, record_id: 1, is_on: false },
		{ memo_no: 5, step_id: 2, step_type: 'AFTER', cell_id: 0, record_id: 1, is_on: false },
		{ memo_no: 6, step_id: 2, step_type: 'AFTER', cell_id: 0, record_id: 1, is_on: false },
		{ memo_no: 7, step_id: 2, step_type: 'AFTER', cell_id: 0, record_id: 1, is_on: false },
		{ memo_no: 8, step_id: 2, step_type: 'AFTER', cell_id: 0, record_id: 1, is_on: false },
		{ memo_no: 9, step_id: 2, step_type: 'AFTER', cell_id: 0, record_id: 1, is_on: false },
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

function makeSudokuFixturesWithSteps() {
	const testUsers = makeUsersArray();
	const testPuzzles = makePuzzlesArray();
	const testPuzzleCells = makePuzzleCellsArray();
	const testRecords = makeRecordsArray();
	const testSnapshots = makeRecordSnapshotsArray();
	const testSnapshotMemos = makeSnapshotMemosArray();
	const testSteps = makeRecordStepsArray();
	const testStepMemos = makeStepMemosArray();

	// modifies to include initial steps
	testRecords[0].num_empty_cells = 52;
	testRecords[0].num_wrong_cells = 1;
	testRecords[0].step_id = 1;
	testRecords[0].max_step_id = 2;
	testSnapshots[0].value = 3;
	testSnapshots[0].has_conflict = true;

	return {
		testUsers, 
		testPuzzles,
		testPuzzleCells,
		testRecords,
		testSnapshots,
		testSnapshotMemos,
		testSteps,
		testStepMemos
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
			step_memos
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

function seedSudokuTables(
	db, 
	users, 
	puzzles, 
	puzzleCells, 
	records, 
	snapshots, 
	snapshotMemos, 
	steps, 
	stepMemos
) {
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
		await trx.into('snapshot_memos').insert(snapshotMemos);
		await trx.into('record_steps').insert(steps);
		await trx.into('step_memos').insert(stepMemos);
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
		puzzle: expectPuzzleCells
	};
}

function makeExpectedRecords(records) {
	const solved = [], not_solved = [];
	records.map(r => {
		delete r.date_created;
		if (r.num_empty_cells === 0 && r.num_wrong_cells === 0) { solved.push(r); }
		else { not_solved.push(r); }
	});
	return ({ solved, not_solved });
}

function makeExpectedRecord(record, snapshot, memos) {
	const expectedSnapshot = snapshot.map(sc => ({
		cell_id: sc.cell_id,
		is_default: sc.is_default,
		value: sc.value,
		def_value: sc.def_value,
		has_conflict: sc.has_conflict,
		memos: memos
			.filter(m => m.cell_id === sc.cell_id)
			.map(m => m.is_on),
	}));
	delete record.date_created;
	return {
		record,
		snapshot: expectedSnapshot
	}
}

function makeTestSteps() {
	const recordId = 1;
	const duration = 15;
	const steps = [
		{
			cell_id: 0,
			record_id: recordId,
			step_type: 'BEFORE',
			value: null,
			has_conflict: false,
			memos: [ false, false, false, false, false, false, false, false, false ]
		},
		{
			cell_id: 0,
			record_id: recordId,
			step_type: 'AFTER',
			value: 3,
			has_conflict: true,
			memos: [ false, false, false, false, false, false, false, false, false ]
		}
	];
	return { recordId, duration, steps };
}

module.exports = {
	makeUsersArray,
	makePuzzlesArray,
	makePuzzleCellsArray,
	makeRecordsArray,
	makeRecordSnapshotsArray,
	makeRecordStepsArray,
	makeStepMemosArray,
	makeSudokuFixtures,
	makeSudokuFixturesWithSteps,
	cleanTables,
	seedUsers,
	seedSudokuTables,
	makeAuthHeader,
	makeExpectedPuzzle,
	makeExpectedRecords,
	makeExpectedRecord,
	makeTestSteps
};