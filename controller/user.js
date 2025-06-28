const User = require("../models/user");

module.exports.renderSignUpForm = (req,res)=>{
    res.render("users/signup.ejs")
};


module.exports.signUp = async(req,res)=>{
    try {
        let {username,email,password} = req.body;
        const newUser = new User({username,email});
        const resgisterUser = await User.register(newUser,password);
        console.log(resgisterUser);
        req.login(resgisterUser,(err)=>{
            if(err){
                return next(err);
            }  
            req.flash("success","Welcome to WanderLust!");
            res.redirect("/listings");
        });
        
    } catch (error) {
        req.flash("error",error.message);
        res.redirect("/signup");
    }
    
};

module.exports.renderLoginForm = (req,res)=>{
    res.render("users/login.ejs");
};

module.exports.login = async(req,res)=>{
    req.flash("success","Welcome back to WanderLust!");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};

module.exports.logout = (req,res)=>{
    req.logOut((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","Logged out successfully");
        res.redirect("/listings");
    });
};