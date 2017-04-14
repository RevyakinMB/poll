var mongoose = require('mongoose'),
	TestingsModel,
	Testings,
	TestingAttempts,
	TestingResults;

// Testing document schema
TestingResults = new mongoose.Schema({
	idQuestion: mongoose.Schema.ObjectId,
	idAnswer: mongoose.Schema.ObjectId
});

TestingAttempts = new mongoose.Schema({
	idStudent: { type: mongoose.Schema.ObjectId, required: true },
	startedAt: { type: Date, default: Date.now },
	finishedAt: Date,
	results: [TestingResults]
});

Testings = new mongoose.Schema({
	idQuestionSet: {
		type: mongoose.Schema.ObjectId,
		required: true,
		ref: 'QuestionSets'
	},
	scheduledAt: Date,
	idGroup: {
		type: mongoose.Schema.ObjectId,
		required: true,
		ref: 'Groups'
	},
	attempts: [TestingAttempts]
});


TestingsModel = mongoose.model('Testings', Testings);

module.exports = TestingsModel;
