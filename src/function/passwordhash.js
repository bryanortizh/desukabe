const bcrypt = require('bcrypt');

async function encryptPassword(plainPassword) {
    const saltRounds = 10;
    const hash = await bcrypt.hash(plainPassword, saltRounds);
    return hash;
}

module.exports = encryptPassword;