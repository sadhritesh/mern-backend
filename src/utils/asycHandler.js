
const asyncHandler = (requestHandler) => {

    return async (req,res,next) => {
        try {
            await requestHandler(req, res, next)
        } catch (error) {
            console.log("Error occured while handling request", error);
            return res 
            .status(error.statusCode)
            .json({
                success: false,
                statusCode: error.statusCode,
                message: error.message
        })
    }
}
}

export default asyncHandler