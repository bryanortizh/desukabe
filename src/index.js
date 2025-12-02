const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const setRoutes = require("./routes");
const cors = require("cors");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, { cors: { origin: "*" } });

const loadSocket = require("./function/chat");



app.use(cors({ origin: '*' }));

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

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
loadSocket(io);

