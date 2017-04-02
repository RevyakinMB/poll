'use strict';

var express = require('express'),
	app = express(),
	logger = require('morgan'),
	bodyParser = require('body-parser'),

	path = require('path'),
	GroupsModel = require('./db/groups-schema'),
	TestingsModel = require('./db/testings-schema'),
	QuestionSetsModel = require('./db/question-sets-schema');
require('./db/db-connect');

app.use(bodyParser.json());

// log requests to console
app.use(logger('combined'));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/groups', function(req, res) {
	return GroupsModel.find(function(err, groups) {
		if (err) {
			res.statusCode = 500;
			// TODO: enhance logging
			console.error('Internal server error:', err.message);
			return res.send({ error: 'Server error' });
		}
		return res.send(groups);
	});
});

app.get('/api/groups/:id', function(req, res) {
	console.log('IN /api/groups GET middleware', req.params.id);
	return GroupsModel.findOne({
		_id: req.params.id
	}, function(err, group) {
		if (err) {
			res.statusCode = 500;
			// TODO: enhance logging
			console.error('Internal server error:', err.message);
			return res.send({ error: 'Server error' });
		}
		if (!group) {
			res.statusCode = 404;
			return res.send({ error: 'Group not found' });
		}
		res.statusCode = 200;
		return res.send(group);
	});
});

app.post('/api/groups/:groupId?', function(req, res) {
	var createOrUpdate = function(group) {
		if (!group) {
			res.statusCode = 201;
			group = new GroupsModel({
				groupName: req.body.groupName,
				students: req.body.students
			});
		}

		group.save(function(err) {
			if (!err) {
				return res.send(group);
			}
			console.log(err);
			if (err.name === 'ValidationError') {
				res.statusCode = 400;
				res.send({
					error: 'Validation error'
				});
			} else {
				res.statusCode = 500;
				res.send({
					error: 'Server error'
				});
			}
		});
	};

	console.log('REQUEST BODY:', req.body);

	if (!req.params.groupId) {
		// create new group
		createOrUpdate();
		return;
	}
	GroupsModel.findById(req.params.groupId, function(err, group) {
		if (err) {
			res.statusCode = 500;
			return res.send({
				error: 'Server error'
			});
		}
		if (!group) {
			console.log('Warning: group', req.params.groupId, 'not found');
		} else {
			group.groupName = req.body.groupName;
			group.students = req.body.students;
		}
		createOrUpdate(group);
	});
});

app.all('/*', function(req, res) {
	res.sendFile('index.html', {
		root: path.join(__dirname, 'public')
	});
});

app.listen(8080, function()  {
	console.log('Server is listening on port 8080');
});


