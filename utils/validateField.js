const validateField = (res, fieldName, fieldValue, errorMessage) => {
    if (!fieldValue) {
        res.status(422).json({ message: errorMessage });
        return true
    }
    return false
}

module.exports = validateField