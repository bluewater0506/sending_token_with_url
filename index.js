const express = require('express')
const cors = require('cors');

const { SendFund, createWallet} = require('./controller')
const app = express()
app.use(express.json());
app.use(cors({
  origin: '*'
}));
require('dotenv').config()

const port = process.env.PORT

app.get('/', (req, res)=> {res.send("working")});
app.get('/sendfund', (req, res) => SendFund(req, res));
app.get('/createWallet', (req, res) => createWallet(req, res));


app.listen(port, () => {
  console.log(`Server running in port:${port}`)
})