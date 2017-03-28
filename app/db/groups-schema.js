var mongoose = require('mongoose'),
	GroupsModel,
	Groups,
	Students;
//require('./db');

// Group document schema
Students = new mongoose.Schema({
	//_id: mongoose.Schema.ObjectId,
	firstName: { type: String, required: true },
	lastName: { type: String, required: true },
	patronymic: String
});

Groups = new mongoose.Schema({
	groupName: String,
	students: [Students]
});


GroupsModel = mongoose.model('Groups', Groups);

module.exports = GroupsModel;
