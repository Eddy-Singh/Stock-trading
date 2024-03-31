import ApiError from '../utils/apiError.js'
import { validationResult } from 'express-validator'

export class GameController {
	constructor(gameService) {
		this.gameService = gameService
	}



	async createGame(req, res) {
		const errors = validationResult(req)
		if (!errors.isEmpty()) {
			throw new ApiError(400, 'Invalid game data')
		}
		const { name, startTime, endTime, initialAmount } = req.body
		const game = await this.gameService.createGame(
			name,
			startTime,
			endTime,
			initialAmount
		)
		res.status(201).json(game)
	}

	async getAllGames(req, res) {
		const page = parseInt(req.query.page) || 1
		const limit = parseInt(req.query.limit) || 10
		const games = await this.gameService.getAllGames(page, limit)
		res.json(games)
	}

	async getGameDetails(req, res) {
		const game = await this.gameService.getGameById(req.params.id)
		if (!game) {
			throw new ApiError(404, 'Game not found')
		}
		res.json(game)
	}

	async registerPlayer(req, res) {
		const userId = req.user.userId
		const game = await this.gameService.registerPlayer(req.params.id, userId)
		res.status(200).json(game)
	}

	async buyStock(req, res) {
		const { stockSymbol, quantity } = req.body
		await this.gameService.buyStock(
			req.user.userId,
			req.params.id,
			stockSymbol,
			quantity
		)
		res.status(200).json({ message: 'Stocks purchased successfully' })
	}

	async sellStock(req, res) {
		const { stockSymbol, quantity } = req.body
		await this.gameService.sellStock(
			req.user.userId,
			req.params.id,
			stockSymbol,
			quantity
		)
		res.status(200).json({ message: 'Stocks sold successfully' })
	}

	async getPortfolio() {
		portfolio = await this.gameService.getPortfolio(
			req.user.userId,
			req.params.id
		)
		res.json(portfolio)
	}
}
