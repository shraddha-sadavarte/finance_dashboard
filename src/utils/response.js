//every api should return response in consistent format
export const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    })
}

export const sendError = (res, error, message = "Something went wrong", statusCode = 500) => {
    return res.status(statusCode).json({
        success: false,
        message,
        data: null
    })
}

export const sendPaginated = (res, data, total, page, limit, message = 'Success') => {
    return res.status(200).json({
        success: true,
        message,
        data,
        pagination: {
            total, page, limit, totalPages: Math.ceil(total/limit), hasNext: page*limit<total, hasPrev: page>1,
        }
    })
}
