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
		testSnapshotNotes
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
			const puzzle_id = 'not-valid';
			return supertest(app)
				.post('/api/records')
				.set('Authorization', helpers.makeAuthHeader(testUser))
				.send({ puzzle_id })
				.expect(400, { error: 'puzzle_id must be a valid number' });
		})

		it('responds with 400 when puzzle_id', () => {
			const puzzle_id = 10;
			return supertest(app)
				.post('/api/records')
				.set('Authorization', helpers.makeAuthHeader(testUser))
				.send({ puzzle_id })
				.expect(400, { error: `Puzzle doesn't exist` });
		})

		it('creates a record, responding with 201, record_id and the snapshot', () => {
			const puzzle_id = 1;

			const puzzle = helpers.makePuzzleCellsArray()
				.filter(pc => pc.puzzle_id = puzzle_id);

			return supertest(app)
				.post('/api/records')
				.set('Authorization', helpers.makeAuthHeader(testUser))
				.send({ puzzle_id })
				.expect(201)
				.expect(res => {
					expect(res.body).to.have.property('record_id');
					expect(res.headers.location).to.eql(`/api/records/${res.body.record_id}`);
					res.body.snapshot.forEach((rc, idx) => {
						expect(rc).to.not.have.property('record_id');
						expect(rc.cell_id).to.eql(puzzle[idx].cell_id);
						expect(rc.is_default).to.eql(puzzle[idx].is_default);
						expect(rc.value).to.eql(puzzle[idx].value);
					})
				})
				.expect(res => 
					db
						.from('records')
						.select('*')
						.where('id', res.body.record_id)
						.first()
						.then(row => {
							expect(row.puzzle_id).to.eql(puzzle_id);
							expect(row.user_id).to.eql(testUser.id);
							expect(row.is_solved).to.eql(false);
							expect(row.date_solved).to.eql(null);
							expect(row.step_id).to.eql(null);
							const expectDate = new Date().toLocaleString();
							const actualDate = new Date(row.date_created).toLocaleString();
							expect(actualDate).to.eql(expectDate);
						})
				)
				.expect(res => 
					db
						.from('record_snapshots')
						.select('*')
						.where('record_id', res.body.record_id)
						.then(rows => {
							rows.forEach((row, idx) => {
								expect(row.cell_id).to.eql(puzzle[idx].cell_id);
								expect(row.is_default).to.eql(puzzle[idx].is_default);
								expect(row.value).to.eql(puzzle[idx].value);
							})
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
					testSnapshotNotes
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
					testSnapshotNotes.filter(n => n.record_id === recordId)
				);
				
				return supertest(app)
					.get(`/api/records/${recordId}`)
					.set('Authorization', helpers.makeAuthHeader(testUser))
					.expect(200, expectedRecord);
			})
		})
	})
})