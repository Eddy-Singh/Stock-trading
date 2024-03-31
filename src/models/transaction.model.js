import { Schema, model } from 'mongoose'

const stockTransactionSchema = new Schema({
	userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
	gameId: { type: Schema.Types.ObjectId, ref: 'Game', required: true },
	stockSymbol: { type: String, required: true },
	quantity: { type: Number, required: true },
	price: { type: Number, required: true },
	transactionType: { type: String, enum: ['buy', 'sell'], required: true },
	transactionDate: { type: Date, default: Date.now }
})

export default model('StockTransaction', stockTransactionSchema)
