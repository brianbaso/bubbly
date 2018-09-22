var express			= require('express'),
	app			= express(),
	bodyParser 		= require('body-parser'),
	mongoose		= require('mongoose'),
	flash			= require('connect-flash'),
	passport		= require('passport'),
	LocalStrategy		= require('passport-local'),
	methodOverride		= require('method-override'),
	Bar  			= require('./models/bar'),
	User 			= require('./models/user')

var barRoutes			= require('./routes/bars'),
	ratingRoutes		= require('./routes/ratings'),
	indexRoutes		= require('./routes/index')

// Connect to local db
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/bubbly');

// Serve static images, CSS, JS
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(flash());
app.set('view engine', 'ejs');

// Enable session
app.use(require('express-session')({
	secret: 'super secret',
	resave: false,
	saveUninitialized: false
}));

// Node module passport for auth
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Variable shortcuts
app.use(function (req, res, next) {
	res.locals.currentUser = req.user;
	res.locals.error = req.flash('error');
	res.locals.success = req.flash('success');
	next();
});
app.use(indexRoutes);
app.use(barRoutes);
app.use(ratingRoutes);

app.listen(3000, function() {
	console.log('Let the bubbles ensue...');
});
