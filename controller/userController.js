const { User, Wisata } = require('../models')

//PROTECTED
const getProtected = async(req, res) => {
    try {
        const id_user = req.user.id_user
        const data = await User.findOne({where: {id_user: id_user}})
        res.status(200).json({
            message:"Your data",
            data: data
        })
    } catch(err) {
        console.error(err)
        res.status(500).json({ message: "Server Error" })
    }
}

//READ all USER
const getAllUser = async(req,res) => {
    if(req.user.id_roles !== 'adm_wisata') {
        return res.status(403).json({message:"Role tidak Valid"})
    }
    try {
        const user = await User.findAll()
        res.json({
            message:"Success fetch data",
            data: user
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Server Error" })
    }
}


module.exports = {
    getProtected,
    getAllUser
}