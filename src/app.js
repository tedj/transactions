import express from 'express';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import router from './api/services/router';
import models from './api/models';

const app = express();
app.use(morgan('combined'));
app.use(bodyParser.json());

const allowCrossDomain = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
};

app.use(allowCrossDomain);

app.use('/api/v1', router);

const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0';

models.sequelize.sync().then(() => app.listen(PORT, HOST, () => {
  console.log('Listening...');
})).catch((err) => {
  console.log(err);
});

export default app; // for testing
