import express from 'express'
import bodyParser from 'body-parser'

// routes
import userRoutes from './routes/user.routes.js'
import gameRoutes from './routes/game.routes.js'
import { errorHandler, notFound } from './middlewares/error.middleware.js'

const app = express()

// Middleware
app.use(bodyParser.json())

// Define routes
app.get('/', (req, res) => {
	res.send('Hello, World!')
})
app.use('/api/users', userRoutes)
app.use('/api/games', gameRoutes)
app.use(notFound)

app.use(errorHandler)

export default app
