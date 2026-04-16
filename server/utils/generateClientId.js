const generateClienetId = () => {
    return "client_" + Math.random().toString(36).substring(2, 9);
}

module.exports = generateClienetId;