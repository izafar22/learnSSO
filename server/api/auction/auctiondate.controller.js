var AuctionMaster = require('./auctionmaster.model');

var auctionData = {

	count: function(req, res) {
		var filter = {};
		if (req.query.auctionType == 'closedAuctions') {
			var datei = new Date();
			filter.endDate = {
				'$lt': datei
			}

			var query = AuctionMaster.find(filter);
			query.count().exec(
				function(err, auctions) {
					if (err) {
						return handleError(res, err);
					}
					return res.status(200).json(auctions);
				}
			);
		} else {
			var datei = new Date();
			var filter = {};

			filter.startDate = {
				'$gt': datei
			};
			var query = AuctionMaster.find(filter);
			query.count().exec(
				function(err, auctions) {
					if (err) {
						return handleError(res, err);
					}
					return res.status(200).json(auctions);
				}
			);
		}
	},
	fetch: function(req, res, next) {
		var datei = new Date();
		var query = null;
		var options = req.query || {};
		var filters = {};
		var sort = {
			'_id': -1
		};

		if (options.first_id && options.first_id !== 'null') {
			filters._id = {
				'$gt': options.first_id
			};

			sort = {
				'_id': 1
			};
		}

		if (options.last_id && options.last_id !== 'null') {
			filters._id = {
				'$lt': options.last_id
			};
		}

		if (options.last_id && options.last_id !== 'null' && options.first_id && options.first_id !== 'null') {
			filters._id = {
				'$gt': options.first_id,
				'$lt': options.last_id
			};
		}
		if (req.query.type == 'closedAuctions') {
			filters.endDate = {
				'$lt': datei
			};
		} else {
			filters.startDate = {
				'$gt': datei
			};
		}

		query = AuctionMaster.find(filters);
		query = query.sort(sort);

		options.offset = Math.abs(Number(options.offset));

		if (options.offset)
			query = query.skip(options.offset);


		query = query.limit(options.limit || 10);

		query.exec(fetchData);

		function fetchData(err, reportData) {
			if (err)
				return next(err);

			if (!res)
				return next(new APIError(400, 'Error while fetching data from db'));

			if (options.first_id && options.first_id !== 'null')
				reportData = reportData.reverse();

			req.reportData = reportData;
			return next();
		}

	},
	renderJson: function(req, res, next) {
		if (!req && !req.reportData) {
			return next(new APIError(400, 'No Report Data to render'));
		}
		res.status(200).json(req.reportData);
	}
};

module.exports = auctionData;