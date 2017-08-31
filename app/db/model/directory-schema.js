const mongoose = require('mongoose');

let Directories,
	EduFormsModel,
	SpecialtiesModel;

Directories = new mongoose.Schema({
	name: {
		type: String,
		required: true
	}
});

EduFormsModel = mongoose.model('EduForms', Directories);
SpecialtiesModel = mongoose.model('Specialties', Directories);

module.exports.EduFormsModel = EduFormsModel;
module.exports.SpecialtiesModel = SpecialtiesModel;
