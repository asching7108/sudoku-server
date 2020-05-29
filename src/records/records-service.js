const PuzzlesService = require('../puzzles/puzzles-service');

const RecordsService = {
	validatePuzzleId(puzzle_id) {
		if (!puzzle_id) {
			return `Missing 'puzzle_id' in request body`;
		}
		if (!Number(puzzle_id)) {
			return 'puzzle_id must be a valid number';
		}
		return null;
	},

	getAllRecords(db) {
		return db
		.from('records')
		.select(
			'id',
			'puzzle_id',
			'user_id',
			'num_empty_cells',
			'num_wrong_cells',
			'is_solved',
			'date_solved',
			'step_id'
		)
		.orderBy('date_solved', 'desc');
	},

	getRecordsByUser(db, user_id) {
		return this.getAllRecords(db)
			.where({ user_id });
	},

	getRecordById(db, id) {
		return this.getAllRecords(db)
			.where({ id })
			.first();
	},

	getSnapshotByRecord(db, record_id) {
		const resSnapshot = db
			.from('record_snapshots')
			.select(
				'cell_id',
				'is_default',
				'def_value',
				'value',
				'has_conflict'
			)
			.where({ record_id })
			.orderBy('cell_id');
		const resMemos = this.getSnapshotMemosByRecord(db, record_id);
		return Promise.all([resSnapshot, resMemos]);
	},

	getSnapshotMemosByRecord(db, record_id) {
		return db
			.from('snapshot_memos')
			.select(
				'memo_no',
				'cell_id',
				'is_on'
			)
			.where({ record_id })
			.orderBy('cell_id', 'memo_no');
	},

	insertRecord(db, user_id, puzzle_id) {
		const resRecord = PuzzlesService.getPuzzleById(db, puzzle_id)
			.then(puzzle => {
				const record = { 
					user_id,
					puzzle_id,
					num_empty_cells: puzzle.num_empty_cells
				};
				return db
					.into('records')
					.insert(record)
					.returning('*')
					.then(([record]) => record);
			});

		const resPuzzle = PuzzlesService.getPuzzleCellsByPuzzle(db, puzzle_id);

		const resSnapshot = Promise.all([resRecord, resPuzzle])
			.then(([resRecord, resPuzzle]) => {
				const snapshot = resPuzzle.map(pc => {
					return {
						record_id: resRecord.id,
						cell_id: pc.cell_id,
						is_default: pc.is_default,
						def_value: pc.value,
						value: pc.is_default ? pc.value : null,
						has_conflict: false
					}
				});
				return this.insertSnapshot(db, snapshot);
			});

		const resMemos = resRecord
			.then(resRecord => {
				const memos = [];
				for (let i = 0; i < 81; i++) {
					for (let j = 1; j <= 9; j++) {
						memos.push({
							memo_no: j,
							cell_id: i,
							record_id: resRecord.id
						});
					}
				}
				return this.insertSnapshotMemos(db, memos);
			})

		return Promise.all([resRecord, resSnapshot, resMemos]);
	},

	insertSnapshot(db, snapshot) {
		return db
			.into('record_snapshots')
			.insert(snapshot)
			.returning('*')
			.then(snapshot => snapshot);
	},

	insertSnapshotMemos(db, memos) {
		return db
			.into('snapshot_memos')
			.insert(memos)
			.returning('*')
			.then(memos => memos);
	},

	serializeRecords(records) {
		const solved = records.filter(r => r.is_solved);
		const not_solved = records.filter(r => !r.is_solved);
		return { solved, not_solved };
	},

	serializeSnapshot(snapshot, memos) {
		return snapshot.map((sc, i) => {
			delete sc.record_id;
			delete sc.cell_id;
			const memoArr = memos
				.filter(m => m.cell_id === i)
				.map(m => m.is_on);
			return { memos: memoArr, ...sc };
		});
	}
}

module.exports = RecordsService;