require('dotenv').config()
const express = require('express')
const cors = require('cors')
const {clerkMiddleware} = require('@clerk/express')
const connectToDB = require('./configs/db')
const {serve} = require('inngest/express')
const {inngest , functions} = require('./inngest/index')

const app = express()
connectToDB()
app.use(express.json())
app.use(cors())
app.use(clerkMiddleware())


app.get('/' ,(req,res) =>{
    res.send("Server is live")
})


app.use('/api/inngest' ,serve({client:inngest , functions}));

const PORT = process.env.PORT || 5000
app.listen(PORT , () =>{
    console.log(`Server is running on port ${PORT}`)
})