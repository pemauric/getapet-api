const express = require('express');
const cors = require('cors');
const app = express();

const port = 3000

app.use(express.json());
app.use(cors({
    credentials: 'true',
    origin: 'http://localhost:3000'
}))

app.use(express.static('public'))

//const PetRoutes = require('./routes/pet.routes')
//const UserRoutes = require('./routes/user.routes')

//app.use('/pets', PetRoutes)
//app.use('/users', UserRoutes)


app.listen(port, () => {
    console.log(`listening on port 3000 ${port}`);
    console.log(`http://localhost:${port}`);
});
