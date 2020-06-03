const knex = require('knex');
const app = require('../src/App');
const helpers = require('./test-helpers');

describe('Puzzles Endpoints', () => {
	let db;

	const {
		testUsers,
		testPuzzles,
		testPuzzleCells,
		testRecords
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

	describe('GET /api/puzzles', () => {
		context('Given no puzzles', () => {
			beforeEach('insert users', () => helpers.seedUsers(db, testUsers))

			it('responds with 404 when no puzzle is found', () => {
				const level = 3;
				return supertest(app)
					.get(`/api/puzzles?level=${level}`)
					.set('Authorization', helpers.makeAuthHeader(testUser))
					.expect(404, { error: 'No puzzle found' });
			})
		})

		context('Given there are puzzles in the database', () => {
			beforeEach('insert puzzles', () => 
				helpers.seedSudokuTables(
					db,
					testUsers,
					testPuzzles,
					testPuzzleCells,
					testRecords
				)
			)

			it(`responds with 400 when missing 'level' in request query`, () => {
				return supertest(app)
					.get(`/api/puzzles`)
					.set('Authorization', helpers.makeAuthHeader(testUser))
					.expect(400, { error: `Missing 'level' in request query` });
			})

			it(`responds with 400 when 'level' is not a valid number`, () => {
				const level = 'not-valid';
				return supertest(app)
					.get(`/api/puzzles?level=${level}`)
					.set('Authorization', helpers.makeAuthHeader(testUser))
					.expect(400, { error: `'level' must be a digit between 1 to 5` });
			})

			it(`responds with 400 when 'level' is not a digit between 1 to 5`, () => {
				const level = 10;
				return supertest(app)
					.get(`/api/puzzles?level=${level}`)
					.set('Authorization', helpers.makeAuthHeader(testUser))
					.expect(400, { error: `'level' must be a digit between 1 to 5` });
			})

			it('responds with 200 and a random puzzle without given user_id', () => {
				const level = 3;
				const expectedPuzzle = helpers.makeExpectedPuzzle(
					testPuzzles[0],
					testPuzzleCells.filter(pc => pc.puzzle_id === testPuzzles[0].id)
				);
				return supertest(app)
					.get(`/api/puzzles?level=${level}`)
					.expect(200, expectedPuzzle);
			})

			it('responds with 200 and a random puzzle without records with the given user_id', () => {
				const level = 3;
				const expectedPuzzle = helpers.makeExpectedPuzzle(
					testPuzzles[0],
					testPuzzleCells.filter(pc => pc.puzzle_id === testPuzzles[0].id)
				);
				return supertest(app)
					.get(`/api/puzzles?level=${level}`)
					.set('Authorization', helpers.makeAuthHeader(testUser))
					.expect(200, expectedPuzzle);
			})
		})
	})
})