export class GameRepository {
	constructor(model) {
		this.model = model
	}

	async create(gameData) {
		return this.model.create(gameData)
	}

	async findAll(skip = 0, limit = 10) {
		return this.model.find({}).skip(skip).limit(limit)
	}

	async count() {
		return this.model.countDocuments()
	}

	async findById(id) {
		return this.model.findById(id)
	}

	async updateGame(game) {
		return await game.save()
	}
	async addPlayer(gameId, userId) {
		const game = this.model.findById(gameId)
		if (!game) {
			throw new Error('Game not found')
		}
		if (!game.players.includes(userId)) {
			game.players.push(userId)
			await game.save()
		}
		return game
	}
}
