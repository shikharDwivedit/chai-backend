const asyncHandler = (requestHandler) =>{
    return (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next)).catch((error) => next(error))
    }
}


export {asyncHandler}

// const asynchandler = () => {}
// const asynchandler = (func) => () => {}  !!Here we are passing func to another function, like this (func) => {() =>{}}   This is higher order function
// const asynchandler = (func) => async () => {}    Synatx for making higher order function to async and await.

// const asynchandler = (fn) => async (req,res,next) => {
//     try{
//         await fn(req,res,next)
//     }catch(error){
//         res.status(error.code || 500).json({
//             success:false,
//             message:error.message
//         })
//     }
// }