var mongoose = require('mongoose'),
	TestingsModel,
	Testings,
	TestingAttempts,
	TestingResults;

// Testing document schema
TestingResults = new mongoose.Schema({
	idQuestion: mongoose.Schema.ObjectId,
	answers: [{
		type: mongoose.Schema.ObjectId
	}]
});

TestingAttempts = new mongoose.Schema({
	idStudent: { type: mongoose.Schema.ObjectId, required: true },
	startedAt: { type: Date, default: Date.now },
	finishedAt: Date,
	results: [TestingResults],
	session: {
		type: String,
		required: true
	}
});

Testings = new mongoose.Schema({
	idQuestionSet: {
		type: mongoose.Schema.ObjectId,
		required: true,
		ref: 'QuestionSets'
	},
	scheduledFor: Date,
	idGroup: {
		type: mongoose.Schema.ObjectId,
		required: false,
		ref: 'Groups'
	},
	attempts: [TestingAttempts]
});


TestingsModel = mongoose.model('Testings', Testings);

module.exports = TestingsModel;
