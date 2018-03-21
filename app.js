var express			= require('express'),
	app				= express(),
	bodyParser 		= require('body-parser'),
	mongoose		= require('mongoose'),
	passport		= require('passport'),
	LocalStrategy	= require('passport-local'),
	Bar  			= require('./models/bar'),
	User 			= require('./models/user')


// 1. connect to local database
mongoose.connect('mongodb://localhost/bubbly');

// Passport config
app.use(require('express-session')({
	secret: 'super secret',
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function (req, res, next) {
	res.locals.currentUser = req.user;
	next();
});

// Bar.create(
// 	{city: "miami", name: "Eleven", price: "$$$$", type: "🍺club", location: "south beach", bubblyScore: 4.2},
// 	function(err, bar) {
// 		if (err) {
// 			console.log(err);
// 		} else {
// 			console.log('Created new bar!');
// 			console.log(bar);
// 		}
// 	});

// EJS shortcut
app.set('view engine', 'ejs');

// Serve static images, CSS, JS
app.use(express.static('public'));

// tell express to use bodyparser
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', function(req, res) {
	res.render('landing');
});

// INDEX route: show all campgrounds
app.get('/bars', function(req, res) {
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
	// Old hard-coded array way.. pass in the bars array with {bars: bars} 
	//res.render('bars', {bars: bars});
});

// SHOW route: show individual bar
app.get('/bars/:id', function(req, res) {
	// find the bar with provided id
	Bar.findById(req.params.id, function(err, foundBar) {
		if (err) {
			console.log(err);
		} else {
			res.render('show', {bar: foundBar});
		}
	});
	// render show template with that bar
});

// form will send data to the POST route below
app.get('/bars/new', function(req, res) {
	res.render('new');
});

// POST route: so user can add bars & clubs
app.post('/bars', function (req, res) {
	// get data from form and add to bars array
	var city = req.body.city;
	var name = req.body.name;
	var price = req.body.price;
	var type = req.body.type;
	var location = req.body.location;
	var bubblyScore = req.body.bubblyScore;
	var newBar = {city: city, name: name, price: price, type: type, location: location, bubblyScore: bubblyScore}

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

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

// ===============
// Auth Routes
// ===============

// show register form
app.get('/register', function(req, res) {
	res.render('register');
});

// Handle signup logic
app.post('/register', function(req, res) {
	var newUser = new User({username: req.body.username});
	User.register(newUser, req.body.password, function(err, user) {
		if (err) {
			console.log(err);
			return res.render('register');
		}
		passport.authenticate('local')(req, res, function() {
			res.redirect('/bars');
		});
	});
});

// Login form
app.get('/login', function(req, res) {
	res.render('login');
});

// Handle login logic
app.post('/login', passport.authenticate('local', 
	{
		successRedirect: '/bars',
		failureRedirect: '/login'
	}), function(req, res) {

});

// Logout route
app.get('/logout', function(req, res) {
	req.logout();
	res.redirect('bars');
});

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/login');
}

app.listen(3000, function() {
	console.log('Let the bubbles ensue...');
});