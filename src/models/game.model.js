import { Schema, model } from 'mongoose'

const gameSchema = new Schema(
	{
		name: { type: String, required: true },
		startTime: { type: Date, required: true },
		endTime: { type: Date, required: true },
		initialAmount: { type: Number, required: true },
		players: [{ type: Schema.Types.ObjectId, ref: 'User' }]
	},
	{ timestamps: true }
)

export default model('Game', gameSchema)
