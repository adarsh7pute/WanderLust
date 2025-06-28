const Listing = require("./models/listing");
const Review = require("./models/review.js");
const {listingSchema,reviewSchema} = require("./schema.js");
const ExpressError = require("./utils/ExpressError");

//Validate Middleware for Server Side Listing Validations
const validateListing = (req,res,next)=>{
    let{error} = listingSchema.validate(req.body);
    if(error){
        //console.log(error);
        //let errMsg = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,error);
    }else{
        next();
    }
}

//Validate Middleware for Server Side of Review Validations
const validateReview = (req,res,next)=>{
    let {error} = reviewSchema.validate(req.body);
    if(error){
        throw new ExpressError(400,error);
    }else{
        next();
    }
}

const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be Logged in");
        return res.redirect("/login");
    }
    next();
};

const saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl; 
    }
    next();
};


const isOwner = async (req, res, next) => {
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner._id.equals(res.locals.currUser._id)){
        req.flash("error","You don't have permission for this!");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

const isReviewAuthor = async (req, res, next) => {
    let {id,reviewId} = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author._id.equals(res.locals.currUser._id)){
        req.flash("error","You don't have permission for this!");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

module.exports = {validateListing, validateReview, isLoggedIn, saveRedirectUrl, isOwner, isReviewAuthor};
