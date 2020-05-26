const knex = require('knex');
const app = require('../src/App');
const helpers = require('./test-helpers');

describe('Protected endpoints', () => {
	let db;

	const { testUsers } = helpers.makeSudokuFixtures();

	before('make knex instance', () => {
		db = knex({
			client: 'pg',
			connection: process.env.TEST_DATABASE_URL,
		});
		app.set('db', db);
	})

	after('disconnect from db', () => db.destroy())

	before('cleanup', () => helpers.cleanTables(db))

	afterEach('cleanup', () => helpers.cleanTables(db))

	beforeEach('insert trips', () =>
		helpers.seedUsers(db, testUsers)
	)

	const protectedEndpoints = [
		{
			name: 'GET /api/puzzles',
			path: '/api/puzzles',
			method: supertest(app).get
		},
		{
			name: 'GET /api/records',
			path: '/api/records',
			method: supertest(app).get
		},
		{
			name: 'POST /api/records',
			path: '/api/records',
			method: supertest(app).post
		},
		{
			name: 'POST /api/records/:record_id',
			path: '/api/records/1',
			method: supertest(app).get
		}
	];

	protectedEndpoints.forEach(endpoint => {
		describe(endpoint.name, () => {
			it(`responds 401 'Missing basic token' when no bearer token`, () => {
				return endpoint.method(endpoint.path)
					.expect(401, { error: `Missing bearer token` });
			})

			it(`responds 401 'Unauthorized request' when invalid JWT secret`, () => {
				const validUser = testUsers[0];
				const invalidSecret = 'bad-secret';
				return endpoint.method(endpoint.path)
					.set('Authorization', helpers.makeAuthHeader(validUser, invalidSecret))
					.expect(401, { error: `Unauthorized request` });
			})

			it(`responds 401 'Unauthorized request' when invalid sub in payload`, () => {
				const invalidUser = { email: 'invalid@test.com', id: 1 };
				return endpoint.method(endpoint.path)
					.set('Authorization', helpers.makeAuthHeader(invalidUser))
					.expect(401, { error: `Unauthorized request` });
			})
		})
	})
})
