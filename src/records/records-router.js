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

				// inserts record and record snapshot
				RecordsService.insertRecord(
					req.app.get('db'),
					req.user.id,
					puzzle.id
				)
					.then(([record, snapshot]) => {
						snapshot = snapshot.map(rc => {
							delete rc.record_id;
							return rc;
						});
						res
							.status(201)
							.location(path.posix.join(req.originalUrl, `/${record.id}`))
							.json({ record_id: record.id, snapshot });
					})
					.catch(next);
			});
	})

RecordsRouter
	.route('/:record_id')
	.all(requireAuth)
	.all(checkRecordExist)
	.get((req, res, next) => {
		RecordsService.getSnapshotById(
			req.app.get('db'),
			req.params.record_id
		)
			.then(([snapshot, notes]) => {
				snapshot = RecordsService.serializeSnapshot(
					snapshot, 
					notes
				);
				res.json({ record: res.record, snapshot });
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

module.exports = RecordsRouter;