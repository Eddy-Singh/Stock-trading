import { Router } from 'express'
import GameService from '../services/game.service.js'
import { GameRepository } from '../repositories/game.repository.js'
import { GameController } from '../controllers/game.controller.js'
import checkAuth from '../middlewares/checkAuth.middleware.js'
import isAdmin from '../middlewares/isAdmin.middleware.js'
import { PlayerPortfolioRepository } from '../repositories/playerPortfolio.repository.js'
import PlayerPortfolioModel from '../models/playerPortfolio.model.js'
import gameModel from '../models/game.model.js'
import asyncHandler from 'express-async-handler'
import { body } from 'express-validator'
import transactionRepository from '../repositories/transaction.repository.js'

const router = Router()

const gameRepository = new GameRepository(gameModel)
const playerPortfolioRepository = new PlayerPortfolioRepository(
	PlayerPortfolioModel
)
const gameService = new GameService(
	gameRepository,
	playerPortfolioRepository,
	transactionRepository
)
const gameController = new GameController(gameService)

router.get(
	'/',
	checkAuth,
	asyncHandler(gameController.getAllGames.bind(gameController))
)
router.post(
	'/create',
	checkAuth,
	isAdmin,
	[
		body('name')
			.isString()
			.withMessage('Name must be a string')
			.notEmpty()
			.withMessage('Name is required'),
		body('startTime')
			.isISO8601()
			.withMessage('Start time must be a valid ISO 8601 date'),
		body('endTime')
			.isISO8601()
			.withMessage('End time must be a valid ISO 8601 date'),
		body('initialAmount')
			.isFloat({ min: 0 })
			.withMessage('Initial amount must be a non-negative number')
	],
	asyncHandler(gameController.createGame.bind(gameController))
)
router.get(
	'/:id',
	checkAuth,
	asyncHandler(gameController.getGameDetails.bind(gameController))
)
router.post(
	'/:id/register',
	checkAuth,
	asyncHandler(gameController.registerPlayer.bind(gameController))
)

router.post(
	'/:id/buy',
	checkAuth,
	asyncHandler(gameController.buyStock.bind(gameController))
)
router.post(
	'/:id/sell',
	checkAuth,
	asyncHandler(gameController.sellStock.bind(gameController))
)

router.get(
	'/:id/portfolio',
	checkAuth,
	asyncHandler(gameController.getPortfolio.bind(gameController))
)

export default router
