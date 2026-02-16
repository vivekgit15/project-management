require('dotenv').config()
const express = require('express')
const cors = require('cors')
const {clerkMiddleware} = require('@clerk/express')
const connectToDB = require('./configs/db')
const {serve} = require('inngest/express')
const {inngest , functions} = require('./inngest/index')
const {Webhook} = require('svix')

const app = express()
connectToDB()

app.post("/api/webhooks/clerk", express.raw({ type: "application/json" }), async (req, res) => {
  try {
    const payload = req.body.toString();
    const headers = {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    };

    const wh = new Webhook(process.env.WEB_HOOK_SECRET);
    const evt = wh.verify(payload, headers); // { type, data }

    await inngest.send({
      name: `clerk/${evt.type}`, // user.created -> clerk/user.created
      data: evt.data,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(400).json({ ok: false, error: err.message });
  }

});

//  console.log("Webhook hit");
// console.log("svix-id:", req.headers["svix-id"]);

// const evt = wh.verify(payload, headers);
// console.log("Clerk event:", evt.type);

// await inngest.send({ name: `clerk/${evt.type}`, data: evt.data });
// console.log("Event sent to Inngest");

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