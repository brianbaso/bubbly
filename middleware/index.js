var Bar = require('../models/bar');
var Rating = require('../models/rating');

var middlewareObj = {};

middlewareObj.checkBarOwnership = function(req, res, next) {
	if (req.isAuthenticated()) {
		Bar.findById(req.params.id, function(err, foundBar) {
			if (err) {
				req.flash('error', 'Location not found.');
				res.redirect('back');
			} else {
				if (foundBar.author.id.equals(req.user._id)) {
					next();
				} else {
					req.flash('error', 'You do not have permission to do that.');
					res.redirect('back');
				}
			}
		});
	} else {
		req.flash('error', 'You must be logged in to do that.');
		res.redirect('back');
	}
}

middlewareObj.checkRatingExists = function(req, res, next) {
	Bar.findById(req.params.id).populate('ratings').exec(function(err, bar) {
		if (err) {
			console.log(err);
		}
		for (var i = 0; i < bar.ratings.length; i++) {
			if (bar.ratings[i].author.id.equals(req.user._id)) {
				req.flash('success', 'You already rated this!');
				return res.redirect('/bars/' + bar._id);
			}
		}
		next();
	})
}

middlewareObj.isLoggedIn = function(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	req.flash('error', 'You must be logged in to do that.');
	res.redirect('/login');
}

module.exports = middlewareObj;