(function (define) {
	var KB = 1000,
	MB = Math.pow(KB, 2),
	GB = Math.pow(KB, 3);

	define(function () {

		function convert(v, unit) {
			return (Math.round(v / unit * 100000) / 100000).toFixed(2);
		}

		function convertKB(v) {
			return convert(v, KB);
		}

		function convertMB(v) {
			return convert(v, MB);
		}

		function convertGB(v) {
			return convert(v, GB);
		}

		function convertBytes(val) {
			if (val < KB) {
				return val + '';
			}
			if (val < MB) {
				return convertKB(val) + ' KB';
			}
			if (val < GB) {
				return convertMB(val) + ' MB';
			}
			return convertGB(val) + ' GB';
		}

		return convertBytes;

	});
} (this.define));

