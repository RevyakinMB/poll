const multer = require('multer'),
	upload = multer(),
	fs = require('fs'),
	path = require('path'),
	fork = require('child_process').fork,
	HttpError = require('../error').HttpError,
	authCheck = require('../middleware/authCheck'),
	GroupsModel = require('../db/model/groups-schema'),
	QuestionSetsModel = require('../db/model/question-sets-schema'),

	questionSetParse = require('../lib/question-set-parser');

module.exports = function(app) {
	const templateRead = (type) => new Promise((resolve, reject) => {
		const filename = type === 'group' ?
			'Шаблон.группы.xlsx' :
			'Шаблон.вопросника.xlsx';
		fs.readFile(path.join(__dirname, '..', filename), (err, data) => {
			if (err) {
				reject(err);
			}
			resolve(data);
		});
	}), groupInsert = (data) => {
		let doc, testees;
		testees = data.slice(1).filter((names) => {
			return names[0] && names[0].trim() && names[1] && names[1].trim();
		});
		if (!testees.length) {
			return Promise.reject('No valid data to import');
		}
		doc = new GroupsModel();
		doc.groupName = 'Imported group';
		doc.students = testees.map((names) => {
			return {
				firstName: names[1],
				lastName: names[0],
				patronymic: names[2] || ''
			};
		});
		return doc.save();
	}, questionSetInsert = (data) => {
		return questionSetParse(data).then(qSet => qSet.save());

	}, resourceInsert = (type, data) => {
		if (type === 'group') {
			return groupInsert(data);
		} else if (type === 'questionSet') {
			return questionSetInsert(data);
		}
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
				.catch(err => next(new HttpError(400,
					typeof err === 'string' ? err : err.message))
			);
		});
		forked.send(['import file', req.file.buffer]);
	});

	app.get('/api/import-template', authCheck, function(req, res, next) {
		if (req.query.resourceType === 'group' ||
			req.query.resourceType === 'questionSet'
		) {
			templateRead(req.query.resourceType)
				.then((data) => {
					res.attachment('Шаблон.импорта.xlsx');
					res.send(data);
				})
				.catch(err => next(new HttpError(500, err.message)));
			return;
		}
		next(new HttpError(400, 'Unknown resource type'));
	});
};
