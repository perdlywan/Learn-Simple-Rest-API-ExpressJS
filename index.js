const express  = require('express');
const route = require('./routes/userRoute');
const { errorHandler } = require('./middlewares/errorHandler');

const app = express();

const port = 3000;

app.use(express.json());

app.use("/users", route);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})

app.use(errorHandler);
