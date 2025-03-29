const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.port || 3000;

app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
    res.send('Job Portal API is running!');
});




app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});