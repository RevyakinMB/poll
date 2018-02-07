const process = require('process'),
	xlsx = require('js-xlsx/xlsx'),
	fileImport = (buffer) => {
		let workbook, sheetNameList, data;
		try {
			workbook = xlsx.read(buffer.data, { type: 'buffer' });
		} catch (e) {
			console.log(e);
			process.send({
				type: 'error',
				message: e.message
			});
			return;
		}
		sheetNameList = workbook.SheetNames;
		data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetNameList[0]], {
			header: 1
		});
		console.log(data);
		process.send({
			type: 'data',
			message: data
		});
	};

process.on('message', ([message, data] = _) => {
	switch (message) {
		case 'import file': {
			fileImport(data);
			break;
		}
		default: {
			break;
		}
	}
});
