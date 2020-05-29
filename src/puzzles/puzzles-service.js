const PuzzlesService = {
	validateLevel(level) {
		if (!level) {
			return `Missing 'level' in request query`;
		}
		level = Number(level);
		if (!level || level < 1 || level > 5) {
			return 'Level must be a digit between 1 to 5';
		}
		return null;
	},

	getAllPuzzleIdByLevel(db, level) {
		return db
			.from('puzzles AS p')
			.select('p.id')
			.where('p.level', level);
	},

	getRandomPuzzleIdByUser(db, user_id, level) {
		const resPuzzles = (Number(user_id) === 1)
			// guest user
			? this.getAllPuzzleIdByLevel(db, level)
			// authorized user, excludes puzzles with user records
			: this.getAllPuzzleIdByLevel(db, level)
					.leftJoin('records AS r', function() {
						this.on('p.id', '=', 'r.puzzle_id')
							.andOn('r.user_id', '=', user_id)
					.whereNull('r.id')
				});
		return resPuzzles
			.then(puzzles => 
				puzzles[Math.floor(Math.random() * puzzles.length)]
			);
	},

	getPuzzleById(db, id) {
		return db
			.from('puzzles')
			.select('*')
			.where({ id })
			.first();
	},

	getPuzzleCellsByPuzzle(db, puzzle_id) {
		return db
			.from('puzzle_cells')
			.select(
				'cell_id',
				'is_default',
				'value'
			)
			.where({ puzzle_id })
			.orderBy('cell_id');
	}
}

module.exports = PuzzlesService;