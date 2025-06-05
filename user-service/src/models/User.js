const monoose = require("mongoose");
const argon2 = require("argon2");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    }
}, {
    timestamps: true,
});

userSchema.pre("save", async function (next) {
    if(this.isModified("password")) {
        this.password = await argon2.hash(this.password);
    }
    next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    try{
        return await argon2.verify(this.password, candidatePassword);
    } catch (e) {
        console.error(e);
    }
}

userSchema.index({ username: 'text' });

const User = mongoose.model("User", userSchema);

module.exports = User;
