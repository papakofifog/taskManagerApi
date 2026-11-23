require('dotenv').config();

const exress= require('express');
const cors= require('cors');
const bodyParser= require('body-parser');
const handleErrors= require('./Middleware/errorHandling');
const ApplicationRouter= require("./routes/appRoutes");
const UserRoutes= require("./routes/userRoutes");
const connectToTaskManagerDB = require('./Settings/connectToDb');
const taskRouter = require('./routes/taskRoutes');
const fs= require('fs');
const path= require('path');
const YAML= require('yaml');
const swaggerUi= require('swagger-ui-express');




const app= exress();

app.use(cors({origin: "*"}));

app.use(bodyParser.json());

// Swagger UI for the OpenAPI spec, at /api-docs (raw spec at /api-docs/openapi.json)
const openApiSpec= YAML.parse(fs.readFileSync(path.join(__dirname, 'openapi.yaml'), 'utf8'));
app.get('/api-docs/openapi.json', (req, res)=> res.json(openApiSpec));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec, {
    customSiteTitle: "Task Manager API docs",
    swaggerOptions: { persistAuthorization: true }
}));


app.use('/_taskApp/v1/', ApplicationRouter);
app.use('/_taskApp/v1/',UserRoutes);
app.use('/_taskApp/v1/', taskRouter);



connectToTaskManagerDB();

app.use(handleErrors);


app.listen(process.env.PORT);
console.log(`Server is running on ${process.env.PORT}`)

module.exports=app;