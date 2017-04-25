let execute = function(generator, value, error) {
	let next = error
		? generator.throw(error)
		: generator.next(value);

	if (!next.done) {
		next.value.then(
			v => execute(generator, v),
			err => execute(generator, undefined, err)
		);
	}

	return next.value;
};

module.exports = execute;
