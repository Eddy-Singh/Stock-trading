export default async () => {
	if (global.__MONGOD__) {
		await global.__MONGOD__.stop()
	}
}
