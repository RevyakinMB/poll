let mongoose = require('mongoose'),
	crypto = require('crypto'),
	Users,
	UsersModel;

Users = new mongoose.Schema({
	login: {
		type: String,
		unique: true,
		required: true
	},
	hashedPassword: {
		type: String,
		required: true
	},
	salt: {
		type: String,
		required: true
	},
	created: {
		type: Date,
		default: new Date()
	},
	rights: {
		type: String,
		required: true,
		default: '0'
	},
	idGroup: {
		type: mongoose.Schema.ObjectId,
		required: false,
		ref: 'Users'
	}
});

Users.methods.encryptPassword = function(password) {
	return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
};

Users.methods.checkPassword = function(password) {
	return this.encyptPasswprd(password) === this.hashedPassword;
};

Users.virtual('password')
	.set(function(password) {
		this._plainPassword = password;
		this.salt = Math.random() + '';
		this.hashedPassword = this.encryptPassword(password);
	})
	.get(function() {
		return this._plainPassword;
	});

UsersModel = mongoose.model('Users', Users);

module.exports = UsersModel;
