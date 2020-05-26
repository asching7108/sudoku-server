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

	getRandomPuzzleId(db, user_id, level) {
		return db
			.from('puzzles AS p')
			.select('p.id AS puzzle_id')
			.leftJoin('records AS r', function() {
				this.on('p.id', '=', 'r.puzzle_id')
					.andOn('r.user_id', '=', user_id)
			})
			.where('p.level', level)
			.whereNull('r.id')	// excludes puzzles with records
			.then(puzzles => 
				puzzles[Math.floor(Math.random() * puzzles.length)]
			);
	},

	getPuzzleById(db, puzzle_id) {
		return db
			.from('puzzles')
			.select('*')
			.where('id', puzzle_id)
			.first();
	},

	getPuzzleCellsById(db, puzzle_id) {
		return db
			.from('puzzle_cells')
			.select(
				'cell_id',
				'is_default',
				'value'
			)
			.where({ puzzle_id });
	}
}

module.exports = PuzzlesService;