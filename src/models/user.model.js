import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = mongoose.Schema( {
    username : {
        type: String,
        required: true,
        unique: true,
        trim: true, 
        lowercase: true,
        index: true 
    },
    email : {
        type: String,
        required: true,
        unique: true,
        trim: true, 
        lowercase: true,
        index: true
    },
    password : {
        type: String,
        required: true 
    },
    profilePicture : {
        type: String,
        default : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
    },
    refreshToken : {
        type: String,
        default: ""
    },
    isAdmin : {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
})


userSchema.pre("save", function (next) {
    
    if(!this.isModified("password")) {
        return next()
    };
    
    this.password = bcrypt.hashSync(this.password, 10)
    next()
}
)

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = async function () {
    
    return jwt.sign(
        {
            _id : this._id
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken =  async function () {

    return jwt.sign(
        {
            _id : this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}
const User = mongoose.model( "User", userSchema )

export default User