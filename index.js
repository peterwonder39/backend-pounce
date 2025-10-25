const express = require('express');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const dotenv = require("dotenv")
const ejs = require('ejs');
app.set('view engine', 'ejs'); 
const mongoose = require("mongoose")
const cors = require("cors")
app.use(cors()) 
dotenv.config()
const userRouter = require("./routes/user.route")
app.use("/user",userRouter)






let URI = process.env.URI
mongoose.connect(URI).then(() => {
    console.log("connected to mongoDB");
})
    .catch((err) => {
        console.log("error connecting to mongoDB", err);
    })

let customerSchema = mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: [true, "email already exists please choose another one"] },

    password: { type: String, required: true }
})


port = process.env.port 
app.listen(port, () => {
    console.log(`app has started on port ${port}`);

})