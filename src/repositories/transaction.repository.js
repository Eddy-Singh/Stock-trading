import transactionModel from '../models/transaction.model.js'

class TransactionRepository {
	constructor(model) {
		this.model = model
	}
	async createTransaction(data) {
		return await this.model.create(data)
	}
}

export default new TransactionRepository(transactionModel)
