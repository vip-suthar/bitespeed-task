const { Sequelize } = require('sequelize');
const { dbConfig } = require('../config');

const contactModel = require('../models/Contact.model');

let sql_conn = {
    sequelize: null,
    models: {}
};

module.exports = (async function () {
    if (sql_conn.sequelize) return sql_conn;

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