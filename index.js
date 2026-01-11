const express  = require('express');
const route = require('./routes/userRoute');

const app = express();

const port = 3000;

app.use(express.json());

app.use("/users", route);

app.use((err, req, res, next) => {
    console.error("Error handler reached:", err);
    res.status(err.status ?? 500 ).json({ error: err.message || "Internal Server Error" });
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})
