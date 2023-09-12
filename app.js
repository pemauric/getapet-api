const express = require('express');
const cors = require('cors');
const app = express();

const port = 4000

app.use(express.json());
app.use(cors({
    credentials: 'true',
    origin: 'http://localhost:3000'
}))

app.use(express.static('public'))

const PetRoutes = require('./routes/pet.routes')
const UserRoutes = require('./routes/user.routes')

app.use('/users', UserRoutes)
app.use('/pets', PetRoutes)


app.listen(port, () => {
    console.log(`listening on port  ${port}`);
    console.log(`http://localhost:${port}`);
});
