var ContributionsHandler = function() {
    "use strict";

    var contributions = require("../data/contributions-dao").ContributionsDAO;

    this.displayContributions = function(req, res, next) {
        var userId = req.session.userId;

        contributions.getByUserId(userId, function(error, contrib) {
            if (error) return next(error);

            contrib.userId = userId;
            return res.render("contributions", contrib);
        });
    };

    this.handleContributionsUpdate = function(req, res, next) {
        var userId = req.session.userId;
        var preTax = req.body.preTax;
        var afterTax = req.body.afterTax;
        var roth = req.body.roth;

        contributions.update(userId, preTax, afterTax, roth, function(err, contributions) {
            if (err) return next(err);

            // Fix: Replace eval() with JSON.parse() for safer operation
            contributions = JSON.parse(contributions);

            var updateResult = {
                contributions: contributions,
                success: true
            };

            return res.render("contributions", updateResult);
        });
    };
};

module.exports = ContributionsHandler;
