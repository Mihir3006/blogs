require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");
const User = require("./models/users");
const jwt = require("jsonwebtoken");
const cookieParser = require('cookie-parser');
const auth = require("./middleware/auth");
const port = process.env.PORT || 3000;
const uri = process.env.MONGODB_URI;

const app = express();

app.set('view engine', 'ejs');
app.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

//connection with db
mongoose.connect(process.env.DATA_BASE, {
    useNewUrlParser: true
})

const itemsSchema = new mongoose.Schema({
    title: String,
    post: String
})

//define models for blogs
const Item = mongoose.model("Item", itemsSchema);

app.get("/", (req, res) => {    //rendering home page
    res.render("home")
})

app.get("/about", (req, res) => {   //rendering about page
    res.render("about")
})

app.get("/signup", (req, res) => {  //rendering signup page
    res.render("signup")
})

app.get("/login", (req, res) => {
    res.render("login")
})

app.get("/error", (req, res) => {
    res.render("erroe")
})

app.get("/show/:id", auth, (req, res) => {
    // console.log(`this is awesome cookie ${req.cookies.jwt}`);
    const id = req.params.id;
    const useremail = User.findOne({ _id: id }, (err, found) => {
        if (err) {
            // console.log(err);
        } else {
            // console.log(found.PW);
            const name = found.details.Name; //obtaining id of docs
            res.render("blogs", { user: name, number: id, yourPost: found.blogs });
        }
    });

})

app.get("/logout", auth, async (req,res) => {
    try {
        // console.log(req.user);

        // single logout
        // req.user.tokens = req.user.tokens.filter((currElement) => {
        //     return currElement.token !== req.token
        // })

        req.user.tokens = [];

        res.clearCookie('jwt');
        // console.log("logout sucessful");
        await req.user.save();
        res.render("login");
        
    } catch (error) {
        res.render("erroe");
    }
})

//inserting data to db
app.post("/signup", async (req, res) => {
    try {
        const first = req.body.firstname;
        const last = req.body.last;
        const mail = req.body.mail;
        const pass = req.body.pass;
        const cpass = req.body.cpass;
        if (pass === cpass) {
            // console.log(first, last,mail,pass,cpass);
            const user = new User({
                UN: mail,
                PW: pass,
                CPW: cpass,
                details: {
                    Name: first,
                    LName: last
                }
            });

            // console.log("the sucess part" + user);

            const token = await user.generateAuthToken();
            // console.log("the token part is" + token);

            res.cookie("jwt", token, ({
                expires: new Date(Date.now() + 30000),
                httpOnly: true,
                
            }))

            //password hash middelware in models schema
            const newuser = await user.save();
            // console.log("the page part" + newuser);

            //rendering from compose to home
            res.redirect("/")
        } else {
            res.redirect("error");
        }

    } catch (error) {
        res.redirect("error");
    }

});

//login
app.post("/login", async (req, res) => {
    try {
        const email = req.body.usermail;
        const password = req.body.userpas;

        const useremail = await User.findOne({ UN: email });
        
        const isMatch = await bcrypt.compare(password, useremail.PW);

        const token = await useremail.generateAuthToken();
        // console.log("the token part is" + token);

        res.cookie("jwt", token, ({
            expires: new Date(Date.now() + 600000),
            httpOnly: true,
            // secure:true
        }))

        if (isMatch) {
            console.log("sucess");
            const ID = useremail._id; //obtaining id of docs
            res.redirect("/show/" + ID);
        } else {
            res.status(201).render("erroe");
        };
    } catch (error) {
        res.status(400).send(error);
    }
});


//blog post codes
app.post("/show/:id", auth, (req, res) => {
    const title = req.body.title;
    const post = req.body.blogpost;
    const name = req.body.blogname;
    // console.log(title, post, name);
    const blog = new Item({
        title: title,
        post: post
    });
    // console.log(blog);
    User.findOne({ _id: name }, (err, found) => {
        
            found.blogs.push(blog);
            found.save();
            res.redirect("/show/" + name);
        
    })
})

//delete a post
app.post("/delete", auth,(req, res) => {
    const userid = req.body.blogname;
    const blogid = req.body.postid;
    // console.log(userid, blogid);
    User.findOneAndUpdate({ _id: userid }, { $pull: { blogs: { _id: blogid } } }, (err, found) => {
        if (!err) {
            // console.log("item deleted");
            res.redirect("/show/" + userid);
        }
        else {
            res.redirect("error");
        }
    })
})

app.listen(port, function () {
    console.log(`Server started on port  ${port}`);
});