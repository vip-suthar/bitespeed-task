const { Sequelize } = require('sequelize');
const { dbConfig } = require('../config');

const contactModel = require('../models/Contact.model');

// A simple object to cache the sequelize instance
// and models so that it does not run again and again.
let sql_conn = {
    sequelize: null,
    models: {}
};

module.exports = (async function () {
    // if sequelize is already instantiated, return it;
    if (sql_conn.sequelize) return sql_conn;

    // Otherwise create a new instance with required params
    const sequelize = new Sequelize({
        host: dbConfig.host,
        port: dbConfig.port,
        username: dbConfig.user,
        password: dbConfig.password,
        database: dbConfig.database,
        dialect: dbConfig.dialect,
        pool: dbConfig.pool,
        logging: false
    });

    // if some failure occurs while connecting to mysql
    // this try-catch block will set the sequelize instance to null.
    try {

        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');

        sql_conn.sequelize = sequelize;

        sql_conn.models.Contact = contactModel(sequelize);

    } catch (error) {
        console.error('Unable to connect to the database:', error);

        sql_conn.sequelize = null;
    }

    return sql_conn;
})();