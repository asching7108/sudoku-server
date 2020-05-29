require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV, CLIENT_ORIGIN } = require('./config');
const AuthRouter = require('./auth/auth-router');
const UsersRouter = require('./users/users-router');
const PuzzlesRouter = require('./puzzles/puzzles-router');
const RecordsRouter = require('./records/records-router');

const app = express();

const morganOption = (NODE_ENV === 'production')
	? 'tiny'
	: 'common';

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors({ origin: CLIENT_ORIGIN }));

app.use('/api/auth', AuthRouter);
app.use('/api/users', UsersRouter);
app.use('/api/puzzles', PuzzlesRouter);
app.use('/api/records', RecordsRouter);

app.get('/', (req, res) => {
	res.send('Hello, world!');
});

/* error handler */
app.use((error, req, res, next) => {
	let response;
	if (NODE_ENV === 'production') {
		response = { error: { message: 'server error' }};
	} else {
		console.error(error);
		response = { message: error.message, error };
	}
	res.status(500).json(response);
});

module.exports = app;