const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const {validateListing,isLoggedIn,isOwner} = require("../middleware.js");
const listingController = require("../controller/listing.js");
const multer = require("multer");
const {storage} = require("../cloudConfig.js");
const upload = multer({storage});


//Index Route //Create Route
router.route("/")
    .get(wrapAsync (listingController.index))
    .post(isLoggedIn,upload.single("listing[image]"),validateListing,wrapAsync (listingController.createListing));
    

//New Route
router.get("/new",isLoggedIn,listingController.renderNewForm);

//Show Route //Update Route //Delete Route
router.route("/:id")
    .get(wrapAsync (listingController.showListing))
    .put(isLoggedIn,isOwner,upload.single("listing[image]"),validateListing,wrapAsync (listingController.updateListing))
    .delete(isLoggedIn,isOwner,wrapAsync (listingController.deleteListing));

//Edit Route
router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync (listingController.renderEditForm));

module.exports = router;