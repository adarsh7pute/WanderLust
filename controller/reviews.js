const Listing = require('../models/listing');
const Review = require("../models/review.js");

module.exports.createReview = async(req,res)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id);
    let{review} = req.body;
    review = new Review(review);
    listing.reviews.push(review);
    review.author = req.user._id;
    await review.save();
    await listing.save();
    req.flash("success","New Review Created!");
    res.redirect(`/listings/${id}`);
};

module.exports.deleteReview = async(req,res)=>{
    let{id,reviewId} = req.params;
    await Review.findByIdAndDelete(reviewId);
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

    req.flash("success","Review Deleted!");
    res.redirect(`/listings/${id}`);
};