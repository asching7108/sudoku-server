const AuthService = require('../auth/auth-service');

const GUEST_USER = {
	id: 1,
	email: 'guest@gmail.com'
};

function requireAuth(req, res, next) {
	const authToken = req.get('Authorization') || '';
	let bearerToken;

	// if no token found, continues with the guest user
	if (!authToken.toLowerCase().startsWith('bearer ')) {
		req.user = GUEST_USER;
		next();
		return;
	}
	else {
		bearerToken = authToken.slice(7, authToken.length);
	}

	try {
		const payload = AuthService.verifyJwt(bearerToken);

		AuthService.getUserWithEmail(
			req.app.get('db'),
			payload.sub
		)
			.then(user => {				
				if (!user) {
					return res.status(401).json({ error: 'Unauthorized request' });
				}
				req.user = user;
				next();
			})
			.catch(err => {
				next(err);
			});
	}
	catch(error) {
		res.status(401).json({ error: 'Unauthorized request' });
	}
}

module.exports = { requireAuth };