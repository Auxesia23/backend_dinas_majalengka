require('dotenv').config()
const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const cors = require('cors')
const rateLimit = require('express-rate-limit')

const app = express()
const port = process.env.PORT || 5050

const globalLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 1000,
    message: "Terlalu bayak permintaan dari IP ini coba lagi setelah 1 menit"
})

app.use(globalLimiter)

const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
const pengelolaRoutes = require('./routes/pengelolaRoutes')
const wisataRoutes = require('./routes/wisataRoutes')
const dinasRoutes = require('./routes/dinasRoutes')
const scannerRoutes = require('./routes/scannerRoutes')

app.use(express.static('public'))
app.use(bodyParser.json())
app.use(cors())

//DINAS
app.use('/dinas', dinasRoutes)

//AUTH
app.use('/auth', authRoutes)

//USER
app.use('/user', userRoutes)

//PENGELOLA
app.use('/pengelola', pengelolaRoutes)

//WISATA
app.use('/wisata', wisataRoutes)

//SCANNER
app.use('/scan', scannerRoutes)

//GET VIDEO
app.get('/videoAds', (req, res) => {
    const videoPath = path.join(__dirname, 'public', 'video', 'VideoIklan.mp4')
    res.sendFile(videoPath)
})

app.listen(port, () => {
    console.log(`App listening on ${port} you can go to http://localhost:${port}`)
})