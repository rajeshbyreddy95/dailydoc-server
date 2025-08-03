const express = require("express")
const app = express()
const dotenv = require("dotenv")
const cors = require("cors")
const connectDB = require("./db/config")
const mongoose = require("mongoose")
const authRoute = require("./routes/auth")
const scheduleRoute = require("./routes/schedule")
const profileRoute = require("./routes/profile")
const runTaskReminderScheduler = require('./scheduler/taskReminder');

dotenv.config()



app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended:true}))

connectDB()

app.use("/", authRoute)
app.use("/", scheduleRoute)
app.use("/",profileRoute)


app.get("/",(req, res)=>{
    res.json({"message":"server running"})
})
const PORT = process.env.PORT || 8070;
app.listen(PORT, ()=>{
    console.log("server running under port ", PORT);
console.log(process.env.USER_EMAIL)

    runTaskReminderScheduler();
})