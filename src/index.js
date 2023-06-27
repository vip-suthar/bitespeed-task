const express = require('express');
const PORT = 8000;
const app = express();

app.use(express.json());

app.use("/", (req, res) => {
    res.send("Hello world!");
});

app.listen(PORT, async () => {
    console.log('listening at port:' + PORT);
})