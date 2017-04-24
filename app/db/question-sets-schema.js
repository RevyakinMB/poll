var mongoose = require('mongoose'),
	QuestionSetsModel,
	QuestionSets,
	Questions,
	Answers;

// QuestionSet document schema
Answers = new mongoose.Schema({
	_id: {
		type: mongoose.Schema.ObjectId,
		required: true
	},
	text: { type: String, required: true },
	// used when Question.qType === 'Match'
	matchPosition: {
		type: String,
		enum: ['left', 'right']
	},
	idWeight: {
		type: mongoose.Schema.ObjectId,
		required: false,
		ref: 'AnswerWeights'
	}
});

Questions = new mongoose.Schema({
	text: { type: String, required: true },
	qType: {
		type: String,
		enum: ['Alternative', 'Multiple', 'Sequencing', 'Match'],
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
