require('dotenv').config();

const exress= require('express');
const cors= require('cors');
const bodyParser= require('body-parser');
const handleErrors= require('./Middleware/errorHandling');
const ApplicationRouter= require("./routes/appRoutes");
const UserRoutes= require("./routes/userRoutes");
const connectToTaskManagerDB = require('./Settings/connectToDb');
const taskRouter = require('./routes/taskRoutes');




const app= exress();

app.use(cors({origin: "*"}));

app.use(bodyParser.json());


app.use('/_taskApp/v1/', ApplicationRouter);
app.use('/_taskApp/v1/',UserRoutes);
app.use('/_taskApp/v1/', taskRouter);



connectToTaskManagerDB();

app.use(handleErrors);


app.listen(process.env.PORT);
console.log(`Server is running on ${process.env.PORT}`)

module.exports=app;