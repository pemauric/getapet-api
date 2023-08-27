const express = require('express');
const app = express();

const port = 3000

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.listen(port, () => {
    console.log(`listening on port 3000 ${port}`);
    console.log(`http://localhost:${port}`);
});




