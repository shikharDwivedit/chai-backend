class ApiError extends Error{
    constructor(status,
        errorMessage = "Something went wrong",
        errors= [],
        stack= ""
    ){
        super(message);
        this.status = status;
        this.data = null;
        this.message = this.message;
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