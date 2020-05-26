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
			'id AS record_id',
			'puzzle_id',
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

	getRecordById(db, record_id) {
		return this.getAllRecords(db)
			.where('id', record_id)
			.first();
	},

	getSnapshotById(db, record_id) {
		const resSnapshot = db
			.from('record_snapshots')
			.select(
				'cell_id',
				'is_default',
				'value'
			)
			.where({ record_id });
		const resNotes = this.getSnapshotNotesById(db, record_id);
		return Promise.all([resSnapshot, resNotes]);
	},

	getSnapshotNotesById(db, record_id) {
		return db
			.from('snapshot_notes')
			.select(
				'cell_id',
				'note_num'
			)
			.where({ record_id });
	},

	insertRecord(db, user_id, puzzle_id) {
		const record = { user_id, puzzle_id };
		const resRecord = db
			.into('records')
			.insert(record)
			.returning('*')
			.then(([record]) => record);

		const resPuzzle = PuzzlesService.getPuzzleCellsById(db, puzzle_id);

		const resSnapshot = Promise.all([resRecord, resPuzzle])
			.then(([resRecord, resPuzzle]) => {
				const snapshot = resPuzzle.map(pc => {
					return {
						record_id: resRecord.id,
						cell_id: pc.cell_id,
						is_default: pc.is_default,
						value: pc.value
					}
				});
				return this.insertSnapshot(db, snapshot);
			});

		return Promise.all([resRecord, resSnapshot]);
	},

	insertSnapshot(db, snapshot) {
		return db
			.into('record_snapshots')
			.insert(snapshot)
			.returning('*')
			.then(snapshot => snapshot);
	},

	serializeRecords(records) {
		const solved = records.filter(r => r.is_solved);
		const not_solved = records.filter(r => !r.is_solved);
		return { solved, not_solved };
	},

	serializeSnapshot(snapshot, notes) {
		return snapshot.map(sc => {
			const cellNotes = notes
				.filter(n => n.cell_id === sc.cell_id)
				.map(n => {
					return { num: n.note_num };
				});
			if (cellNotes[0]) { sc['notes'] = cellNotes; }
			return sc;
		});
	}
}

module.exports = RecordsService;