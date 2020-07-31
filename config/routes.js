'use strict';

/**
 * Module dependencies.
 */

const home = require('../app/controllers/home');

/**
 * Expose
 */

module.exports = function(app) {
  app.get('/', home.index);

  app.get('/register/quick-book-company', home.requestOAut2Token);

  app.get('/get/Oauth2Token', home.getOAuth2Token);

  app.get('/add/qick-books-customer', home.addCustomer);

  app.get('/get-compnay-info', home.companyDetails);

  app.get('/get-excel-cell-value/:value', home.sheetAlgo);


  /**
   * Error handling
   */

  app.use(function(err, req, res, next) {
    // treat as 404
    if (
      err.message &&
      (~err.message.indexOf('not found') ||
        ~err.message.indexOf('Cast to ObjectId failed'))
    ) {
      return next();
    }
    console.error(err.stack);
    // error page
    res.status(500).render('500', { error: err.stack });
  });

  // assume 404 since no middleware responded
  app.use(function(req, res) {
    res.status(404).render('404', {
      url: req.originalUrl,
      error: 'Not found'
    });
  });
};
