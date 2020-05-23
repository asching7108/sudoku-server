const express = require('express');
const path = require('path');
const UsersService = require('./users-service');

const UsersRouter = express.Router();
const jsonBodyParser = express.json();

UsersRouter
	.post('/', jsonBodyParser, (req, res, next) => {
		const { email, password, user_name } = req.body;
		const regUser = { email, password, user_name };

		for (const [key, value] of Object.entries(regUser)) {
			if (value == null) {
				return res.status(400).json({
					error: `Missing '${key}' in request body`
				});
			}
		}

		const emailError = UsersService.validateEmail(email);
		const passwordError = UsersService.validatePassword(password);

		if (emailError) {
			return res.status(400).json({ error: emailError });
		}

		if (passwordError) {
			return res.status(400).json({ error: passwordError });
		}

		UsersService.hasUserWithEmail(
			req.app.get('db'),
			email
		)
			.then(hasUserWithEmail => {
				if (hasUserWithEmail) {
					return res.status(400).json({ error: 'Email address already taken' });
				}

				return UsersService.hashPassword(password)
					.then(hashedPassword => {
						const newUser = {
							email,
							password: hashedPassword,
							user_name
						};
						return UsersService.insertUser(
							req.app.get('db'),
							newUser
						)
							.then(user => {
								res.status(201)
									.location(path.posix.join(req.originalUrl, `${user.id}`))
									.json(UsersService.serializeUser(user))
							});
					});
			})
			.catch(next);
	})

module.exports = UsersRouter;