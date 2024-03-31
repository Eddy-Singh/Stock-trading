import { Schema, model } from 'mongoose'

const playerPortfolioSchema = new Schema({
	userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
	gameId: { type: Schema.Types.ObjectId, ref: 'Game', required: true },
	stocks: [
		{
			stockSymbol: { type: String, required: true },
			quantity: { type: Number, required: true, min: 0 }
		}
	],
	cash: { type: Number, required: true }
})

export default model('PlayerPortfolioSchema', playerPortfolioSchema)
