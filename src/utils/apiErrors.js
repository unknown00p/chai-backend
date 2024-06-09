class apiErrorrs extends Error {
    constructor(
        statusCode,
        message = 'somthing went wrong',
        stack = '',
        errors = []
    ) {
        super(message)
        this.message = message
        this.data = null
        this.statusCode = statusCode
        this.success = false
        this.errors = errors;

        if (stack) {
            this.stack = stack
        }else{
            Error.captureStackTrace(this, this.constructor)
        }
    }

}

export{apiErrorrs}