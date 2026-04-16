const bcrypt = require("bcryptjs");

const generateHash = async() => {
    const password = "QWERTY!@#321";
    const hashedpassword = await bcrypt.hash(password, 10);
    console.log("hashed password", hashedpassword);
};

generateHash();