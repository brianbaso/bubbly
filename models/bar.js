var mongoose = require('mongoose');

// 2. set up the schema
var barSchema = new mongoose.Schema({
	city: String,
	name: String,
	price: String,
	type: String,
	location: String,
	bubblyScore: Number,
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		username: String
	},
	ratings: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Rating"
		}
	],
	rating: { type: Number, default: 0 }
});

// 3. complile into a schema
module.exports = mongoose.model("Bar", barSchema);