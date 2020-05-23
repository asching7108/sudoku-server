const knex = require('knex');
const bcrypt = require('bcryptjs');
const app = require('../src/App');
const helpers = require('./test-helpers');

describe('Users Endpoints', () => {
	let db;

	const { testUsers } = helpers.makeSudokuFixtures();
	const testUser = testUsers[0];

	before('make knex instance', () => {
		db = knex({
			client: 'pg',
			connection: process.env.TEST_DATABASE_URL
		});
		app.set('db', db);
	})

	after('disconnect from db', () => db.destroy())

	before('cleanup', () => helpers.cleanTables(db))

	afterEach('cleanup', () => helpers.cleanTables(db))

	describe(`POST /api/users`, () => {
		context(`User Validation`, () => {
			beforeEach('insert users', () =>
				helpers.seedUsers(
					db,
					testUsers
				)
			)

			const requiredFields = ['email', 'password', 'user_name'];

			requiredFields.forEach(field => {
				const registerAttemptBody = {
					email: 'test@test.com',
					password: 'P@ssw0rd',
					user_name: 'test user_name'
				};

				it(`responds with 400 error when '${field}' is missing`, () => {
					delete registerAttemptBody[field];

					return supertest(app)
						.post('/api/users')
						.send(registerAttemptBody)
						.expect(400, {
							error: `Missing '${field}' in request body`
						});
				})
			})

			it(`responds 400 error when email is invalid`, () => {
				const userEmailInvalid = {
					email: 'test@test',
					password: 'P@ssw0rd',
					user_name: 'test user_name'
				};

				return supertest(app)
					.post('/api/users')
					.send(userEmailInvalid)
					.expect(400, {
						error: `Email address not valid`
					});
			})
			
			it(`responds 400 error when short password`, () => {
				const userShortPassword = {
					email: 'test@test.com',
					password: '',
					user_name: 'test user_name'
				};

				return supertest(app)
					.post('/api/users')
					.send(userShortPassword)
					.expect(400, {
						error: `Password must be no less than 8 characters`
					});
			})

			it(`responds 400 error when long password`, () => {
				const userLongPassword = {
					email: 'test@test.com',
					password: '*'.repeat(73),
					user_name: 'test user_name'
				};

				return supertest(app)
					.post('/api/users')
					.send(userLongPassword)
					.expect(400, {
						error: `Password must be no longer than 72 characters`
					});
			})

			it(`responds 400 error when password starts with spaces`, () => {
				const userPasswordStartsSpaces = {
					email: 'test@test.com',
					password: ' 1234567',
					user_name: 'test user_name'
				};

				return supertest(app)
					.post('/api/users')
					.send(userPasswordStartsSpaces)
					.expect(400, {
						error: `Password must not start or end with empty spaces`
					});
			})

			it(`responds 400 error when password ends with spaces`, () => {
				const userPasswordStartsSpaces = {
					email: 'test@test.com',
					password: '1234567 ',
					user_name: 'test user_name'
				};

				return supertest(app)
					.post('/api/users')
					.send(userPasswordStartsSpaces)
					.expect(400, {
						error: `Password must not start or end with empty spaces`
					});
			})

			it(`responds 400 error when password isn't complex enough`, () => {
				const userPasswordNotComplex = {
					email: 'test@test.com',
					password: '11AAaabb',
					user_name: 'test user_name'
				};

				return supertest(app)
					.post('/api/users')
					.send(userPasswordNotComplex)
					.expect(400, {
						error: `Password must contain 1 upper case, lower case, number and special character`
					});
			})

			it(`responds 400 error when email isn't unique`, () => {
				const duplicateUser = {
					email: testUser.email,
					password: 'P@ssw0rd',
					user_name: 'test user_name'
				};

				return supertest(app)
					.post('/api/users')
					.send(duplicateUser)
					.expect(400, {
						error: `Email address already taken`,
					});
			})
		})
		
		context(`Happy path`, () => {
			it(`responds 201, serialized user, storing bcryped password`, () => {
				const newUser = {
					email: 'test@test.com',
					password: 'P@ssw0rd',
					user_name: 'test user_name'
				};

				return supertest(app)
					.post('/api/users')
					.send(newUser)
					.expect(201)
					.expect(res => {
						expect(res.body).to.have.property('id');
						expect(res.body.email).to.eql(newUser.email);
						expect(res.body.user_name).to.eql(newUser.user_name);
						expect(res.body).to.not.have.property('password');
						expect(res.headers.location).to.eql(`/api/users/${res.body.id}`);
						const expectedDate = new Date().toLocaleString('en', { timeZone: 'UTC' });
						const actualDate = new Date(res.body.date_created).toLocaleString();
						expect(actualDate).to.eql(expectedDate);
					})
					.expect(res => {
						db
							.from('users')
							.select('*')
							.where({ id: res.body.id })
							.first()
							.then(row => {
								expect(row.email).to.eql(newUser.email);
								expect(row.user_name).to.eql(newUser.user_name);
								const expectedDate = new Date().toLocaleString('en', { timeZone: 'UTC' });
								const actualDate = new Date(row.date_created).toLocaleString();
								expect(actualDate).to.eql(expectedDate);

								return bcrypt.compare(newUser.password, row.password);
							})
								.then(compareMatch => {
									expect(compareMatch).to.be.true;
								});
					});
			})
		})
	})
})