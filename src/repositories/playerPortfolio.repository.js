export class PlayerPortfolioRepository {
	constructor(model) {
		this.model = model
	}
	async createPortfolio(data) {
		return await this.model.create(data)
	}

	async findByUserIdAndGameId(userId, gameId) {
		return await this.model.findOne({ userId, gameId })
	}

	async updatePortfolio(portfolio) {
		return await portfolio.save()
	}
}
