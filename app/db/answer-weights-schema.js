var mongoose = require('mongoose'),
	AnswerWeights,
	AnswerWeightsModel;

// not in QuestionSets document to leave correct answers undisclosed to a client
AnswerWeights = mongoose.Schema({
	idAnswer: { type: mongoose.Schema.ObjectId, required: true },
	// used when Question.qType === 'Match'
	idCorrespondingAnswer: { type: mongoose.Schema.ObjectId },
	weight: { type: Number, default: 0 }
});

AnswerWeightsModel = mongoose.model('AnswerWeights', AnswerWeights);

module.exports = AnswerWeightsModel;
