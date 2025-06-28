const bcrypt = require('bcrypt');

async function encryptPassword(plainPassword) {
    const saltRounds = 10;
    const hash = await bcrypt.hash(plainPassword, saltRounds);
    return hash;
}

async function comparePassword(plainPassword, hash) {
    return await bcrypt.compare(plainPassword, hash);
}

module.exports = {
    encryptPassword,
    comparePassword
};