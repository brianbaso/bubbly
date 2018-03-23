var express			= require('express'),
	app				= express(),
	bodyParser 		= require('body-parser'),
	mongoose		= require('mongoose'),
	passport		= require('passport'),
	LocalStrategy	= require('passport-local'),
	Bar  			= require('./models/bar'),
	User 			= require('./models/user')

var barRoutes		= require('./routes/bars'),
	indexRoutes		= require('./routes/index')

mongoose.connect('mongodb://localhost/bubbly');
// Serve static images, CSS, JS
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');

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

app.use(indexRoutes);
app.use(barRoutes);

app.listen(3000, function() {
	console.log('Let the bubbles ensue...');
});