const multer = require('multer'),
	upload = multer(),
	fs = require('fs'),
	path = require('path'),
	fork = require('child_process').fork,
	HttpError = require('../error').HttpError,
	authCheck = require('../middleware/authCheck'),
	GroupsModel = require('../db/model/groups-schema'),
	QuestionSetsModel = require('../db/model/question-sets-schema');

module.exports = function(app) {
	const templateRead = (type) => new Promise((resolve, reject) => {
		const filename = type === 'group' ?
			'Шаблон.группы.xlsx' :
			// TODO: create file
			'Шаблон.вопросника.xlsx';
		fs.readFile(path.join(__dirname, '..', filename), (err, data) => {
			if (err) {
				reject(err);
			}
			resolve(data);
		});
	}), resourceInsert = (type, data) => {
		if (type === 'group') {
			let doc = new GroupsModel();
			doc.groupName = 'Imported group';
			doc.students = data.slice(1).map(names => {
				return {
					firstName: names[1],
					lastName: names[0],
					patronymic: names[2]
				};
			});
			return doc.save();
		}
		// TODO: question-set
		return Promise.resolve();
	};

	app.post('/api/import', authCheck, upload.single('file'), function(req, res, next) {
		const forked = fork(path.join(__dirname, '../lib/xlsx-parser.js'));
		forked.on('message', (msg) => {
			forked.kill();
			if (msg.type === 'error') {
				next(new HttpError(400, msg.message));
				return;
			}
			resourceInsert(req.body.resourceType, msg.message)
				.then(doc => res.send({
					resourceId: doc ? doc._id : undefined
				}))
				.catch(err => next(new HttpError(400, err.message)));
		});
		forked.send(['import file', req.file.buffer]);
	});

	app.get('/api/import-template', authCheck, function(req, res, next) {
		if (req.query.resourceType === 'group' ||
			req.query.resourceType === 'questionSet'
		) {
			templateRead(req.query.resourceType)
				.then(data => {
					res.attachment('Шаблон.импорта.xlsx');
					res.send(data);
				})
				.catch(err => next(new HttpError(500, err.message)));
			return;
		}
		next(new HttpError(400, 'Unknown resource type'));
	});
};
