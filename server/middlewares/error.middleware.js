/*
const { AssertionError } = require('assert');
const { MongoError } = require('mongodb');

app.use(function handleAssertionError(error, req, res, next) {
  if (error instanceof AssertionError) {
    return res.status(400).json({
      type: 'AssertionError',
      message: error.message
    });
  }
  next(error);
});

app.use(function handleDatabaseError(error, req, res, next) {
  if (error instanceof MongoError) {
    return res.status(503).json({
      type: 'MongoError',
      message: error.message
    });
  }
  next(error);
});
*/
/*
app.use((error, req, res, next) => {
  if (!error.statusCode) error.statusCode = 500;

  if (error.statusCode === 301) {
    return res.status(301).redirect('/not-found');
  }

  return res
    .status(error.statusCode)
    .json({ error: error.toString() });
});
*/
const errorResponder = (err, req, res, next) => {
  res.header("Content-Type", "application/json");
  res.status(err.statusCode).send(JSON.stringify(err, null, 4)); // pretty print
};

const failSafeHandler = (err, req, res, next) => {
  res.status(500).json({ message: err.message });
};

/*
wildcard 
app.get('*', function(req, res, next) {
  let err = new Error("Page Doesn't Exist");
  err.statusCode = 404;
  next(err);
});
*/

/*
app.use(function(err, req, res, next) {
  console.error(err.message);
  
  // Define a common server error status code if none is part of the err.
  if (!err.statusCode) err.statusCode = 500; 
  if (err.shouldRedirect) {
    // Gets a customErrorPage.html.
    res.render('customErrorPage')
  } else {
    // Gets the original err data, If shouldRedirect is not declared in the error.
    res.status(err.statusCode).send(err.message);
  }
});*/

module.exports = { failSafeHandler };
