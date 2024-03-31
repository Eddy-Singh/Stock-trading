export class UserRepository {
	constructor(model) {
		this.model = model
	}

	async findById(id) {
		return this.model.findById(id).select('-password')
	}
	async findByEmail(email) {
		return this.model.findOne({ email })
	}

	async create(userDetails) {
		const user = await this.model.create(userDetails)
		return user
	}
}
