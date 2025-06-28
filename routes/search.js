const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const Listing = require("../models/listing");

// router.get("/",wrapAsync(async(req,res)=>{
//     let key = req.query.destination;
//     const searchResults = await Listing.find({
//         $or: [
//             { country: { $regex: key, $options: "i" } },
//             { location: { $regex: key, $options: "i" } },
//             { title : { $regex: key, $options: "i" }}
//         ]
//     });
//     if(searchResults.length===0){
//         req.flash("error","Search reasults for ${key} does not exists!");
//         return res.redirect("/listings");
//     }
//     req.flash("success",`Search reasults for ${key}!`);
//     res.render("listings", { allListings:searchResults });
// }));

router.get("/", wrapAsync(async (req, res) => {
    const key = req.query.destination;

    const searchResults = await Listing.find({
        $or: [
            { country: { $regex: key, $options: "i" } },
            { location: { $regex: key, $options: "i" } },
            { title: { $regex: key, $options: "i" } },
            { description: { $regex: key, $options: "i" } }
        ]
    });

    if (searchResults.length == 0  || key.length<=2) {
        req.flash("error", `Search results for '${key}' do not exist!`);
        return res.redirect("/listings");
    }

    // Save search results temporarily in session
    req.session.searchResults = searchResults;
    req.flash("success", `Search results for '${key}'`);

    res.redirect("/search/results");
}));

router.get("/results", (req, res) => {
    if (!req.session.searchResults) {
        // If user refreshed or came directly, redirect to listings
        return res.redirect("/listings");
    }
    const results = req.session.searchResults || [];
    delete req.session.searchResults;

    res.render("listings/index", { allListings: results });
});

module.exports = router;