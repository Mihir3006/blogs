require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken")

const itemsSchema = new mongoose.Schema({
    title: String,
    post: String
})

//define schema
const blogSchema = new mongoose.Schema({
    UN: {
        type: String,
        unique: [true, "already exist"],
    },
    PW: {
        type: String,
        min: [5, "good"],
        max: [9, "strong"]
    },
    CPW: {
        type: String
    },
    details: {
        Name: String,
        LName: String
    },
    blogs: [itemsSchema],
    tokens:[{
        token:{
            type: String,
            required: true
        }
    }]
});

//generating tokens
blogSchema.methods.generateAuthToken = async function(){
    try {
        console.log(this._id);
        const token = jwt.sign({_id:this._id.toString()}, process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({token:token})
        await this.save();
        return token
    } catch (error) {
        res.send("the error part" + error);
        // console.log("the error part" + error);
    }
}

//pas hashing middleware
blogSchema.pre("save", async function (next) {

    if (this.isModified("PW")) {  
       // console.log(`the current password is ${this.PW}`);
        this.PW = await bcrypt.hash(this.PW, 10);
        this.CPW = await bcrypt.hash(this.PW, 10);
        // this.CPW = undefined  not saving field
       // console.log(`the current password is ${this.PW}`);
    }

    next();
})

//define models
const User = mongoose.model("User", blogSchema);

module.exports = User;
// exports.Item = Item;