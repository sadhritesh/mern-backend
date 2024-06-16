class ApiError extends Error {

    constructor (statusCode, message) {
        super(message)
        this.statusCode = statusCode 
        this.status = statusCode <= 400 ? "fail" : "error"
        this.message = message
    }
}

export default ApiError