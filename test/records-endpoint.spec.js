const knex = require('knex');
const app = require('../src/App');
const helpers = require('./test-helpers');

describe('Records Endpoints', () => {
	let db;

	const {
		testUsers,
		testPuzzles,
		testPuzzleCells,
		testRecords,
		testSnapshots,
		testSnapshotMemos
	} = helpers.makeSudokuFixtures();

	const testUser = testUsers[1];

	before ('make knex instance', () => {
		db = knex({
			client: 'pg',
			connection: process.env.TEST_DATABASE_URL
		});
		app.set('db', db);
	})

	after('disconnects from db', () => db.destroy())

	before('cleanup', () => helpers.cleanTables(db))

	afterEach('cleanup', () => helpers.cleanTables(db))

	describe('GET /api/records', () => {
		context(`Given no records`, () => {
			beforeEach('inserts users', () => helpers.seedUsers(db, testUsers))

			it('responds with 200 and empty lists', () => {
				return supertest(app)
					.get('/api/records')
					.set('Authorization', helpers.makeAuthHeader(testUser))
					.expect(200, { solved: [], not_solved: [] });
			})
		})

		context('Given there are records in the database', () => {
			beforeEach('inserts records', () => 
				helpers.seedSudokuTables(
					db,
					testUsers,
					testPuzzles,
					testPuzzleCells,
					testRecords
				)
			)

			it('responds with 200 and all of the records of the given user_id', () => {
				const expectedRecords = helpers.makeExpectedRecords(
					testRecords.filter(r => r.user_id === testUser.id)
				);
				return supertest(app)
					.get(`/api/records`)
					.set('Authorization', helpers.makeAuthHeader(testUser))
					.expect(200, expectedRecords);
			})
		})
	})

	describe('POST /api/records', () => {
		beforeEach('inserts puzzles', () => 
			helpers.seedSudokuTables(
				db,
				testUsers,
				testPuzzles,
				testPuzzleCells
			)
		)

		it(`responds with 400 when missing 'puzzle_id' in request body`, () => {
			return supertest(app)
				.post('/api/records')
				.set('Authorization', helpers.makeAuthHeader(testUser))
				.expect(400, { error: `Missing 'puzzle_id' in request body` });
		})

		it('responds with 400 when puzzle_id is not a valid number', () => {
			const puzzleId = 'not-valid';
			return supertest(app)
				.post('/api/records')
				.set('Authorization', helpers.makeAuthHeader(testUser))
				.send({ puzzle_id: puzzleId })
				.expect(400, { error: `'puzzle_id' must be a valid number` });
		})

		it('responds with 400 when puzzle_id', () => {
			const puzzleId = 10;
			return supertest(app)
				.post('/api/records')
				.set('Authorization', helpers.makeAuthHeader(testUser))
				.send({ puzzle_id: puzzleId })
				.expect(400, { error: `Puzzle doesn't exist` });
		})

		it('creates a record, responding with 201, record_id and the snapshot', () => {
			const puzzleId = 1;
			const puzzle = helpers.makePuzzleCellsArray()
				.filter(pc => pc.puzzle_id = puzzleId);

			const expectedRecord = {
				puzzle_id: puzzleId,
				user_id: testUser.id,
				num_empty_cells: testPuzzles[puzzleId - 1].num_empty_cells,
				num_wrong_cells: 0,
				step_id: null,
				max_step_id: null,
				duration: 0
			};

			const expectedSnapshot = puzzle.map(pc => ({
				memos: [false, false, false, false, false, false, false, false, false],
				is_default: pc.is_default,
				def_value: pc.value,
				value: (pc.is_default) ? pc.value : null,
				has_conflict: false
			}));

			return supertest(app)
				.post('/api/records')
				.set('Authorization', helpers.makeAuthHeader(testUser))
				.send({ puzzle_id: puzzleId })
				.expect(201)
				.expect(res => {
					expect(res.body.record).to.have.property('id');
					expect(res.body.record.puzzle_id).to.eql(expectedRecord.puzzle_id);
					expect(res.body.record.user_id).to.eql(expectedRecord.user_id);
					expect(res.body.record.num_empty_cells).to.eql(expectedRecord.num_empty_cells);
					expect(res.body.record.num_wrong_cells).to.eql(expectedRecord.num_wrong_cells);
					expect(res.body.record.step_id).to.eql(expectedRecord.step_id);
					expect(res.body.record.max_step_id).to.eql(expectedRecord.max_step_id);
					expect(res.body.record.duration).to.eql(expectedRecord.duration);
					const expectDate = new Date().toLocaleString();
					const actualDate = new Date(res.body.record.date_modified).toLocaleString();
					expect(actualDate).to.eql(expectDate);
					expect(res.headers.location).to.eql(`/api/records/${res.body.record.id}`);
					res.body.snapshot.forEach((sc, i) => {
						expect(sc.is_default).to.eql(expectedSnapshot[i].is_default);
						expect(sc.def_value).to.eql(expectedSnapshot[i].def_value);
						expect(sc.value).to.eql(expectedSnapshot[i].value);
						expect(sc.has_conflict).to.eql(expectedSnapshot[i].has_conflict);
						sc.memos.forEach((m, j) => {
							expect(m).to.eql(expectedSnapshot[i].memos[j]);
						})
					})
				})
				.expect(res => 
					db
						.from('records')
						.select('*')
						.where('id', res.body.record.id)
						.first()
						.then(row => {
							expect(row.puzzle_id).to.eql(expectedRecord.puzzle_id);
							expect(row.user_id).to.eql(expectedRecord.user_id);
							expect(row.num_empty_cells).to.eql(expectedRecord.num_empty_cells);
							expect(row.num_wrong_cells).to.eql(expectedRecord.num_wrong_cells);
							expect(row.step_id).to.eql(expectedRecord.step_id);
							expect(row.max_step_id).to.eql(expectedRecord.max_step_id);
							expect(row.duration).to.eql(expectedRecord.duration);
							const expectDate = new Date().toLocaleString();
							const actualDateCreated = new Date(row.date_created).toLocaleString();
							const actualDateModified = new Date(row.date_modified).toLocaleString();
							expect(actualDateCreated).to.eql(expectDate);
							expect(actualDateModified).to.eql(expectDate);
						})
				)
				.expect(res => 
					db
						.from('record_snapshots')
						.select('*')
						.where('record_id', res.body.record.id)
						.then(rows => {
							rows.forEach((row, i) => {
								expect(row).to.have.property('record_id');
								expect(row.cell_id).to.eql(i);
								expect(row.is_default).to.eql(expectedSnapshot[i].is_default);
								expect(row.def_value).to.eql(expectedSnapshot[i].def_value);
								expect(row.value).to.eql(expectedSnapshot[i].value);
								expect(row.has_conflict).to.eql(expectedSnapshot[i].has_conflict);
							})
						})
				)
				.expect(res => 
					db
						.from('snapshot_memos')
						.select('*')
						.where('record_id', res.body.record.id)
						.orderBy('cell_id', 'memo_no')
						.then(rows => {
							rows.forEach((row, i) => {
								expect(row.cell_id).to.eql(Math.floor(i / 9));
								expect(row.memo_no).to.eql(i % 9 + 1);
								expect(row.is_on).to.eql(false);
							})
						})
				);
		})
	})	

	describe('GET /api/records/:record_id', () => {
		context(`Given no records`, () => {
			beforeEach('inserts users', () => helpers.seedUsers(db, testUsers))

			it(`responds with 404 when record doesn't exist`, () => {
				const recordId = 123456;
				return supertest(app)
					.get(`/api/records/${recordId}`)
					.set('Authorization', helpers.makeAuthHeader(testUser))
					.expect(404, { error: `Record doesn't exist` });
			})
		})

		context('Given there are records in the database', () => {
			beforeEach('insert records', () => 
				helpers.seedSudokuTables(
					db,
					testUsers,
					testPuzzles,
					testPuzzleCells,
					testRecords,
					testSnapshots,
					testSnapshotMemos
				)
			)

			it('responds with 404 when record id is not valid', () => {
				const recordId = 'not-valid';
				return supertest(app)
					.get(`/api/records/${recordId}`)
					.set('Authorization', helpers.makeAuthHeader(testUser))
					.expect(404, { error: 'Invalid record id' });
			})

			it('responds with 200 and the specified record', () => {
				const recordId = 1;
				const expectedRecord = helpers.makeExpectedRecord(
					testRecords[recordId - 1],
					testSnapshots,
					testSnapshotMemos.filter(n => n.record_id === recordId)
				);
				
				return supertest(app)
					.get(`/api/records/${recordId}`)
					.set('Authorization', helpers.makeAuthHeader(testUser))
					.expect(200, expectedRecord);
			})
		})
	})

	describe('PATCH /api/records/:record_id', () => {
		context(`Given no records`, () => {
			beforeEach('inserts users', () => helpers.seedUsers(db, testUsers))

			it(`responds with 404 when record doesn't exist`, () => {
				const recordId = 123456;
				return supertest(app)
					.patch(`/api/records/${recordId}`)
					.set('Authorization', helpers.makeAuthHeader(testUser))
					.expect(404, { error: `Record doesn't exist` });
			})
		})

		context('Given there are records in the database', () => {
			beforeEach('insert records', () => 
				helpers.seedSudokuTables(
					db,
					testUsers,
					testPuzzles,
					testPuzzleCells,
					testRecords,
					testSnapshots,
					testSnapshotMemos
				)
			)

			it('responds with 404 when record id is not valid', () => {
				const recordId = 'not-valid';
				return supertest(app)
					.patch(`/api/records/${recordId}`)
					.set('Authorization', helpers.makeAuthHeader(testUser))
					.expect(404, { error: 'Invalid record id' });
			})

			it(`responds with 400 when the 'updateCols' is missing`, () => {
				const recordId = 1;
				return supertest(app)
					.patch(`/api/records/${recordId}`)
					.set('Authorization', helpers.makeAuthHeader(testUser))
					.expect(400, { error: `Missing 'updateCols' in request body` });
			})
	
			it(`responds with 400 when the 'updateCols' is not an object`, () => {
				const recordId = 1;
				const updateCols = 'not-valid';
				return supertest(app)
					.patch(`/api/records/${recordId}`)
					.set('Authorization', helpers.makeAuthHeader(testUser))
					.send({ updateCols })
					.expect(400, { error: `'updateCols' must be an object` });
			})

			it(`responds with 400 when the 'updateCols' contains invalid columns`, () => {
				const recordId = 1;
				const updateCols = { wrongCol: 'anything' };
				return supertest(app)
					.patch(`/api/records/${recordId}`)
					.set('Authorization', helpers.makeAuthHeader(testUser))
					.send({ updateCols })
					.expect(400, { error: `'wrongCol' in updateCols is not a valid column of records` });
			})

			it(`responds with 400 when the 'updateCols' contains no valid column`, () => {
				const recordId = 1;
				const updateCols = {};
				return supertest(app)
					.patch(`/api/records/${recordId}`)
					.set('Authorization', helpers.makeAuthHeader(testUser))
					.send({ updateCols })
					.expect(400, { error: `'updateCols' must contain at least one column to update` });
			})

			it('updates the record, responding with 200 and the updated record', () => {
				const recordId = 1;
				const updateCols = { duration: 16 };
				const expectedRecord = helpers.makeExpectedRecord(
					testRecords[recordId - 1],
					testSnapshots,
					testSnapshotMemos.filter(n => n.record_id === recordId)
				);
				expectedRecord.duration = 16;
				
				return supertest(app)
					.patch(`/api/records/${recordId}`)
					.set('Authorization', helpers.makeAuthHeader(testUser))
					.send({ updateCols })
					.expect(200)
					.expect(res => {
						expect(res.body.record.id).to.eql(recordId);
						expect(res.body.record.duration).to.eql(expectedRecord.duration);
						const expectDate = new Date().toLocaleString();
						const actualDate = new Date(res.body.record.date_modified).toLocaleString();
						expect(actualDate).to.eql(expectDate);
					})
					.expect(res => 
						db
							.from('records')
							.select('*')
							.where('id', recordId)
							.first()
							.then(row => {
								expect(row.duration).to.eql(expectedRecord.duration);
								const expectDate = new Date().toLocaleString();
								const actualDate = new Date(row.date_modified).toLocaleString();
								expect(actualDate).to.eql(expectDate);
							})
					)
			})
		})
	})

	describe('POST /api/records/:record_id/steps', () => {
		context(`Given no records`, () => {
			beforeEach('inserts users', () => helpers.seedUsers(db, testUsers))

			it(`responds with 404 when record doesn't exist`, () => {
				const recordId = 123456;
				return supertest(app)
					.post(`/api/records/${recordId}/steps`)
					.set('Authorization', helpers.makeAuthHeader(testUser))
					.expect(404, { error: `Record doesn't exist` });
			})
		})

		context('Given there are records in the database', () => {
			beforeEach('inserts puzzles and initializes a record', async () => {
				await helpers.seedSudokuTables(
					db,
					testUsers,
					testPuzzles,
					testPuzzleCells,
					testRecords,
					testSnapshots,
					testSnapshotMemos
				);
			})

			it('responds with 404 when record id is not valid', () => {
				const recordId = 'not-valid';
				return supertest(app)
					.post(`/api/records/${recordId}/steps`)
					.set('Authorization', helpers.makeAuthHeader(testUser))
					.expect(404, { error: 'Invalid record id' });
			})
	
			it(`responds with 400 when the 'duration' is missing`, () => {
				const recordId = 1;
				return supertest(app)
					.post(`/api/records/${recordId}/steps`)
					.set('Authorization', helpers.makeAuthHeader(testUser))
					.expect(400, { error: `Missing 'duration' in request body` });
			})
	
			it(`responds with 400 when the 'duration' is not valid`, () => {
				const recordId = 1;
				const duration = 'not-valid';
				return supertest(app)
					.patch(`/api/records/${recordId}/steps`)
					.set('Authorization', helpers.makeAuthHeader(testUser))
					.send({ duration })
					.expect(400, { error: `'duration' must be a positive number` });
			})
	
			it(`responds with 400 when the 'steps' is missing`, () => {
				const recordId = 1;
				const duration = 15;
				return supertest(app)
					.post(`/api/records/${recordId}/steps`)
					.set('Authorization', helpers.makeAuthHeader(testUser))
					.send({ duration })
					.expect(400, { error: `Missing before or / and after steps in request body` });
			})
	
			it(`responds with 400 when missing 'steps' is not an array of length 2`, () => {
				const recordId = 1;
				const duration = 15;
				const steps = [];
				return supertest(app)
					.post(`/api/records/${recordId}/steps`)
					.set('Authorization', helpers.makeAuthHeader(testUser))
					.send({ duration, steps })
					.expect(400, { error: `Missing before or / and after steps in request body` });
			})
	
			const requiredFields = ['cell_id', 'step_type', 'has_conflict', 'memos'];
	
			[...Array(2)].forEach((_, i) => {
				requiredFields.forEach(field => {
					it(`responds with 400 when the '${field}' is missing`, () => {
						const test = helpers.makeTestSteps();
						delete test.steps[i][field];
						return supertest(app)
							.post(`/api/records/${test.recordId}/steps`)
							.set('Authorization', helpers.makeAuthHeader(testUser))
							.send({ duration: test.duration, steps: test.steps })
							.expect(400, { error: `Missing '${field}' of steps in request body` });
					})
				})
	
				it(`responds with 400 when 'cell_id' of steps is not valid`, () => {
					const test = helpers.makeTestSteps();
					test.steps[i].cell_id = 'not-valid';
					return supertest(app)
						.post(`/api/records/${test.recordId}/steps`)
						.set('Authorization', helpers.makeAuthHeader(testUser))
						.send({ duration: test.duration, steps: test.steps })
						.expect(400, { error: `'cell_id' must be a valid number between 0 to 80` });
				})
	
				it(`responds with 400 when 'step_type' of steps is not valid`, () => {
					const test = helpers.makeTestSteps();
					test.steps[i].step_type = 'not-valid';
					return supertest(app)
						.post(`/api/records/${test.recordId}/steps`)
						.set('Authorization', helpers.makeAuthHeader(testUser))
						.send({ duration: test.duration, steps: test.steps })
						.expect(400, { error: `'step_type' must be either 'BEFORE' or 'AFTER'` });
				})
	
				it(`responds with 400 when 'value' of steps is not valid`, () => {
					const test = helpers.makeTestSteps();
					test.steps[i].value = 0;
					return supertest(app)
						.post(`/api/records/${test.recordId}/steps`)
						.set('Authorization', helpers.makeAuthHeader(testUser))
						.send({ duration: test.duration, steps: test.steps })
						.expect(400, { error: `'value' must be a valid digit between 1 to 9 or null` });
				})
	
				it(`responds with 400 when 'has_conflict' of steps is not valid`, () => {
					const test = helpers.makeTestSteps();
					test.steps[i].has_conflict = 'not-valid';
					return supertest(app)
						.post(`/api/records/${test.recordId}/steps`)
						.set('Authorization', helpers.makeAuthHeader(testUser))
						.send({ duration: test.duration, steps: test.steps })
						.expect(400, { error: `'has_conflict' must be a boolean` });
				})
	
				it(`responds with 400 when 'memos' of steps is not an array of length 9`, () => {
					const test = helpers.makeTestSteps();
					test.steps[i].memos = [];
					return supertest(app)
						.post(`/api/records/${test.recordId}/steps`)
						.set('Authorization', helpers.makeAuthHeader(testUser))
						.send({ duration: test.duration, steps: test.steps })
						.expect(400, { error: `'memos' must be an array of booleans with a length of 9` });
				})
	
				it(`responds with 400 when 'memos' of steps is not an array of booleans`, () => {
					const test = helpers.makeTestSteps();
					test.steps[i].memos[5] = 'not-valid';
					return supertest(app)
						.post(`/api/records/${test.recordId}/steps`)
						.set('Authorization', helpers.makeAuthHeader(testUser))
						.send({ duration: test.duration, steps: test.steps })
						.expect(400, { error: `'memos' must be an array of booleans with a length of 9` });
				})
			})
	
			it('creates new steps, responding with 201, the updated record and snapshot cells', () => {
				const test = helpers.makeTestSteps();
	
				const expectedRecord = {
					num_empty_cells: 52,
					num_wrong_cells: 1,
					step_id: 1,
					max_step_id: 1,
					duration: test.duration
				};
	
				const expectedCell = {
					cell_id: test.steps[1].cell_id,
					value: test.steps[1].value,
					has_conflict: test.steps[1].has_conflict,
					memos: test.steps[1].memos
				};
	
				return supertest(app)
					.post(`/api/records/${test.recordId}/steps`)
					.set('Authorization', helpers.makeAuthHeader(testUser))
					.send({ duration: test.duration, steps: test.steps })
					.expect(201)
					.expect(res => {
						expect(res.body.record.id).to.eql(test.recordId);
						expect(res.body.record.num_empty_cells).to.eql(expectedRecord.num_empty_cells);
						expect(res.body.record.num_wrong_cells).to.eql(expectedRecord.num_wrong_cells);
						expect(res.body.record.step_id).to.eql(expectedRecord.step_id);
						expect(res.body.record.max_step_id).to.eql(expectedRecord.max_step_id);
						expect(res.body.record.duration).to.eql(expectedRecord.duration);
						expect(res.body.cells[0].cell_id).to.eql(expectedCell.cell_id);
						expect(res.body.cells[0].value).to.eql(expectedCell.value);
						expect(res.body.cells[0].has_conflict).to.eql(expectedCell.has_conflict);
						res.body.cells[0].memos.forEach((m, i) => {
							expect(m).to.eql(expectedCell.memos[i]);
						})
					})
					.expect(res => 
						db
							.from('records')
							.select('*')
							.where('id', test.recordId)
							.first()
							.then(row => {
								expect(row.num_empty_cells).to.eql(expectedRecord.num_empty_cells);
								expect(row.num_wrong_cells).to.eql(expectedRecord.num_wrong_cells);
								expect(row.step_id).to.eql(expectedRecord.step_id);
								expect(row.max_step_id).to.eql(expectedRecord.max_step_id);
								expect(row.duration).to.eql(expectedRecord.duration);
							})
					)
					.expect(res => 
						db
							.from('record_snapshots')
							.select('*')
							.where({
								'record_id': test.recordId,
								'cell_id': test.steps[1].cell_id
							})
							.first()
							.then(row => {
								expect(row.value).to.eql(expectedCell.value);
								expect(row.has_conflict).to.eql(expectedCell.has_conflict);
							})
					)
					.expect(res => 
						db
							.from('snapshot_memos')
							.select('*')
							.where({
								'record_id': test.recordId,
								'cell_id': test.steps[1].cell_id
							})
							.orderBy('memo_no')
							.then(rows => {
								rows.forEach((row, i) => {
									expect(row.is_on).to.eql(expectedCell.memos[i]);
								})
							})
					)
					.expect(res => 
						db
							.from('record_steps')
							.select('*')
							.where({
								'record_id': test.recordId,
								'step_id': expectedRecord.step_id
							})
							.orderBy('step_type')
							.then(rows => {
								rows.forEach((row, i) => {
									expect(row.cell_id).to.eql(test.steps[i].cell_id);
									expect(row.step_type).to.eql(test.steps[i].step_type);
									expect(row.value).to.eql(test.steps[i].value);
									expect(row.has_conflict).to.eql(test.steps[i].has_conflict);
								})
							})
					)
					.expect(res => 
						db
							.from('step_memos')
							.select('*')
							.where({
								'record_id': test.recordId,
								'step_id': expectedRecord.step_id
							})
							.orderBy([
								{ column: 'step_type' },
								{ column: 'memo_no' }
							])
							.then(rows => {
								rows.forEach((row, i) => {
									expect(row.cell_id).to.eql(test.steps[Math.floor(i / 9)].cell_id);
									expect(row.memo_no).to.eql((i % 9) + 1);
									expect(row.is_on).to.eql(test.steps[Math.floor(i / 9)].memos[i % 9]);
								})
							})
					);
			})
		})
	})

	describe('PATCH /api/records/:record_id/steps', () => {
		context(`Given no records`, () => {
			beforeEach('inserts users', () => helpers.seedUsers(db, testUsers))

			it(`responds with 404 when record doesn't exist`, () => {
				const recordId = 123456;
				return supertest(app)
					.patch(`/api/records/${recordId}/steps`)
					.set('Authorization', helpers.makeAuthHeader(testUser))
					.expect(404, { error: `Record doesn't exist` });
			})
		})

		context('Given there are records in the database', () => {
			const {
				testUsers,
				testPuzzles,
				testPuzzleCells,
				testRecords,
				testSnapshots,
				testSnapshotMemos,
				testSteps,
				testStepMemos
			} = helpers.makeSudokuFixturesWithSteps();
	
			beforeEach('inserts puzzles and initializes a record and a step', async () => {
				await helpers.seedSudokuTables(
					db,
					testUsers,
					testPuzzles,
					testPuzzleCells,
					testRecords,
					testSnapshots,
					testSnapshotMemos,
					testSteps,
					testStepMemos
				);
			})
	
			it('responds with 404 when record id is not valid', () => {
				const recordId = 'not-valid';
				return supertest(app)
					.patch(`/api/records/${recordId}/steps`)
					.set('Authorization', helpers.makeAuthHeader(testUser))
					.expect(404, { error: 'Invalid record id' });
			})
	
			it(`responds with 400 when the 'duration' is missing`, () => {
				const recordId = 1;
				return supertest(app)
					.patch(`/api/records/${recordId}/steps`)
					.set('Authorization', helpers.makeAuthHeader(testUser))
					.expect(400, { error: `Missing 'duration' in request body` });
			})
	
			it(`responds with 400 when the 'duration' is not valid`, () => {
				const recordId = 1;
				const duration = 'not-valid';
				return supertest(app)
					.patch(`/api/records/${recordId}/steps`)
					.set('Authorization', helpers.makeAuthHeader(testUser))
					.send({ duration })
					.expect(400, { error: `'duration' must be a positive number` });
			})
	
			it(`responds with 400 when 'edit_type' is missing`, () => {
				const recordId = 1;
				const duration = 15;
				return supertest(app)
					.patch(`/api/records/${recordId}/steps`)
					.set('Authorization', helpers.makeAuthHeader(testUser))
					.send({ duration })
					.expect(400, { error: `Missing 'edit_type' in request body` });
			})
	
			it(`responds with 400 when the 'edit_type' is not valid`, () => {
				const recordId = 1;
				const duration = 15;
				const edit_type = 'not-valid';
				return supertest(app)
					.patch(`/api/records/${recordId}/steps`)
					.set('Authorization', helpers.makeAuthHeader(testUser))
					.send({ duration, edit_type })
					.expect(400, { error: `'edit_type' must be either 'UNDO' or 'REDO'` });
			})
	
			it(`responds with 400 when the undo is not possible`, () => {
				const recordId = 2;
				const duration = 15;
				const edit_type = 'UNDO';
				return supertest(app)
					.patch(`/api/records/${recordId}/steps`)
					.set('Authorization', helpers.makeAuthHeader(testUser))
					.send({ duration, edit_type })
					.expect(400, { error: `unable to perform undo operation` });
			})
	
			it(`responds with 400 when the redo is not possible`, () => {
				const recordId = 3;
				const duration = 15;
				const edit_type = 'REDO';
				return supertest(app)
					.patch(`/api/records/${recordId}/steps`)
					.set('Authorization', helpers.makeAuthHeader(testUser))
					.send({ duration, edit_type })
					.expect(400, { error: `unable to perform redo operation` });
			})
	
			it('undos a step, responding with 200, the updated record and snapshot cells', () => {
				const recordId = 1;
				const duration = 15;
				const edit_type = 'UNDO';
	
				const expectedRecord = {
					num_empty_cells: 53,
					num_wrong_cells: 0,
					step_id: null,
					max_step_id: 2,
					duration: 15
				};
	
				const expectedCell = {
					cell_id: 0,
					value: null,
					has_conflict: false,
					memos: [ false, false, false, false, false, false, false, false, false ]
				};
	
				return supertest(app)
					.patch(`/api/records/${recordId}/steps`)
					.set('Authorization', helpers.makeAuthHeader(testUser))
					.send({ duration, edit_type })
					.expect(200)
					.expect(res => {
						expect(res.body.record.id).to.eql(recordId);
						expect(res.body.record.num_empty_cells).to.eql(expectedRecord.num_empty_cells);
						expect(res.body.record.num_wrong_cells).to.eql(expectedRecord.num_wrong_cells);
						expect(res.body.record.step_id).to.eql(expectedRecord.step_id);
						expect(res.body.record.max_step_id).to.eql(expectedRecord.max_step_id);
						expect(res.body.record.duration).to.eql(expectedRecord.duration);
						expect(res.body.cells[0].cell_id).to.eql(expectedCell.cell_id);
						expect(res.body.cells[0].value).to.eql(expectedCell.value);
						expect(res.body.cells[0].has_conflict).to.eql(expectedCell.has_conflict);
						res.body.cells[0].memos.forEach((m, i) => {
							expect(m).to.eql(expectedCell.memos[i]);
						})
					})
					.expect(res => 
						db
							.from('records')
							.select('*')
							.where('id', recordId)
							.first()
							.then(row => {
								expect(row.num_empty_cells).to.eql(expectedRecord.num_empty_cells);
								expect(row.num_wrong_cells).to.eql(expectedRecord.num_wrong_cells);
								expect(row.step_id).to.eql(expectedRecord.step_id);
								expect(row.max_step_id).to.eql(expectedRecord.max_step_id);
								expect(row.duration).to.eql(expectedRecord.duration);
							})
					)
					.expect(res => 
						db
							.from('record_snapshots')
							.select('*')
							.where({
								'record_id': recordId,
								'cell_id': expectedCell.cell_id
							})
							.first()
							.then(row => {
								expect(row.value).to.eql(expectedCell.value);
								expect(row.has_conflict).to.eql(expectedCell.has_conflict);
							})
					)
					.expect(res => 
						db
							.from('snapshot_memos')
							.select('*')
							.where({
								'record_id': recordId,
								'cell_id': expectedCell.cell_id
							})
							.orderBy('memo_no')
							.then(rows => {
								rows.forEach((row, i) => {
									expect(row.is_on).to.eql(expectedCell.memos[i]);
								})
							})
					);
			})
	
			it('redos a step, responding with 200, the updated record and snapshot cells', () => {
				const recordId = 1;
				const duration = 15;
				const edit_type = 'REDO';
	
				const expectedRecord = {
					num_empty_cells: 53,
					num_wrong_cells: 0,
					step_id: 2,
					max_step_id: 2,
					duration: 15
				};
	
				const expectedCell = {
					cell_id: 0,
					value: null,
					has_conflict: false,
					memos: [ false, true, false, false, false, false, false, false, false ]
				};
	
				return supertest(app)
					.patch(`/api/records/${recordId}/steps`)
					.set('Authorization', helpers.makeAuthHeader(testUser))
					.send({ duration, edit_type })
					.expect(200)
					.expect(res => {
						expect(res.body.record.id).to.eql(recordId);
						expect(res.body.record.num_empty_cells).to.eql(expectedRecord.num_empty_cells);
						expect(res.body.record.num_wrong_cells).to.eql(expectedRecord.num_wrong_cells);
						expect(res.body.record.step_id).to.eql(expectedRecord.step_id);
						expect(res.body.record.max_step_id).to.eql(expectedRecord.max_step_id);
						expect(res.body.record.duration).to.eql(expectedRecord.duration);
						expect(res.body.cells[0].cell_id).to.eql(expectedCell.cell_id);
						expect(res.body.cells[0].value).to.eql(expectedCell.value);
						expect(res.body.cells[0].has_conflict).to.eql(expectedCell.has_conflict);
						res.body.cells[0].memos.forEach((m, i) => {
							expect(m).to.eql(expectedCell.memos[i]);
						})
					})
					.expect(res => 
						db
							.from('records')
							.select('*')
							.where('id', recordId)
							.first()
							.then(row => {
								expect(row.num_empty_cells).to.eql(expectedRecord.num_empty_cells);
								expect(row.num_wrong_cells).to.eql(expectedRecord.num_wrong_cells);
								expect(row.step_id).to.eql(expectedRecord.step_id);
								expect(row.max_step_id).to.eql(expectedRecord.max_step_id);
								expect(row.duration).to.eql(expectedRecord.duration);
							})
					)
					.expect(res => 
						db
							.from('record_snapshots')
							.select('*')
							.where({
								'record_id': recordId,
								'cell_id': expectedCell.cell_id
							})
							.first()
							.then(row => {
								expect(row.value).to.eql(expectedCell.value);
								expect(row.has_conflict).to.eql(expectedCell.has_conflict);
							})
					)
					.expect(res => 
						db
							.from('snapshot_memos')
							.select('*')
							.where({
								'record_id': recordId,
								'cell_id': expectedCell.cell_id
							})
							.orderBy('memo_no')
							.then(rows => {
								rows.forEach((row, i) => {
									expect(row.is_on).to.eql(expectedCell.memos[i]);
								})
							})
					);
			})
		})
	})
})