require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
const pengelolaRoutes = require('./routes/pengelolaRoutes')
const wisataRoutes = require('./routes/wisataRoutes')
const cors = require('cors')

const app = express()
const port = process.env.PORT || 5050

app.use(express.static('public'))
app.use(bodyParser.json())
app.use(cors())

app.get('/', (req,res) => {
    res.json({message:'Berhasil'})
})

//AUTH
app.use('/auth', authRoutes)

//USER
app.use('/user', userRoutes)

//PENGELOLA
app.use('/pengelola', pengelolaRoutes)

//WISATA
app.use('/wisata', wisataRoutes)

app.listen(port, () => {
    console.log(`App listening on ${port} you can go to http://localhost:${port}`)
})