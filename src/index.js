const express = require('express');
const sql_conn = require('./services/dbService');
const identifyRoute = require('./routes/identifyRoute');
const PORT = process.env.NODE_PORT || 8000;

// created express app
const app = express();

// parse the incoming requests with JSON payloads
app.use(express.json());

// application routes
app.use("/", identifyRoute);

// listening to incoming requests and syncing the db tables
app.listen(PORT, async () => {
    console.log('listening at port:' + PORT);

    try {
        const { sequelize } = await sql_conn;
        if (sequelize) await sequelize.sync({ force: true })
    } catch (error) {
        console.log("Some error occured while syncing tables in db");
    }

})