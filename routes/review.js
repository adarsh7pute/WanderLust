const express = require("express");
const router = express.Router({mergeParams:true});
const wrapAsync = require("../utils/wrapAsync");
const Listing = require('../models/listing');
const Review = require("../models/review.js");
const {validateReview,isLoggedIn,isReviewAuthor} = require("../middleware.js");
const reviewController = require("../controller/reviews.js");


//Review Route
//Post Review
router.post("/",isLoggedIn,validateReview,wrapAsync(reviewController.createReview));


//Delete Review
router.delete("/:reviewId",isLoggedIn,isReviewAuthor,wrapAsync(reviewController.deleteReview));


module.exports = router;