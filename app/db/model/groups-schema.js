var mongoose = require('mongoose'),
	GroupsModel,
	Groups,
	Students;

// Group document schema
Students = new mongoose.Schema({
	firstName: { type: String, required: true },
	lastName: { type: String, required: true },
	patronymic: String
});

Groups = new mongoose.Schema({
	groupName: String,
	index: {
		type: Number,
		unique: true,
		// TODO: no need after database recreation?
		sparse: true
	},
	idEduForm: {
		type: mongoose.Schema.ObjectId,
		ref: 'EduForms'
	},
	idSpecialty: {
		type: mongoose.Schema.ObjectId,
		ref: 'Specialties'
	},
	students: [Students]
});


GroupsModel = mongoose.model('Groups', Groups);

module.exports = GroupsModel;
