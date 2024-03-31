import ApiError from '../utils/apiError.js'

export const notFound = (req, res, next) => {
	const error = new Error(`Not Found - ${req.originalUrl}`)
	res.status(404)
	next(error)
}

export const errorHandler = (err, req, res, next) => {
	if (err instanceof ApiError) {
		res
			.status(err.status)
			.json({
				error: err.message,
				stack: process.env.NODE_ENV === 'production' ? null : err.stack
			})
	} else {
		const statusCode = res.statusCode === 200 ? 500 : res.statusCode
		res.status(statusCode).json({
			error: err.message,
			stack: process.env.NODE_ENV === 'production' ? null : err.stack
		})
	}
}
