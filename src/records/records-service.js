const PuzzlesService = require('../puzzles/puzzles-service');

const RecordsService = {
	validatePuzzleId(puzzle_id) {
		if (!puzzle_id) {
			return `Missing 'puzzle_id' in request body`;
		}
		if (!Number(puzzle_id)) {
			return `'puzzle_id' must be a valid number`;
		}
		return null;
	},

	validateSteps(steps) {
		if (!Array.isArray(steps) || steps.length !== 2) {
			return 'Missing before or / and after steps in request body';
		}
		
		const requiredFields = ['cell_id', 'step_type', 'has_conflict', 'memos'];
		for (const s of steps) {
			for (const field of requiredFields) {
				if (typeof s[field] === 'undefined') {
					return `Missing '${field}' of steps in request body`;
				}
			}

			if (s.cell_id !== 0 && (!Number(s.cell_id) || s.cell_id < 0 || s.cell_id > 80)) {
				return `'cell_id' must be a valid number between 0 to 80`;
			}
			if (!['BEFORE', 'AFTER'].includes(s.step_type)) {
				return `'step_type' must be either 'BEFORE' or 'AFTER'`;
			}
			if (s.value === 0 || (s.value && (!Number(s.value) || s.value < 1 || s.value > 9))) {
				return `'value' must be a valid digit between 1 to 9 or null`;
			}
			if (typeof s.has_conflict !== 'boolean') {
				return `'has_conflict' must be a boolean`;
			}
			if (!Array.isArray(s.memos) || s.memos.length !== 9) {
				return `'memos' must be an array of booleans with a length of 9`;
			}
			for (const m of s.memos) {
				if (typeof m !== 'boolean') {
					return `'memos' must be an array of booleans with a length of 9`;
				}
			}
		}
		return null;
	},

	validateEditType(record, edit_type) {
		if (!edit_type) {
			return `Missing 'edit_type' in request body`;
		}
		if (!['UNDO', 'REDO'].includes(edit_type)) {
			return `'edit_type' must be either 'UNDO' or 'REDO'`;
		}
		if (edit_type === 'UNDO' && !record.step_id) {
			return `unable to perform undo operation`;
		}
		if (edit_type === 'REDO' && record.step_id === record.max_step_id) {
			return `unable to perform redo operation`;
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
			'step_id',
			'max_step_id'
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
				const snapshot = this.initializeSnapshot(resRecord.id, resPuzzle);
				return this.insertSnapshot(db, snapshot);
			});

		const resMemos = resRecord
			.then(resRecord => {
				const memos = this.initializeSnapshotMemos(resRecord.id);
				return this.insertSnapshotMemos(db, memos);
			})

		return Promise.all([resRecord, resSnapshot, resMemos]);
	},

	updateRecord(db, record_id, updateCols) {
		return db
			.from('records')
			.update(updateCols)
			.where({ id: record_id })
			.returning('*')
			.then(([record]) => record);
	},

	getSnapshotByRecord(db, record_id) {
		const resSnapshot = db
			.from('record_snapshots')
			.select('*')
			.where({ record_id })
			.orderBy('cell_id');
		const resMemos = this.getSnapshotMemosByRecord(db, record_id);
		return Promise.all([resSnapshot, resMemos]);
	},

	insertSnapshot(db, snapshot) {
		return db
			.into('record_snapshots')
			.insert(snapshot)
			.returning('*')
			.orderBy('cell_id')
			.then(snapshot => snapshot);
	},

	updateSnapshot(db, cells) {
		return db
			.transaction(trx => {
				const queries = [];
				cells.forEach(c => {
					const query = db
						.from('record_snapshots')
						.update({
							value: c.value,
							has_conflict: c.has_conflict
						})
						.where({
							record_id: c.record_id,
							cell_id: c.cell_id
						})
						.transacting(trx)
						.returning('*')
						.then(([snapshotCell]) => snapshotCell);
					queries.push(query);
				})
				
				Promise.all(queries)
					.then(trx.commit)
					.catch(trx.rollback);
			});
	},


	getSnapshotMemosByRecord(db, record_id) {
		return db
			.from('snapshot_memos')
			.select('*')
			.where({ record_id })
			.orderBy([
				{ column: 'cell_id' },
				{ column: 'memo_no' }
			]);
	},

	insertSnapshotMemos(db, memos) {
		return db
			.into('snapshot_memos')
			.insert(memos)
			.returning('*')
			.orderBy([
				{ column: 'cell_id' },
				{ column: 'memo_no' }
			]);
	},

	updateSnapshotMemos(db, memos) {
		return db
			.transaction(trx => {
				const queries = [];
				memos.forEach(m => {
					const query = db
						.from('snapshot_memos')
						.update({ is_on: m.is_on })
						.where({
							memo_no: m.memo_no,
							record_id: m.record_id,
							cell_id: m.cell_id
						})
						.transacting(trx)
						.returning('*')
						.orderBy('memo_no')
						.then(([memo]) => memo);
					queries.push(query);
				})
				
				Promise.all(queries)
					.then(trx.commit)
					.catch(trx.rollback);
			});
	},

	getRecordSteps(db, record_id, step_id) {
		return db
			.from('record_steps')
			.select('*')
			.where({ record_id, step_id })
			.orderBy('step_type');
	},

	deleteRecordSteps(db, record_id, step_id) {
		return db
			.from('record_steps')
			.delete()
			.where({ record_id })
			.andWhere('step_id', '>=', step_id);
	},

	insertRecordSteps(db, record, steps) {
		return this.getSnapshotByRecord(db, record.id)
			.then(snapshot => {
				const stepsObj = this.deserializeSteps(
					(record.step_id) ? record.step_id + 1 : 1, 
					steps
				);
				const cellsToUpdate = [];
				stepsObj.steps[1].has_conflict = this.validate(
					record, 
					snapshot[0], 
					stepsObj.steps[1], 
					cellsToUpdate
				);

				const resCell = this.deleteRecordSteps(db, record.id, stepsObj.step_id)
					.then(() => 
						db
							.into('record_steps')
							.insert(stepsObj.steps)
							.returning('*')
							.orderBy('step_type')
					)
					.then(steps => this.updateSnapshot(db, [steps[1]]))
					.then(([cell]) => cell);

				const resMemos = this.deleteStepMemos(db, record.id, stepsObj.step_id)
					.then(() => this.insertStepMemos(db, stepsObj.memos))
					.then(memos => {
						memos = memos.filter(m => m.step_type === 'AFTER');
						return this.updateSnapshotMemos(db, memos);
					});

				const resUpdatedCells = this.updateSnapshot(db, cellsToUpdate);

				const resRecord = this.updateRecord(db, record.id, {
					step_id: stepsObj.steps[1].step_id,
					max_step_id: stepsObj.steps[1].step_id,
					num_empty_cells: record.num_empty_cells,
					num_wrong_cells: record.num_wrong_cells
				});

				return Promise.all([resRecord, resCell, resMemos, resUpdatedCells]);
			});
	},

	updateRecordSteps(db, record, edit_type) {
		const idx = (edit_type === 'UNDO') ? 0 : 1;
		const step_type = (edit_type === 'UNDO') ? 'BEFORE' : 'AFTER';
		const step_id = (edit_type === 'UNDO')
			? record.step_id
			: record.step_id + 1;
		
		const resSnapshot = this.getSnapshotByRecord(db, record.id);
		const resSteps = this.getRecordSteps(db, record.id, step_id);

		return Promise.all([resSnapshot, resSteps])
			.then(([snapshot, steps]) => {
				const cellsToUpdate = [];
				steps[idx].has_conflict = this.validate(
					record, 
					snapshot[0], 
					steps[idx], 
					cellsToUpdate
				);

				const resCell = this.updateSnapshot(db, [steps[idx]])
					.then(([cell]) => cell);

				const resMemos = this.getStepMemos(db, record.id, step_id)
					.then(memos => {
						memos = memos.filter(m => m.step_type === step_type);
						return this.updateSnapshotMemos(db, memos);
					});

				const resUpdatedCells = this.updateSnapshot(db, cellsToUpdate);

				const updateStepId = (edit_type === 'UNDO') 
				? (record.step_id === 1) ? null : record.step_id - 1
				: record.step_id + 1;

				const resRecord = this.updateRecord(db, record.id, {
					step_id: updateStepId,
					num_empty_cells: record.num_empty_cells,
					num_wrong_cells: record.num_wrong_cells
				});

				return Promise.all([resRecord, resCell, resMemos, resUpdatedCells]);
			});
	},

	getStepMemos(db, record_id, step_id) {
		return db
			.from('step_memos')
			.select('*')
			.where({ record_id, step_id })
			.orderBy([
				{ column: 'step_type' },
				{ column: 'memo_no' }
			]);
	},

	insertStepMemos(db, memos) {
		return db
			.into('step_memos')
			.insert(memos)
			.returning('*')
			.orderBy([
				{ column: 'step_type' },
				{ column: 'memo_no' }
			]);
	},

	deleteStepMemos(db, record_id, step_id) {
		return db
			.from('step_memos')
			.delete()
			.where({ record_id })
			.andWhere('step_id', '>=', step_id);
	},

	validate(record, snapshot, cell, cellsToUpdate, exclude) {
		// updates the number of empty cells
		const oldValue = snapshot[cell.cell_id].value;
		if (!oldValue && cell.value) record.num_empty_cells -= 1;
		else if (oldValue && !cell.value) record.num_empty_cells += 1;

		// resets the cell conflict status and the number of wrong cells
		if (snapshot[cell.cell_id].has_conflict) {
			console.log('1 ' + cell.cell_id);
			
			record.num_wrong_cells -= 1;
		}
		cell.has_conflict = false;

		// validates all potential conflict cells
		this.getCellsToValidateArr(cell.cell_id, snapshot).forEach(sc => {
			if (sc.cell_id === cell.cell_id || (exclude && sc.cell_id === exclude.cell_id)) {
				return;
			}
			if (cell.value && cell.value === sc.value) {	// has conflict
				if (!sc.is_default && !sc.has_conflict) {
					sc.has_conflict = true;
					cellsToUpdate.push(sc);
					console.log('2 ' + cell.cell_id);

					record.num_wrong_cells += 1;
				}
				if (!cell.has_conflict) {
					console.log('3 ' + cell.cell_id);

					record.num_wrong_cells += 1;
				}
				cell.has_conflict = true;
			}
			else if (sc.has_conflict) {
				// if a cell had conflict with the given cell but now has no conflict,
				// validates if it has conflict with other cells
				if (!this.validate(record, snapshot, sc, cellsToUpdate, cell)) {
					cellsToUpdate.push(sc);
				}
			}
		})
		return cell.has_conflict;
	},

	/* Cells to validate are: 
	 *   1. Cells in the same row as the given cell
	 *   2. Cells in the same column as the given cell
	 *   3. Cells in the same 3 * 3 block as the given cell
	 */
	getCellsToValidateArr(cell_id, snapshot) {
		const row = Math.floor(cell_id / 9);
		const col = cell_id % 9;
		const arr = [];

		[...Array(9)].map((_, i) => {
			arr.push(snapshot[row * 9 + i]);
			arr.push(snapshot[i * 9 + col]);
			const r = Math.floor(row / 3) * 3 + Math.floor(i / 3);
			const c = Math.floor(col / 3) * 3 + i % 3;
			arr.push(snapshot[r * 9 + c]);
			return null;
		})

		return arr;
	},

	serializeRecords(records) {
		const solved = records.filter(r => r.is_solved);
		const not_solved = records.filter(r => !r.is_solved);
		return { solved, not_solved };
	},

	serializeSnapshotCells(snapshot, memos) {
		return snapshot.map(sc => this.serializeSnapshotCell(sc, memos));
	},

	serializeSnapshotCell(cell, memos) {
		memos = memos
			.filter(m => m.cell_id === cell.cell_id)
			.map(m => m.is_on);
		delete cell.record_id;
		return { memos, ...cell };
	},

	initializeSnapshot(record_id, puzzle) {
		return puzzle.map(pc => ({
			record_id,
			cell_id: pc.cell_id,
			is_default: pc.is_default,
			def_value: pc.value,
			value: pc.is_default ? pc.value : null,
			has_conflict: false
		}));
	},

	initializeSnapshotMemos(record_id) {
		const memos = [];
		for (let i = 0; i < 81; i++) {
			for (let j = 1; j <= 9; j++) {
				memos.push({
					memo_no: j,
					cell_id: i,
					record_id
				});
			}
		}
		return memos;
	},

	serializeStep(step_type, step, memos) {
		return {
			cell_id: step.cell_id,
			value: step.value,
			has_conflict: step.has_conflict,
			memos: memos
				.filter(m => m.step_type === step_type)
				.map(m => m.is_on)
		};
	},

	deserializeSteps(step_id, steps) {
		const memos = [];
		steps.forEach(s => {
			s.memos.forEach((m, i) => {
				memos.push({
					memo_no: i + 1,
					step_id,
					record_id: s.record_id,
					cell_id: s.cell_id,
					step_type: s.step_type,
					is_on: m
				});
			})
		})

		steps = steps.map(s => ({
				step_id,
				record_id: s.record_id,
				cell_id: s.cell_id,
				step_type: s.step_type,
				value: s.value,
				has_conflict: s.has_conflict
		}));

		return { step_id, steps, memos };
	}
}

module.exports = RecordsService;