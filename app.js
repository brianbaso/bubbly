var express		= require('express'),
	app			= express(),
	bodyParser 	= require('body-parser'),
	mongoose	= require('mongoose')


// 1. connect to local database
mongoose.connect('mongodb://localhost/bubbly');

// 2. set up the schema
var barSchema = new mongoose.Schema({
	city: String,
	name: String,
	price: String,
	type: String,
	location: String,
	bubblyScore: Number
});

// 3. complile into a schema
var Bar = mongoose.model("Bar", barSchema);

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
				res.render('index', {bars: allBars, noMatch: noMatch});
			}
		});

	} else {
	// get all the campgrounds from the db
		Bar.find({}, function(err, allBars) {
			if (err) {
				console.log(err);
			} else {
				// data we pass through to the page
				res.render('index', {bars: allBars, noMatch: noMatch});
			}
		});
	}
	// Old hard-coded array way.. pass in the bars array with {bars: bars} 
	//res.render('bars', {bars: bars});
});

// form will send data to the POST route below
app.get('/bars/new', function(req, res) {
	res.render('new');
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
			res.redirect('/bars');
		}
	});
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

app.listen(3000, function() {
	console.log('Let the bubbles ensue...');
});