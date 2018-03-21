var mongoose = require('mongoose');

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
module.exports = mongoose.model("Bar", barSchema);