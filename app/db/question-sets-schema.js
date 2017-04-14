var mongoose = require('mongoose'),
	QuestionSetsModel,
	QuestionSets,
	Questions,
	Answers;

// QuestionSet document schema
Answers = new mongoose.Schema({
	text: { type: String, required: true }
});

Questions = new mongoose.Schema({
	text: { type: String, required: true },
	qType: {
		type: String,
		enum: ['Single', 'Multiple', 'Sequence', 'Match'],
		required: true
	},
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
	name: { type: String, required: false },
	questions: [Questions]
});

QuestionSetsModel = mongoose.model('QuestionSets', QuestionSets);

module.exports = QuestionSetsModel;
