const {User, Pengelola, Wisata, GaleriWisata, TransaksiDetail} = require('../models')

//AUTOMATIC GENERATE USERID
const generateUserId = async() => {
    const lastUser = await User.findOne({
        order: [['id_user', 'DESC']]
    })

    let nextIdNumber = 1
    if (lastUser) {
        const lastId = lastUser.id_user
        const lastNumber = parseInt(lastId.replace('USR', ''), 10)
        nextIdNumber = lastNumber + 1
    }
    const formattedNumber = String(nextIdNumber).padStart(4, '0')
    return `USR${formattedNumber}`
}

//AUTOMATIC GENERATE PENGELOLAID
const generatePengelolaId = async() => {
    const lastUser = await Pengelola.findOne({
        order: [['id_pengelola', 'DESC']]
    })

    let nextIdNumber = 1
    if (lastUser) {
        const lastId = lastUser.id_pengelola
        const lastNumber = parseInt(lastId.replace('PNGL', ''), 10)
        nextIdNumber = lastNumber + 1
    }
    const formattedNumber = String(nextIdNumber).padStart(4, '0')
    return `PNGL${formattedNumber}`
}

//AUTOMATIC GENERATE WISATAID
const generateWisataId = async() => {
    const lastUser = await Wisata.findOne({
        order: [['id_wisata', 'DESC']]
    })

    let nextIdNumber = 1
    if (lastUser) {
        const lastId = lastUser.id_wisata
        const lastNumber = parseInt(lastId.replace('WST', ''), 10)
        nextIdNumber = lastNumber + 1
    }
    const formattedNumber = String(nextIdNumber).padStart(4, '0')
    return `WST${formattedNumber}`
}

//AUTOMATIC GENERATE WISATAID
const generateGaleriWisataId = async() => {
    const lastUser = await GaleriWisata.findOne({
        order: [['id_galery_wisata', 'DESC']]
    })

    let nextIdNumber = 1
    if (lastUser) {
        const lastId = lastUser.id_galery_wisata
        const lastNumber = parseInt(lastId.replace('GLR', ''), 10)
        nextIdNumber = lastNumber + 1
    }
    const formattedNumber = String(nextIdNumber).padStart(4, '0')
    return `GLR${formattedNumber}`
}

module.exports = {
    generateUserId,
    generatePengelolaId,
    generateWisataId,
    generateGaleriWisataId
}