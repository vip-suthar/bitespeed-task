const router = require('express').Router();
const sql_conn = require('../services/dbService');

router.post("/identify", async (req, res) => {
    const { sequelize, models } = await sql_conn;
    if (!sequelize) {
        return res.status(500).send("Some Error Occured");
    }

    res.send("Everything All Right!");
})