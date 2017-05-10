angular
	.module('cattellFactorSet')
	.value('dummyCattellFactorSet', {
		name: 'Cattell',
		factors: [{
			index: 'A',
			namePositive: 'A+',
			nameNegative: 'A-',
			matches: [
				{ sten: 1, rawSum: 2 },
				{ sten: 2, rawSum: 5 },
				{ sten: 3 },
				{ sten: 4, rawSum: 6 },
				{ sten: 5 },
				{ sten: 6 },
				{ sten: 7 },
				{ sten: 8 },
				{ sten: 9 },
				{ sten: 10, rawSum: 7 }
			]
		}, {
			index: 'B',
			namePositive: 'B+',
			nameNegative: 'B-',
			matches: [
				{ sten: 1, rawSum: 1 },
				{ sten: 2, rawSum: 2 },
				{ sten: 3 },
				{ sten: 4, rawSum: 6 },
				{ sten: 5, rawSum: 7 },
				{ sten: 6 },
				{ sten: 7 },
				{ sten: 8, rawSum: 8 },
				{ sten: 9 },
				{ sten: 10, rawSum: 9 }
			]
		}]
	});
