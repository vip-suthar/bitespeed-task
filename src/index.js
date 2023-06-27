const express = require('express');
const sql_conn = require('./services/dbService');
const identifyRoute = require('./routes/indetifyRoute');
const PORT = 8000;
const app = express();

app.use(express.json());

app.use("/", identifyRoute);

app.listen(PORT, async () => {
    console.log('listening at port:' + PORT);

    const { sequelize } = await sql_conn;
    if (sequelize) await sequelize.sync();
})