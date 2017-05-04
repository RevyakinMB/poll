var mongoose = require('mongoose'),
	QuestionSetsModel,
	QuestionSets,
	Questions,
	Answers;

// QuestionSet document schema
Answers = new mongoose.Schema({
	text: {
		type: String,
		required: true
	},
	weight: {
		type: Number
	},
	// used when Question.qType === 'Match'
	matchPosition: {
		type: String,
		enum: ['left', 'right']
	},
	// used when Question.qType === 'Match'
	idCorrespondingAnswer: {
		type: mongoose.Schema.ObjectId
	}
});

Questions = new mongoose.Schema({
	text: { type: String, required: true },
	qType: {
		type: String,
		enum: ['Alternative', 'Multiple', 'Sequencing', 'Cattell'
			//, 'Match'
		],
		required: true
	},
	answers: {
		type: [Answers],
		required: true,
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
