const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const Listing = require('../models/listing.js');
const methodOveride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingSchema} = require("../schema.js");
const Review = require("../models/review.js");
const {reviewSchema} = require("../schema.js");

app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));
app.use(express.static(path.join(__dirname,"public")));
app.use(express.urlencoded({extended:true}));
app.use(methodOveride("_method"));
app.engine("ejs",ejsMate);

main().then(()=>{
    console.log('connected to Db');
}).catch(err => console.log(err));

async function main(){
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}


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


const validateReview = (req,res,next)=>{
    let {error} = reviewSchema.validate(req.body);
    if(error){
        throw new ExpressError(400,error);
    }else{
        next();
    }
}

//Index Route
app.get("/listings",wrapAsync (async(req,res)=>{
    let allListings = await Listing.find();
    // console.log(data);
    res.render("listings/index.ejs",{allListings});
}));

//New Route
app.get("/listings/new",(req,res)=>{
    res.render('listings/new.ejs');
});

//Show Route
app.get("/listings/:id",wrapAsync (async(req,res)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs",{listing});
}));

//Create Route
app.post("/listings",validateListing,wrapAsync (async (req,res,next)=>{
    // if(!req.body.listing){
    //     throw new ExpressError(400,"Send Valid Data for Listing");
    // }

    // let result = listingSchema.validate(req.body);
    // if(result.error){                                    //MiddleWare for JOI is written above for Vaildations 
    //     throw new ExpressError(400,result.error);
    // }
    let {listing} = req.body;
    // console.log(listing);
    await Listing.insertOne(new Listing(listing));
    res.redirect('/listings');
    
}));

//Edit Route
app.get("/listings/:id/edit",wrapAsync (async(req,res)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
}));

//Update Route
app.put("/listings/:id",validateListing,wrapAsync (async(req,res)=>{
    // if(!req.body.listing){
    //     throw new ExpressError(400,"Send Valid Data for Listing");
    // }
    let {id} = req.params;
    let {listing} = req.body;
    let newListing = await Listing.findByIdAndUpdate(id,listing,{runValidators:true,new : true});
    // console.log(newListing);
    res.redirect(`/listings/${id}`);
}));

//Delete Route
app.delete("/listings/:id",wrapAsync (async(req,res)=>{
    let {id} = req.params;
    let listing = await Listing.findByIdAndDelete(id);
    console.log(listing);
    res.redirect(`/listings`);
}));



//Review Route
//Post Review
app.post("/listings/:id/reviews",validateReview,wrapAsync(async(req,res)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id);
    let{review} = req.body;
    review = new Review(review);
    listing.reviews.push(review);

    await review.save();
    await listing.save();

    res.redirect(`/listings/${id}`);
}));


//Delete Review
app.delete("/listings/:id/reviews/:reviewId",wrapAsync(async(req,res)=>{
    let{id,reviewId} = req.params;
    await Review.findByIdAndDelete(reviewId);
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

    res.redirect(`/listings/${id}`);
}));


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