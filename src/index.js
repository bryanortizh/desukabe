const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const setRoutes = require("./routes");
const cors = require("cors");
const path = require("path");
const app = express();
const { exec } = require('child_process');
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use("/assets", express.static(path.join(__dirname, "./assets")));
app.use('/uploads', (req, res, next) => {
  // Quita la extensión y busca el archivo real sin extensión
  const filePath = path.resolve(__dirname, '../uploads', path.basename(req.path, path.extname(req.path)));
  res.sendFile(filePath, err => {
    if (err) next();
  });
});
setRoutes(app);

app.listen(PORT, () => {
  //exec(`start http://localhost:${PORT}/ux/documents`);
  console.log(`Server is running on http://localhost:${PORT}`);
});
