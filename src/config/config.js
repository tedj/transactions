import Reconfig from 'reconfig';

const defaultValues = {
  DB: 'DEV_DB',
  USER: 'TEST_USER',
  PWD: 'TEST_PWD',
  HOST: 'mysql_db',
  DIALECT: 'mysql',
};

const config = new Reconfig(defaultValues, { envPrefix: 'MYSQL' });

export default config;
