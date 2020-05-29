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
		PuzzlesService.getRandomPuzzleIdByUser(
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

				// gets puzzle
				const resPuzzle = PuzzlesService.getPuzzleById(
					req.app.get('db'),
					data.id
				);
				// gets puzzle cells
				const resPuzzleCells = PuzzlesService.getPuzzleCellsByPuzzle(
					req.app.get('db'), 
					data.id
				);
				return Promise.all([resPuzzle, resPuzzleCells])
					.then(([resPuzzle, resPuzzleCells]) => {
						res.json({
							puzzle_id: resPuzzle.id,
							num_empty_cells: resPuzzle.num_empty_cells,
							puzzle: resPuzzleCells
						});
					});
			})
			.catch(next);
	})

module.exports = PuzzlesRouter;