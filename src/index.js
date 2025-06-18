const express = require('express');
const swaggerUi = require('swagger-ui-express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const setRoutes = require('./routes');
const swaggerSpec = require('./contract/apiDesuka');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use('/apiUX', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use('/assets', express.static(path.join(__dirname, '../assets')));
setRoutes(app);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});