class ApiError extends Error{
    constructor(status,
        errorMessage = "Something went wrong",
        errors= [],
        stack= ""
    ){
        super(errorMessage);
        this.status = status;
        this.data = null;
        this.message = errorMessage;
        this.success = false;
        this.errors = errors;
        
        if(stack){
            this.stack= stack;
        }else{
            Error.captureStackTrace(this, this.constructor)
        }
    }
}


export {ApiError}