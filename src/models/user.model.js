import mongoose, { Schema, model } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"



// We can't directly incrypt or decrypt data hence for that we use middle such as pre
// Which basically does something(anything which you want like hashing) before saving the data
const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true      //If we want to enable searching on any field then doing this is better option.
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        password: {
            type: String,
            required: [true,'Password is required'],
        },
        avatar: {
            type: String,   //We will use cloud service and put the file link here
            required: true,
        },
        coverImage: {
            type: String,   
        },
        watchHistory:[
            {
                type:Schema.Types.ObjectId,
                ref:"Video"
            }
        ],
        refreshToken:{
            type:String
        },
        isVerified: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps:true
    }
)

/*Point to note->
userSchema.pre("save", ()=>{})
We aren't using arrow function here because we want our middleware to run only certain field there we write function()
also function should be async cause saving and hashing will consume time*/

/* More theory 
if(!this.isModified("password")) return next();

Let's say somebody changes their avatar then save it, so this middleware will run again cause uncesseary hashing hence to prevent it we add
a condition that if the password isn't modified then move onto next don't exectue the code below*/
//Point to note .pre, .method have access to the document or instance being saved and this is pointer pointing to that specific document hence they are being used freely inside the function

userSchema.pre("save",async function(next) {
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password,10);       
    next();
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password);
}

userSchema.methods.generateAccessToken = function() {
    return jwt.sign(     //This function too has access to the document
        {
            _id:this._id,
            email:this.email,
            username:this.username,
            fullName:this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(     //This function too has access to the document
        {
            _id:this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


export const User = model("User", userSchema);