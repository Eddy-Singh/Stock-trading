import { Schema, model } from 'mongoose'

const userSchema = new Schema(
	{
		email: {
			type: String,
			required: true,
			unique: true
		},
		password: {
			type: String,
			required: true
		},
		role: { type: String, enum: ['player', 'admin'], default: 'player' }
		// Additional fields as necessary
	},
	{ timestamps: true }
)

export default model('User', userSchema)
