const process = require('process'),
	xlsx = require('js-xlsx/xlsx'),
	log = require('../lib/log'),
	fileImport = (buffer) => {
		let workbook, sheetNameList, data;
		try {
			workbook = xlsx.read(buffer.data, { type: 'buffer' });
		} catch (e) {
			log.error(e);
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
