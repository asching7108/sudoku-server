const xss = require('xss');
const bcrypt = require('bcryptjs');

// basic email address structure: _@_._
const REGEX_EMAIL_VALIDATION = /\S+@\S+\.\S+/;
const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])[\S]+/;

const UsersService = {
	hasUserWithEmail(db, email) {
		return db('users')
			.where({ email })
			.first()
			.then(user => !!user);
	},

	validateEmail(email) {
		if (!REGEX_EMAIL_VALIDATION.test(email)) {
			return 'Email address not valid';
		}
	},
	
	validatePassword(password) {
		if (password.length < 8) {
			return 'Password must be no less than 8 characters';
		}
		if (password.length > 72) {
			return 'Password must be no longer than 72 characters';
		}
		if (password.startsWith(' ') || password.endsWith(' ')) {
			return 'Password must not start or end with empty spaces';
		}
		if (!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password)) {
			return 'Password must contain 1 upper case, lower case, number and special character';
		}
		return null;
	},
	
	insertUser(db, newUser) {
		return db
			.insert(newUser)
			.into('users')
			.returning('*')
			.then(([user]) => user);
	},

	hashPassword(password) {
		return bcrypt.hash(password, 12);
	},
	
	serializeUser(user) {
		return {
			id: user.id,
			email: xss(user.email),
			user_name: xss(user.user_name),
			date_created: user.date_created
		};
	}
}

module.exports = UsersService;