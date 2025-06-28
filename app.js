if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOveride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

// const MongoURL = 'mongodb://127.0.0.1:27017/wanderlust';
const dbUrl = process.env.ATLASDB_URL;


//Routes require
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const searchRouter = require("./routes/search.js");

app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));
app.use(express.static(path.join(__dirname,"public")));
app.use(express.urlencoded({extended:true}));
app.use(methodOveride("_method"));
app.engine("ejs",ejsMate);


const store = MongoStore.create({ 
    mongoUrl: dbUrl,
    crypto:{
        secret:process.env.SECRECT,
    },
    touchAfter:24*3600
});

store.on('error',()=>{
    console.log("Error in MONGO SESSION STORE",err);
});

const sessionOptions = {
    store,
    secret:process.env.SECRECT,
    resave: false,
    saveUninitialized : true,
    cookie:{
        expires : Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge : 7 * 24 * 60 * 60 * 1000,
        httpOnly : true
    }
};

main().then(()=>{
    console.log('connected to Db');
}).catch(err => console.log(err));

async function main(){
    await mongoose.connect(dbUrl);
}

app.get("/",(req,res)=>{
    res.redirect("/listings");
});


app.use(session(sessionOptions));
app.use(flash());

//MiddleWare for Passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//Middleware for flash
app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});


//Routes
app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/search",searchRouter);
app.use("/",userRouter);



app.use((req, res, next) => {
    next(new ExpressError(404, "PAGE NOT FOUND"));
});


app.use((err,req,res,next)=>{
    let{status=500,message="Something Went Wrong"} = err;
    res.status(status).render("error.ejs",{err});
});

app.listen(8080,()=>{
    console.log(`App is Listening at port 8080`);
});