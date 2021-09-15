const mongoose = require("mongoose")
require("dotenv").config()

function connectDB() {
// Dabase connection
const url = "mongodb+srv://crud_app:crud_app_project_01@cluster0.skhbc.mongodb.net/blog?retryWrites=true&w=majority";
mongoose.connect(process.env.MONGO_URL , {
  
    useNewUrlParser: true,
    useUnifiedTopology: true,

  })
  .then(() =>
   console.log("__connected to server : MongoDB atlas"))
  .catch(err => {console.log('connect error :', err)})
}

connectDB()

module.exports = connectDB;