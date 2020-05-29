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
	const testUser = testUsers[0];

	before ('make knex instance', () => {
		db = knex({
			client: 'pg',
			connection: process.env.TEST_DATABASE_URL
		});
		app.set('db', db);
	})

	after('disconnect from db', () => db.destroy())

	before('cleanup', () => helpers.cleanTables(db))

	afterEach('cleanup', () => helpers.cleanTables(db))

	describe('GET /api/records', () => {
		context(`Given no records`, () => {
			beforeEach('insert users', () => helpers.seedUsers(db, testUsers))

			it('responds with 200 and empty lists', () => {
				return supertest(app)
					.get('/api/records')
					.set('Authorization', helpers.makeAuthHeader(testUser))
					.expect(200, { solved: [], not_solved: [] });
			})
		})

		context('Given there are records in the database', () => {
			beforeEach('insert records', () => 
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
		beforeEach('insert puzzles', () => 
		helpers.seedSudokuTables(
			db,
			testUsers,
			testPuzzles,
			testPuzzleCells
		)
	)

		it('responds with 400 when missing puzzle_id in request body', () => {
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
				.expect(400, { error: 'puzzle_id must be a valid number' });
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
				is_solved: false,
				date_solved: null,
				step_id: null
			};

			const expectedSnapshot = [
				{
					memos: [false, false, false, false, false, false, false, false, false],
					is_default: false,
					def_value: 9,
					value: null,
					has_conflict: false
				},
				{
					memos: [false, false, false, false, false, false, false, false, false],
					is_default: true,
					def_value: 7,
					value: 7,
					has_conflict: false
				},
				{
					memos: [false, false, false, false, false, false, false, false, false],
					is_default: false,
					def_value: 3,
					value: null,
					has_conflict: false
				}
			];

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
					expect(res.body.record.is_solved).to.eql(expectedRecord.is_solved);
					expect(res.body.record.date_solved).to.eql(expectedRecord.date_solved);
					expect(res.body.record.step_id).to.eql(expectedRecord.step_id);
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
							expect(row.is_solved).to.eql(expectedRecord.is_solved);
							expect(row.date_solved).to.eql(expectedRecord.date_solved);
							expect(row.step_id).to.eql(expectedRecord.step_id);
							const expectDate = new Date().toLocaleString();
							const actualDate = new Date(row.date_created).toLocaleString();
							expect(actualDate).to.eql(expectDate);
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
						.catch(error => {
							console.log(error);
							
						})
				);
		})
	})

	describe('GET /api/records/:record_id', () => {
		context(`Given no records`, () => {
			beforeEach('insert users', () => helpers.seedUsers(db, testUsers))

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

			it(`responds with 404 when record id is not valid`, () => {
				const recordId = 'not-valid';
				return supertest(app)
					.get(`/api/records/${recordId}`)
					.set('Authorization', helpers.makeAuthHeader(testUser))
					.expect(404, { error: `Invalid record id` });
			})

			it('responds with 200 and and the specified record', () => {
				const recordId = 2;
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
})