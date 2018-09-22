var express		= require('express');
	router		= express.Router();
	Bar 		= require('../models/bar');
	middleware 	= require('../middleware');

// INDEX route: show all campgrounds
router.get('/bars', function(req, res) {
	var noMatch = null;

	if (req.query.search) {
		const regex = new RegExp(escapeRegex(req.query.search), 'gi');

		Bar.find({city: regex}, function(err, allBars) {
			if (err) {
				console.log(err);
			} else {
				if (allBars.length < 1) {
					noMatch = "Nothing was found, please try again!";
				}
				// data we pass through to the page
				res.render('index', {bars: allBars, req: req, noMatch: noMatch});
			}
		});

	} else {
	// get all the campgrounds from the db
		Bar.find({}, function(err, allBars) {
			if (err) {
				console.log(err);
			} else {
				req = null;
				// data we pass through to the page
				res.render('index', {bars: allBars, req: req, noMatch: noMatch});
			}
		});
	}
});

// CREATE route: user can add bars & clubs
router.post('/bars', middleware.isLoggedIn, function (req, res) {
	// get data from form and add to bars array
	var city = req.body.city;
	var name = req.body.name;
	var price = req.body.price;
	var type = req.body.type;
	var location = req.body.location;
	var bubblyScore = req.body.bubblyScore;
	var author = {
		id: req.user._id,
		username: req.user.username
	}
	var newBar = {city: city, name: name, price: price, type: type, location: location, bubblyScore: bubblyScore, author: author}

	// Create a new bar, save it to the database
	Bar.create(newBar, function(err, newlyCreated) {
		if (err) {
			console.log(err);
		} else {
			// redirect to bars page
			res.redirect('/bars?search=' + city);
		}
	});
});

// NEW: form will send data to the POST route below
router.get('/bars/new', middleware.isLoggedIn, function(req, res) {
	res.render('new');
});


// SHOW route: show individual bar
router.get('/bars/:id', function(req, res) {
	// find the bar with provided id
	Bar.findById(req.params.id).populate('ratings').exec(function(err, foundBar) {
		if (err) {
			console.log(err);
		} else {
			if (foundBar.ratings.length > 0) {
				var ratings = [];
				var length = foundBar.ratings.length;
				foundBar.ratings.forEach(function(rating) {
					ratings.push(rating.rating)
				});
				var rating = ratings.reduce(function(total, element) {
					return total + element;
				});
				foundBar.rating = rating / length;
				foundBar.save();
				console.log('hey');
			}
			console.log('Ratings:', foundBar.ratings);
			console.log('Rating:', foundBar.rating);
			res.render('show', {bar: foundBar});
		}
	});
	// render show template with that bar
});

// EDIT: edit bars 
router.get('/bars/:id/edit', middleware.checkBarOwnership, function(req, res) {
	Bar.findById(req.params.id, function(err, foundBar) {
		res.render('edit', {bar: foundBar});
	});
});

// UPDATE (PUT): update bars 
router.put('/bars/:id', middleware.checkBarOwnership, function(req, res) {
	Bar.findByIdAndUpdate(req.params.id, req.body.bar, function(err, updatedBar) {
		if (err) {
			console.log(err);
			res.redirect('/bars');
		} else {
			// how to pass in bar.city?
			res.redirect('/bars?search=' + req.body.bar.city);
		}
	});
});

// DELETE: remove bars
router.delete('/bars/:id', middleware.checkBarOwnership, function(req, res) {
	Bar.findByIdAndRemove(req.params.id, function(err) {
		if (err) {
			res.redirect('/bars');
		} else {
			res.redirect('/bars');
			
		}
	});
});


function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;
