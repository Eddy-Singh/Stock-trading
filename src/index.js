import { connect } from 'mongoose'
import dotenv from 'dotenv'
import app from './app.js'
dotenv.config()

const PORT = process.env.PORT || 3000

connect(process.env.MONGODB_URI)
	.then(() => {
		console.log('Connected to MongoDB...')
		app.listen(PORT, () => {
			console.log(`Server is running on port ${PORT}`)
		})
	})
	.catch((err) => console.error('Could not connect to MongoDB...', err))
