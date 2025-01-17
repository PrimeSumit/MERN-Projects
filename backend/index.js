import express from "express"
const app = express()
import dotenv from "dotenv"

dotenv.config();
app.use(express.json())
const port = process.env.PORT

app.get('/',(req,res)=>{
    res.send("welcome to index page")
})

app.listen(port,()=>{
    console.log(`your server is running on http://localhost:${port}`)
})