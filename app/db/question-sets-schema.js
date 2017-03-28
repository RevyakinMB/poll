var mongoose = require('mongoose'),
	QuestionSetsModel,
	QuestionSets,
	Questions,
	Answers;
//require('./db');

// QuestionSet document schema
Answers = new mongoose.Schema({
	// TODO: default: () => new ObjectId() ?
	_id: mongoose.Schema.ObjectId,
	text: { type: String, required: true },
	weight: { type: Number, default: 0 }
});

Questions = new mongoose.Schema({
	_id: mongoose.Schema.ObjectId,
	text: { type: String, required: true },
	answers: {
		type: [Answers],
		required: true,
		// TODO: es2015
		// validate: (a) => a.length > 1;
		validate: [
			function(answers) {
				return answers.length > 1;
			},
			'Please specify at least two answers to question'
		]
	},
	theme: String
});

QuestionSets = new mongoose.Schema({
	questions: [Questions]
});


QuestionSetsModel = mongoose.model('QuestionSets', QuestionSets);

module.exports = QuestionSetsModel;
