const FactorSetsModel = require('../db/model/factor-sets-schema'),
	QuestionSetModel = require('../db/model/question-sets-schema'),
	TEXT = 0, TYPE = 1, WEIGHT = 2, FACTOR = 3,
	qType = {
		A: 'Alternative',
		M: 'Multiple',
		S: 'Sequencing',
		C: 'Cattell',
		P: 'Poll'
	};

module.exports = function(data) {
	return new Promise((resolve, reject) => {
		const parse = (data) => {
			let qSet = new QuestionSetModel({
				name: 'Imported question set'
			}), question,
				questionCreate,
				questionCheckAndSave;
			if (!data) {
				return reject('No valid data to import');
			}
			questionCreate = (line, index) => {
				let q, questionType, questionText;
				// check question type
				questionType = qType[line[TYPE]];
				if (!questionType) {
					reject('Wrong question type: "' + line[TYPE] + '"; line: ' + index);
					return false;
				}
				// check question text
				questionText = line[TEXT] && line[TEXT].trim();
				if (!questionText) {
					reject('Empty question text; line: ' + index);
					return false;
				}
				q = {
					text: questionText,
					qType: questionType,
					answers: []
				};
				if (questionType === 'Cattell') {
					let factor = factors[line[FACTOR]];
					if (!factor) {
						reject('Unknown factor index: "' + line[FACTOR] + '"; line: ' + index);
						return false;
					}
					q.idFactor = factor;
				}
				return q;
			};

			// check and save previous question
			questionCheckAndSave = (question) => {
				if (!question) {
					return true;
				}
				if (question.answers.length < 2) {
					reject('Please specify at least two answers to question: ' + question.text);
					return false;
				}
				if (question.answers.some(a => !a.text)) {
					reject('There is a question with empty answer\'s text: ' + question.text);
					return false;
				}
				if ((question.qType === 'Alternative' ||
					question.qType === 'Multiple') &&
					(question.answers.some(a => a.weight > 1) ||
					question.answers.every(a => !a.weight))
				) {
					reject('Incorrect answer weights: ' + question.text);
					return false;
				}

				if (question.qType === 'Alternative' &&
					question.answers.reduce((acc, a) => {
						return acc + a.weight;
					}, 0) > 1
				) {
					reject('There\'s more then one correct answer: ' + question.text);
					return false;
				}

				if (question.qType === 'Sequencing') {
					let keys = {};
					for (let i = 0; i < question.answers.length; ++i) {
						let a = question.answers[i];
						if (keys[a.weight]) {
							reject('There\'s ambiguous answer sequence: ' + question.text);
							return false;
						}
						keys[a.weight] = true;
					}
				}
				qSet.questions.push(question);
				return true;
			};

			// omit header
			data = data.splice(1);
			for (let i = 0; i < data.length; ++i) {
				let line = data[i], weight;
				if (line[TYPE]) {
					// next question started
					if (question && !questionCheckAndSave(question)) {
						return;
					}
					question = questionCreate(line, i + 2);
					if (!question) {
						return;
					}
					continue;
				}
				// next answer line
				if (!question) {
					reject('There is answer to unknown question; line: ' + (i + 2));
					return;
				}
				if (!line[WEIGHT]) {
					weight = 0;
				} else {
					weight = parseInt(line[WEIGHT], 10);
					if (isNaN(weight)) {
						reject('There is incorrect answer weight; line: ' + (i + 2));
						return;
					}
				}

				question.answers.push({
					text: line[TEXT] && line[TEXT].trim(),
					weight: weight
				});
			}
			if (!questionCheckAndSave(question)) {
				return;
			}
			resolve(qSet);
		};
		let factors = {};
		FactorSetsModel.findOne({
				name: 'Cattell'
			}).exec()
			.then(s => {
				s.factors.forEach((f) => {
					factors[f.index] = f._id;
				});
			})
			.then(() => parse(data))
			.catch(e => reject(e));
	});
};
