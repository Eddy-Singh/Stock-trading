import ApiError from '../utils/apiError.js'

class GameService {
	constructor(
		gameRepository,
		playerPortfolioRepository,
		transactionRepository
	) {
		this.gameRepository = gameRepository
		this.playerPortfolioRepository = playerPortfolioRepository
		this.transactionRepository = transactionRepository
	}

	async createGame(name, startTime, endTime, initialAmount) {
		return this.gameRepository.create({
			name,
			startTime,
			endTime,
			initialAmount
		})
	}

	async getAllGames(page = 1, limit = 10) {
		const skip = (page - 1) * limit
		const games = await this.gameRepository.findAll(skip, limit)
		const total = await this.gameRepository.count()
		return {
			games,
			page,
			totalPages: Math.ceil(total / limit),
			totalGames: total
		}
	}

	async getGameById(gameId) {
		return this.gameRepository.findById(gameId)
	}

	async registerPlayer(gameId, userId) {
		const game = await this.gameRepository.findById(gameId)
		if (!game) throw new ApiError(404, 'Game not found')
		let portfolio = await this.playerPortfolioRepository.findByUserIdAndGameId(
			userId,
			gameId
		)
		if (portfolio)
			throw new ApiError(400, 'Player already registered for this game')
		portfolio = await this.playerPortfolioRepository.createPortfolio({
			userId,
			gameId,
			stocks: [],
			cash: game.initialAmount
		})

		game.players.push(userId)
		await this.gameRepository.updateGame(game)

		return portfolio
	}

	async buyStock(userId, gameId, stockSymbol, quantity) {
		const game = await this.gameRepository.findById(gameId)
		if (!game) throw new ApiError(404, 'Game not found')

		const now = new Date()
		if (now < game.startTime) {
			throw new ApiError(400, 'Cannot buy stocks before game starts')
		}
		if (now > game.endTime) {
			throw new ApiError(400, 'Cannot buy stocks after game ends')
		}

		const portfolio =
			await this.playerPortfolioRepository.findByUserIdAndGameId(userId, gameId)
		if (!portfolio) throw new ApiError(400, 'Portfolio not found')

		const price = await this.fetchStockPrice(stockSymbol)
		const totalCost = quantity * price
		if (portfolio.cash < totalCost) throw new ApiError(400, 'Not enough cash')

		portfolio.cash -= totalCost
		const stockIndex = portfolio.stocks.findIndex(
			(stock) => stock.stockSymbol === stockSymbol
		)
		if (stockIndex >= 0) {
			portfolio.stocks[stockIndex].quantity += quantity
		} else {
			portfolio.stocks.push({ stockSymbol, quantity })
		}
		await this.playerPortfolioRepository.updatePortfolio(portfolio)

		await this.transactionRepository.createTransaction({
			userId,
			gameId,
			stockSymbol,
			quantity,
			price,
			transactionType: 'buy'
		})
	}

	async sellStock(userId, gameId, stockSymbol, quantity) {
		const game = await this.gameRepository.findById(gameId)
		if (!game) throw new ApiError(404, 'Game not found')

		const now = new Date()
		if (now < game.startTime) {
			throw new ApiError(400, 'Cannot sell stocks before game starts')
		}
		if (now > game.endTime) {
			throw new ApiError(400, 'Cannot sell stocks after game ends')
		}
		const portfolio =
			await this.playerPortfolioRepository.findByUserIdAndGameId(userId, gameId)
		if (!portfolio) throw new ApiError(400, 'Portfolio not found')

		const stock = portfolio.stocks.find(
			(stock) => stock.stockSymbol === stockSymbol
		)
		if (!stock || stock.quantity < quantity)
			throw new ApiError(400, 'Not enough stock')

		const price = await this.fetchStockPrice(stockSymbol)
		portfolio.cash += quantity * price
		stock.quantity -= quantity
		if (stock.quantity === 0) {
			portfolio.stocks = portfolio.stocks.filter(
				(s) => s.stockSymbol !== stockSymbol
			)
		}
		await this.playerPortfolioRepository.updatePortfolio(portfolio)

		await this.transactionRepository.createTransaction({
			userId,
			gameId,
			stockSymbol,
			quantity,
			price,
			transactionType: 'sell'
		})
	}

	async fetchStockPrice(stockSymbol) {
		const url = `https://data.alpaca.markets/v2/stocks/${stockSymbol}/quotes/latest`
		const response = await fetch(url, {
			headers: {
				'APCA-API-KEY-ID': process.env.APCA_API_KEY_ID,
				'APCA-API-SECRET-KEY': process.env.APCA_API_SECRET_KEY
			}
		})

		if (!response.ok) {
			throw new Error('Failed to fetch stock price')
		}

		const data = await response.json()
		return data.quote.bp
	}

	async getPortfolio(userId, gameId) {
		const portfolio =
			await this.playerPortfolioRepository.findByUserIdAndGameId(userId, gameId)
		if (!portfolio) throw new ApiError(404, 'Portfolio not found')

		const stockSymbols = portfolio.stocks.map((stock) => stock.stockSymbol)

		const currentPrices = await fetchCurrentPricesForStocks(stockSymbols)

		const updatedStocks = portfolio.stocks.map((stock) => ({
			...stock,
			unitPrice: currentPrices[stock.stockSymbol],
			totalValue: currentPrices[stock.stockSymbol] * stock.quantity
		}))

		const totalStockValue = updatedStocks.reduce(
			(acc, stock) => acc + stock.totalValue,
			0
		)
		const totalPortfolioValue = portfolio.cash + totalStockValue

		return {
			...portfolio.toObject(),
			stocks: updatedStocks,
			totalStockValue,
			totalPortfolioValue
		}
	}

	async fetchMultipleStockPrices(symbols) {
		const url = `https://data.alpaca.markets/v2/stocks/quotes/latest?symbols=${symbols.toString()}&feed=iex`
		const response = await fetch(url, {
			headers: {
				'APCA-API-KEY-ID': process.env.APCA_API_KEY_ID,
				'APCA-API-SECRET-KEY': process.env.APCA_API_SECRET_KEY
			}
		})

		if (!response.ok) {
			throw new Error('Failed to fetch stock price')
		}

		const data = await response.json()
		const prices = {}

		Object.keys(data.quotes).forEach((symbol) => {
			const quote = data.quotes[symbol]
			prices[symbol] = quote.ap
		})

		return prices
	}
}

export default GameService
