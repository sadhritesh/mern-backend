import { app } from "./app.js"
import connectDB from "./db/index.js"
import dotenv from "dotenv";
dotenv.config({
    path: "./.env"
})


connectDB()
.then(() => {
    app.listen(process.env.PORT || 5000, () => {
        console.log(`⚙️  Server is running on port :`,process.env.PORT )
    })
})
.catch((error) => {
    console.log("index.js : Mongodb connection failed ",error)
})