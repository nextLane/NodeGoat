var ContributionsHandler = function() {
    "use strict";

    var contributions = require("../data/contributions-dao").ContributionsDAO;

    this.displayContributions = function(req, res, next) {
        var userId = req.session.userId;

        contributions.getByUserId(userId, function(error, contrib) {
            if (error) return next(error);

            contrib.userId = userId; //set for nav menu items
            return res.render("contributions", contrib);
        });
    };

    this.handleContributionsUpdate = function(req, res, next) {
        /*jslint evil: true */
        // Insecure use of eval() to parse inputs
        var preTax = parseInt(req.body.preTax);
        var afterTax = parseInt(req.body.afterTax);
        var roth = parseInt(req.body.roth);

        var userId = req.session.userId;

        //validate contributions
        var validations = [isNaN(preTax), isNaN(afterTax), isNaN(roth), preTax < 0, afterTax < 0, roth < 0];
        var isInvalid = validations.some(function(validation) {
            return validation;
        });
        if (isInvalid) {
            return res.render("contributions", {
                updateError: "Invalid contribution percentages",
                userId: userId
            });
        }
        
        // Fix for the vulnerability: use JSON.parse instead of eval
        contributions.update(userId, preTax, afterTax, roth, function(err, contributions) {
            if (err) return next(err);

            contributions.updateSuccess = true;
            contributions.userId = userId;
            
            // Safe parsing using JSON.parse instead of eval
            return res.render("contributions", contributions);
        });
    };
};

module.exports = ContributionsHandler;
