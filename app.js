const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");

const notesRoute = require("./routes/notes");
const userRoutes = require("./routes/auth");
  
dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(result => {
    const server = app.listen(process.env.PORT || 8800);
    if(server){
        console.log("connected");
    }})
.catch(err => console.log(err));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet({  crossOriginResourcePolicy: false}));
app.use(morgan("common"));


app.use(cors());

app.use('/auth',userRoutes);
app.use(notesRoute);
app.use('/', (req, res) => {
  res.status(200).json('API in Connected'); //write a response to the client
})