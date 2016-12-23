var Auction = require('./auction.model');

var auctionData = {

	count: function(req, res, next) {
		var filters = {};
		filters.auctionId = req.query.auctionId;
		var auctions = [];
		var isSoldCount = 0;

		//var query = Auction.find(filters);

		var query = Auction.aggregate([{
			"$group": {
				_id: "$auctionId",
				count: {
					$sum: 1
				}
			}
		}]);

		query.exec(
			function(err, result) {
				if (err) {
					return next(err);
				}
				auctions = result;

				var query2 = Auction.aggregate([{
					"$match": {
						"isSold": true
					}
				}, {
					"$group": {
						_id: "$auctionId",
						isSoldCount: {
							"$sum": 1
						},
						sumOfInsale: {
							$sum: "$emdAmount"
						}
					}
				}]);

				query2.exec(
					function(err, isSoldCount) {
						result.forEach(function(x){
							isSoldCount.some(function(y){
								if(x._id === y._id){
									x.isSoldCount = y.isSoldCount;
									x.sumOfInsale = y.sumOfInsale;
									return true;
								}
							})
						})
             
						return res.status(200).send(result);
					});
			});



		//return res.status(200).send(auctions);
	},
	fetch: function(req, res, next) {
		var query = null;
		var filters = {};
		if (Array.isArray(req.query.auctionId)) {
			filter = {
				auctionId: {
					'$in': req.query.auctionId
				}
			}
		} else
			filters.auctionId = (req.query.auctionId);

		var query = Auction.find(filters);
		query.exec(function(err, auctionsItems) {
			if (err) {
				return handleError(res, err);
			}

			return res.status(200).json(auctionsItems);
		});

	}
};

module.exports = auctionData;