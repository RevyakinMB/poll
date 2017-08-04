const mongoose = require('mongoose'),
	crypto = require('crypto');

let Users,
	UsersModel,
	AuthError;

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
	return this.encryptPassword(password) === this.hashedPassword;
};

Users.options.toJSON = {
	transform: function(doc, ret) {
		delete ret.hashedPassword;
		delete ret.salt;
		delete ret._id;
		delete ret.rights;
		delete ret.created;
		return ret;
	}
};

Users.statics.authorize = function(login, password) {
	return this
		.findOne({ login: login })
		.exec()
		.then(function(user) {
			if (!user || !user.checkPassword(password)) {
				throw new AuthError('Wrong login or password');
			}
			return user;
		});
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

module.exports.UsersModel = UsersModel;


AuthError = function(message) {
	Error.call(this, arguments);
	Error.captureStackTrace(this, AuthError);
	this.message = message;
};

AuthError.prototype = Object.create(Error.prototype);
AuthError.prototype.constructor = AuthError;

module.exports.AuthError = AuthError;
