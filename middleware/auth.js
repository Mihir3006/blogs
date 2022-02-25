require('dotenv').config()
const jwt = require("jsonwebtoken");
const User = require("../models/users");

const auth = async(req, res, next) => {
    // console.log("i am middleware");
    try {
        const token = req.cookies.jwt;
        const verifyUser = jwt.verify(token, process.env.SECRET_KEY);
        // console.log(verifyUser);

        const user = await User.findOne({_id:verifyUser._id})
        // console.log(user.UN);

        req.token = token;
        req.user = user;

        next();
    } catch (error) {
        res.status(401).send("You are not Autherized Pls. login");
    }
    
}

module.exports = auth;