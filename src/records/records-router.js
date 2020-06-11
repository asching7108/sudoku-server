const express = require('express');
const path = require('path');
const PuzzlesService = require('../puzzles/puzzles-service');
const RecordsService = require('./records-service');
const { requireAuth } = require('../middleware/jwt-auth');

const RecordsRouter = express.Router();
const jsonBodyParser = express.json();

RecordsRouter
	.route('/')
	.all(requireAuth)
	.get((req, res, next) => {
		RecordsService.getRecordsByUser(
			req.app.get('db'),
			req.user.id
		)
			.then(records => {
				res.json(RecordsService.serializeRecords(records));
			})
			.catch(next);
	})

	.post(jsonBodyParser, (req, res, next) => {
		const { puzzle_id } = req.body;

		// validates puzzle_id
		const puzzleIdError = RecordsService.validatePuzzleId(puzzle_id);
		if (puzzleIdError) {
			return res.status(400).json({ error: puzzleIdError });
		}

		PuzzlesService.getPuzzleById(
			req.app.get('db'),
			puzzle_id
		)
			.then(puzzle => {
				// puzzle doesn't exist
				if (!puzzle) {
					return res.status(400).json({ error: `Puzzle doesn't exist` });
				}

				// inserts record, record snapshot and snapshot memos
				RecordsService.insertRecord(
					req.app.get('db'),
					req.user.id,
					puzzle.id
				)
					.then(([record, snapshot, memos]) => {
						snapshot = RecordsService.serializeSnapshotCells(
							snapshot, 
							memos
						);
						res
							.status(201)
							.location(path.posix.join(req.originalUrl, `/${record.id}`))
							.json({ record, snapshot });
					})
					.catch(next);
			});
	})

RecordsRouter
	.route('/:record_id')
	.all(requireAuth)
	.all(checkRecordExist)

	.get((req, res, next) => {
		RecordsService.getSnapshotByRecord(
			req.app.get('db'),
			res.record.id
		)
			.then(([snapshot, memos]) => {
				snapshot = RecordsService.serializeSnapshotCells(
					snapshot, 
					memos
				);
				res.json({ record: res.record, snapshot });
			})
			.catch(next);
	})

	.patch(jsonBodyParser, (req, res, next) => {
		const { updateCols } = req.body;
		
		// validates updateCols
		const updateColsError = RecordsService.validateUpdateCols(updateCols);
		if (updateColsError) {
			return res.status(400).json({ error: updateColsError });
		}
		
		RecordsService.updateRecord(
			req.app.get('db'),
			res.record.id,
			updateCols
		)
			.then(record => {
				res.json({ record });
			})
			.catch(next);
	})

RecordsRouter
	.route('/:record_id/steps')
	.all(requireAuth)
	.all(checkRecordExist)
	.all(jsonBodyParser)
	.all(validateDuration)

	.post((req, res, next) => {
		const { duration, steps } = req.body;

		// validates steps
		const stepsError = RecordsService.validateSteps(steps);
		if (stepsError) {
			return res.status(400).json({ error: stepsError });
		}

		RecordsService.insertRecordSteps(
			req.app.get('db'),
			res.record,
			duration,
			steps
		)
			.then(([record, cell, memos, updatedCells]) => {
				updatedCells.push(RecordsService.serializeSnapshotCell(cell, memos));
				res
					.status(201)
					.json({
						record,
						cells: updatedCells
					});
			})
			.catch(next);
	})

	.patch(jsonBodyParser, (req, res, next) => {
		const { duration, edit_type } = req.body;

		// validates edit_type
		const editTypeError = RecordsService.validateEditType(res.record, edit_type);
		if (editTypeError) {
			return res.status(400).json({ error: editTypeError });
		}

		RecordsService.updateRecordSteps(
			req.app.get('db'),
			res.record,
			edit_type,
			duration
		)
			.then(([record, cell, memos, updatedCells]) => {
				updatedCells.push(RecordsService.serializeSnapshotCell(cell, memos));
				res
					.status(200)
					.json({
						record,
						cells: updatedCells
					});
			})
			.catch(next);
	})

function checkRecordExist(req, res, next) {
	try {
		if (!Number(req.params.record_id)) {
			return res.status(404).json({
				error: `Invalid record id`
			});
		}

		RecordsService.getRecordById(
			req.app.get('db'),
			req.params.record_id
		)
			.then(record => {
				if (!record) {
					return res.status(404).json({
						error: `Record doesn't exist`
					});
				}
				res.record = record;
				next();
			})
			.catch(next);
	}
	catch(error) {
		next(error);
	}
}

function validateDuration(req, res, next) {
	try {
		const { duration } = req.body;
		const durationError = RecordsService.validateDuration(duration);
		if (durationError) {
			return res.status(400).json({ error: durationError });
		}
		next();
	}
	catch(error) {
		next(error);
	}
}

module.exports = RecordsRouter;