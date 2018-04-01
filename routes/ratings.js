var express = require('express');
var router = express.Router({mergeParams: true});
var Bar = require('../models/bar');
var Rating = require('../models/rating');
var middleware = require('../middleware');

router.post('/bars/:id/ratings', middleware.isLoggedIn, middleware.checkRatingExists, function(req, res) {
	Bar.findById(req.params.id, function(err, bar) {
		if (err) {
			console.log(err);
		} else if (req.body.rating) {
			Rating.create(req.body.rating, function(err, rating) {
				if (err) {
					console.log(err);
				}
				console.log(rating);
				rating.author.id = req.user._id;
				rating.author.username = req.user.username;
				rating.save();
					bar.ratings.push(rating);
					bar.save();
					req.flash('success', 'Sucessfully added rating');
				});
		} else {
				req.flash('error', 'Please select rating');
		}
		res.redirect('/bars/' + bar._id);
	});
});

module.exports = router;