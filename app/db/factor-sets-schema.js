var mongoose = require('mongoose'),
	FactorSetsModel,
	Matches,
	Factors,
	FactorSets;

Matches = new mongoose.Schema({
	sten: {
		type: String,
		required: true
	},
	rawSum: {
		type: Number,
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

FactorSets = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		unique: true
	},
	factors: {
		type: [Factors],
		required: true
	}
});

FactorSetsModel = mongoose.model('FactorSets', FactorSets);

module.exports = FactorSetsModel;
