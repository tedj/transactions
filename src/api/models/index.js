import fs from 'fs';
import path from 'path';
import Sequelize from 'sequelize';

const sequelize = new Sequelize('TEST_DB', 'TEST_USER', 'TEST_PWD', {
  host: 'mysql_db',
  dialect: 'mysql',
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
