const bcrypt = require('bcrypt')

const salt = 8

const appsec = {

    generateHashPassword: async (plainPassword) => await bcrypt.hash(plainPassword, salt),

    comparePassword: async (password, hash) => await bcrypt.compare(password, hash),

    encrptKey : async () => {

        let hsKey = process.env.HS_KEY;
        if(!hsKey)
        {
         return 'HS-Key not found'
        }
 
         // Hash the hsKey with bcrypt
         let setKey = await appsec.generateHashPassword(hsKey);
         return setKey;
 }
}

module.exports = appsec