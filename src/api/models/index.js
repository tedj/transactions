import fs from 'fs';
import path from 'path';
import Sequelize from 'sequelize';
import config from '../../config/config';

const sequelize = new Sequelize(config.get('DB'), config.get('USER'), config.get('PWD'), {
  host: config.get('HOST'),
  dialect: config.get('DIALECT'),
});

const db = {};

fs
  .readdirSync(__dirname)
  .filter(file => (file.indexOf('.') !== 0) && (file !== 'index.js'))
  .forEach((file) => {
    const model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
  });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
