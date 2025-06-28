const Listing = require("../models/listing");

module.exports.index = async(req,res)=>{
    let allListings = await Listing.find();
    // console.log(data);
    res.render("listings/index.ejs",{allListings});
};

module.exports.renderNewForm = (req,res)=>{
    res.render('listings/new.ejs');
};

module.exports.showListing = async(req,res)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id).populate({path:"reviews",populate:{path:"author"}}).populate("owner");
    if(!listing){
        req.flash("error","Listing you requested does not exist!");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs",{listing});
};

module.exports.createListing = async (req,res,next)=>{
    // if(!req.body.listing){
    //     throw new ExpressError(400,"Send Valid Data for Listing");
    // }

    // let result = listingSchema.validate(req.body);
    // if(result.error){                                    //MiddleWare for JOI is written above for Vaildations 
    //     throw new ExpressError(400,result.error);
    // }
    let url = req.file.path;
    let filename = req.file.filename;
    let {listing} = req.body;
    listing.owner = req.user._id;
    listing.image = {url,filename};
    // console.log(listing);
    await Listing.insertOne(new Listing(listing));
    req.flash("success","New Listing Created!");
    res.redirect('/listings');
    
};

module.exports.renderEditForm  = async(req,res)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing you requested does not exist!");
        return res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload","/upload/w_250");
    res.render("listings/edit.ejs",{listing,originalImageUrl});
};

module.exports.updateListing = async(req,res)=>{
    // if(!req.body.listing){
    //     throw new ExpressError(400,"Send Valid Data for Listing");
    // }
    let {id} = req.params;
    let {listing} = req.body;
    let newListing = await Listing.findByIdAndUpdate(id,listing,{runValidators:true,new : true});

    if(typeof req.file !=='undefined'){
        let url = req.file.path;
        let filename = req.file.filename;
        newListing.image = {url,filename};
        await newListing.save();
    }
    
    // console.log(newListing);

    req.flash("success","Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async(req,res)=>{
    let {id} = req.params;
    let listing = await Listing.findByIdAndDelete(id);
    console.log(listing);
    req.flash("success","Listing Deleted!");
    res.redirect(`/listings`);
};

