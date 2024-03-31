import dotenv from 'dotenv'
dotenv.config({ path: '.env.test' })
import { MongoMemoryServer } from 'mongodb-memory-server'

export default async () => {
	const mongoServer = await MongoMemoryServer.create()
	global.__MONGOD__ = mongoServer
	process.env.MONGO_URI = mongoServer.getUri() // Set the MONGO_URI environment variable
}
