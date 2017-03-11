


var lwipJpegAutorotate = require('lwip-jpeg-autorotate');
 
var cloudinary = require('cloudinary').v2;
var express     =   require("express");
var multer      =   require('multer');
var router      =   express.Router();
var Campground  =   require("../models/campground");
var middleware  =   require("../middleware/index.js");
var Comment     = require("../models/comment");

var storage =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './public/uploads
    console.log("first");
  },
  filename: function (req, file, callback) {
    callback(null, Date.now() + file.originalname);
    console.log("this happened");
  }
});
var upload = multer({ storage : storage}).single('image');

console.log("then this");






//Index - show  all Campgrounds
router.get("/", function(req, res) {
        //Get all campgrounds from DB
        Campground.find({}, function(err, allcampgrounds){
            if(err){
                console.log(err);   
            } else{
                res.render("campgrounds/index",{campgrounds:allcampgrounds, currentUser: req.user});
            }
        });
});

//Create - add new Campground to database
router.post("/", middleware.isLoggedIn, function(req, res){
    
     upload(req,res,function(err) {
        if(err) {
            return res.end("Error uploading file.");
        }
        //get data from form and add to campgrounds array
        var name = req.body.name;
        var image = '/uploads/' + req.file.filename;
        var desc = req.body.description;
        var author = {
            id: req.user._id,
            username: req.user.username
        }
        var newCampground = {name: name, image: image, description: desc, author: author}
        //Create a new campground and save to DB
        Campground.create(newCampground, function(err, newlyCreated){
            if(err){
                console.log(err);
            } else{
                //redirect back to campgrounds page
                res.redirect("/campgrounds");       
            }
        });
     });
});

//New - show form to create new Campground
router.get("/new", middleware.isLoggedIn, function(req, res) {
    res.render("campgrounds/new");
});

//Show - shows more info about one campground
router.get("/:id", function(req, res) {
    //find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err){
            console.log(err);
        }
        else{
            console.log(foundCampground);
            //render show template with that Campground
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});

//Edit Campground Route
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req,res){
    // is user logged in
    Campground.findById(req.params.id, function(err, foundCampground){
        res.render("campgrounds/edit", {campground: foundCampground});
    });
});

//Update Campground Route
router.put("/:id", middleware.checkCampgroundOwnership, function(req,res){
    //find and update the correct campground
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
        if(err){
            res.redirect("/campgrounds");
        }
        else{
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
    //redirect somewhere(show page)
});

//Destroy Campground Route
router.delete("/:id", middleware.checkCampgroundOwnership, function(req,res){
    Campground.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/campgrounds");
        }
        else{
            res.redirect("/campgrounds");
        }
    });
});

module.exports=router;