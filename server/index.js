const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');

dotenv.config({ path: '../.env' })

const port = process.env.PORT || 4000;

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// serve the react app files
app.use(express.static(`${__dirname}/client/build`));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
