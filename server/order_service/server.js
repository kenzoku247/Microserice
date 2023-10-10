const express = require("express")
const app = express()
const cookieParser = require('cookie-parser')
const cors = require('cors')
const mongoose = require("mongoose")
const dotenv = require("dotenv")
dotenv.config()
// const http = require('http')
// const socketIO = require('socket.io');

// const server = http.createServer(app);
// const io = socketIO(server);

// io.on('connection', (socket) => {
//     console.log('Client connected');
  
//     socket.on('disconnect', () => {
//       console.log('Client disconnected');
//     });
//     socket.emit('progress', 100);
//   });

mongoose
.connect(
    process.env.MONGODB_URL
).then(() => console.log("Database is connected successfully!")).catch((err) => { console.log(err) });

app.use(cors())
app.use(cookieParser())
app.use(express.json())
app.use("/api_order", require("./route/orderRouter"))

app.listen(process.env.PORT || 5000, () => {
    console.log(`Order service is running on port 5000!`);
})

module.exports = app


