var SessionHandler = require("./session");
var ProfileHandler = require("./profile");
var BenefitsHandler = require("./benefits");
var ContributionsHandler = require("./contributions");
var AllocationsHandler = require("./allocations");
var MemosHandler = require("./memos");
var ResearchHandler = require("./research");
var TutorialsHandler = require("./tutorials");
var ErrorHandler = require("./error").errorHandler;
var url = require("url");

// Helper function to validate redirect URLs
function isValidRedirect(redirectUrl) {
    // If no URL provided, it's not valid
    if (!redirectUrl) return false;
    
    // Parse the URL
    const parsedUrl = url.parse(redirectUrl);
    
    // Allow-list approach: only allow specific domains or relative URLs
    // Allow relative URLs (no hostname) or URLs to your own domain
    return !parsedUrl.hostname || 
           parsedUrl.hostname === 'localhost' || 
           parsedUrl.hostname.endsWith('nodegoat.herokuapp.com');
}

var exports = function(app, db) {

    "use strict";

    var sessionHandler = new SessionHandler(db);
    var profileHandler = new ProfileHandler(db);
    var benefitsHandler = new BenefitsHandler(db);
    var contributionsHandler = new ContributionsHandler(db);
    var allocationsHandler = new AllocationsHandler(db);
    var memosHandler = new MemosHandler(db);
    var researchHandler = new ResearchHandler(db);
    var tutorialsHandler = new TutorialsHandler(db);

    // Middleware to check if a user is logged in
    var isLoggedIn = sessionHandler.isLoggedInMiddleware;

    //Middleware to check if user has admin rights
    var isAdmin = sessionHandler.isAdminUserMiddleware;

    // The main page of the app
    app.get("/", sessionHandler.displayWelcomePage);

    // Login form
    app.get("/login", sessionHandler.displayLoginPage);
    app.post("/login", sessionHandler.handleLoginRequest);

    // Signup form
    app.get("/signup", sessionHandler.displaySignupPage);
    app.post("/signup", sessionHandler.handleSignup);

    // Logout page
    app.get("/logout", sessionHandler.displayLogoutPage);

    // The main page of the app
    app.get("/dashboard", isLoggedIn, sessionHandler.displayWelcomePage);

    // Profile page
    app.get("/profile", isLoggedIn, profileHandler.displayProfile);
    app.post("/profile", isLoggedIn, profileHandler.handleProfileUpdate);

    // Contributions Page
    app.get("/contributions", isLoggedIn, contributionsHandler.displayContributions);
    app.post("/contributions", isLoggedIn, contributionsHandler.handleContributionsUpdate);

    // Benefits Page
    app.get("/benefits", isLoggedIn, benefitsHandler.displayBenefits);
    app.post("/benefits", isLoggedIn, benefitsHandler.updateBenefits);
    
    // Allocations Page
    app.get("/allocations/:userId", isLoggedIn, allocationsHandler.displayAllocations);

    // Memos Page
    app.get("/memos", isLoggedIn, memosHandler.displayMemos);
    app.post("/memos", isLoggedIn, memosHandler.addMemos);

    // Handle redirect for learning resources link
    app.get("/learn", isLoggedIn, function(req, res, next) {
        // Fix for open redirect vulnerability
        if (req.query.url && isValidRedirect(req.query.url)) {
            return res.redirect(req.query.url);
        } else {
            // Default redirect or error page if URL is not valid
            return res.redirect("/dashboard");
        }
    });

    // Research Page
    app.get("/research", isLoggedIn, researchHandler.displayResearch);

    // Tutorials Page
    app.get("/tutorials", isLoggedIn, tutorialsHandler.displayTutorials);
    app.post("/tutorials", isLoggedIn, tutorialsHandler.displayTutorials);

    // Admin page
    app.get("/admin", isLoggedIn, isAdmin, sessionHandler.displayAdminPage);

    // Error handling middleware
    app.use(ErrorHandler);
};

module.exports = exports;
