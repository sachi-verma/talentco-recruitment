const express = require('express');
const bodyParser = require('body-parser');
const { port } = require('./Config/config');
const corsMiddleware = require('./Middleware/corsMiddleware');
const errorHandler = require('./Middleware/errorHandler');

const roleRoutes = require('./Routes/roleRoutes');
const moduleRoutes = require('./Routes/moduleRoutes');
const companyRoutes = require('./Routes/companyRoutes');
const permissionRoutes = require('./Routes/permissionRoutes');
const jobRoutes = require('./Routes/jobRoutes');
const protectedRoutes = require('./Routes/protectedRoutes');
const userRoutes = require('./Routes/userRoutes');


const app = express();

app.use(corsMiddleware);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(roleRoutes);
app.use(moduleRoutes);
app.use(companyRoutes);
app.use(permissionRoutes);
app.use(jobRoutes);


app.use("/protected_routes", protectedRoutes);
app.use(userRoutes);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
