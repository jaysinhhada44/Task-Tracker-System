const jwt = require("jsonwebtoken");
const CryptoJS = require("crypto-js");
const { v4: uuidv4 } = require('uuid');
const responseManager = require('.././utilities/response.manager')
const Notification = require('../models/notification.model')
const socket = require('../controller/socket/create')

const ACCESS_TOKEN_TTL = process.env.ACCESS_TOKEN_TTL || '30d';

exports.generateAccessToken = async (userData) => {
    return jwt.sign(userData, process.env.ACCESS_TOKEN_SECRET || 'secret123', { expiresIn: ACCESS_TOKEN_TTL });
};

exports.authenticateToken = async (req, res, next) => {
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
        const token = bearerHeader && bearerHeader.split(' ')[1];
        if (!token) return res.status(401).json({ IsSuccess: false, Message: 'Unauthorized', Data: null });
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || 'secret123', async (err, auth) => {
            if (err) {
                console.error("JWT verification failed:", err.message);
                return res.status(401).json({ IsSuccess: false, Message: 'Unauthorized', Data: null });
            } else {
                req.user = auth
                next();
            }
        });
    } else {
        return res.status(401).json({ IsSuccess: false, Message: 'Unauthorized', Data: null });
    }
};

const PASSWORD_ENCRYPTION_SECRET = process.env.PASSWORD_ENCRYPTION_SECRET || 'encryption_secret123';

exports.passwordDecryptor = async (passwordKeyDecrypt) => {
    try {
        var decLayer1 = CryptoJS.TripleDES.decrypt(passwordKeyDecrypt, PASSWORD_ENCRYPTION_SECRET);
        var deciphertext1 = decLayer1.toString(CryptoJS.enc.Utf8);
        var decLayer2 = CryptoJS.DES.decrypt(deciphertext1, PASSWORD_ENCRYPTION_SECRET);
        var deciphertext2 = decLayer2.toString(CryptoJS.enc.Utf8);
        var decLayer3 = CryptoJS.AES.decrypt(deciphertext2, PASSWORD_ENCRYPTION_SECRET);
        var finalDecPassword = decLayer3.toString(CryptoJS.enc.Utf8);
        return finalDecPassword;
    } catch (err) {
        throw err;
    }
};

exports.passwordEncryptor = async (passwordKeyEncrypt) => {
    try {
        var encLayer1 = CryptoJS.AES.encrypt(passwordKeyEncrypt, PASSWORD_ENCRYPTION_SECRET).toString();
        var encLayer2 = CryptoJS.DES.encrypt(encLayer1, PASSWORD_ENCRYPTION_SECRET).toString();
        var finalEncPassword = CryptoJS.TripleDES.encrypt(encLayer2, PASSWORD_ENCRYPTION_SECRET).toString();
        return finalEncPassword;
    } catch (err) {
        throw err;
    }
};

exports.passwordCompare = async (inputPassword, encryptedPassword) => {
    try {
        const decryptedPassword = await exports.passwordDecryptor(encryptedPassword);

        return decryptedPassword === inputPassword;
    } catch (err) {
        throw err;
    }
};

exports.rolePermission = (...roles) => {
    return (req, res, next) => {

        if (!req.user) {
            return responseManager.unauthorisedRequest("Unauthorized, Please Login First", res)
        }

        if (!roles.includes(req.user.role)) {
            return responseManager.forbiddenRequest("Access denied", res)
        }

        next()
    }
}

exports.notify = async ({ companyid, userid, title, message, type, referenceid }) => {

    const notification = await Notification.create({ companyid, userid, title, message, type, referenceid })

    socket.sendNotification(userid.toString(), { _id: notification._id, title, message, type, createdAt: notification.createdAt })

}

