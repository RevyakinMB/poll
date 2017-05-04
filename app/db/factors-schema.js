var mongoose = require('mongoose'),
	FactorsModel,
	Matches,
	Factors;

Matches = new mongoose.Schema({
	sten: {
		type: String,
		required: true
	},
	rawSum: {
		type: Number,
		required: true,
		validate: [
			function(value) {
				return value > -1
			},
			'Please specify positive sum value'
		]
	}
});

Factors = new mongoose.Schema({
	index: {
		type: String,
		required: true
	},
	namePositive: {
		type: String,
		required: true
	},
	nameNegative: {
		type: String
	},
	matches: {
		type: [Matches],
		required: true
	}
});

FactorsModel = mongoose.model('Factors', Factors);

module.exports = FactorsModel;
