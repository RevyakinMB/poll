var mongoose = require('mongoose'),
	DeletedAttemptsModel,
	TestingResults,
	Attempts;

TestingResults = new mongoose.Schema({
	idQuestion: mongoose.Schema.ObjectId,
	answers: [{
		type: mongoose.Schema.ObjectId
	}]
});

Attempts = new mongoose.Schema({
	idStudent: { type: mongoose.Schema.ObjectId, required: true },
	startedAt: { type: Date, default: Date.now },
	results: [TestingResults]
});

DeletedAttemptsModel = mongoose.model('DeletedAttempts', new mongoose.Schema({
	idTesting: { type: mongoose.Schema.ObjectId, required: true },
	attempts: [Attempts]
}));

module.exports = DeletedAttemptsModel;
