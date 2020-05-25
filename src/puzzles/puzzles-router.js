const express = require('express');
const PuzzlesService = require('./puzzles-service');
const { requireAuth } = require('../middleware/jwt-auth');

const PuzzlesRouter = express.Router();

PuzzlesRouter
	.route('/')
	.get(requireAuth, (req, res, next) => {
		const { level } = req.query;

		// validates level
		const levelError = PuzzlesService.validateLevel(level);
		if (levelError) {
			return res.status(400).json({ error: levelError });
		}

		// gets a random puzzle id which the user hasn't played
		PuzzlesService.getRandomPuzzleId(
			req.app.get('db'),
			req.user.id,
			level
		)
			.then(data => {
				// no puzzle found
				if (!data) {
					return res.status(404).json({
						error: 'No puzzle found'
					});
				}

				// gets puzzle cells
				const { puzzle_id } = data;
				res.puzzle_id = puzzle_id;
				return PuzzlesService.getPuzzleById(
					req.app.get('db'), 
					puzzle_id
				);
			})
			.then(puzzle => {
				res.json({ puzzle_id: res.puzzle_id, puzzle });
			})
			.catch(next);
	})

module.exports = PuzzlesRouter;