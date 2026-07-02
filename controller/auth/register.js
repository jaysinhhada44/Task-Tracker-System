const User = require("../../models/user.model");
const responseManager = require("../../utilities/response.manager");
const helper = require("../../utilities/helper");
const userSession = require("../../models/usersessions.model");
const { v4: uuidv4 } = require("uuid");
const { registerValidator } = require("../../validators/authValidator");

exports.register = async (req, res) => {
    try {
        // Validate request body
        const { error, value } = registerValidator.validate(req.body, { abortEarly: false, stripUnknown: true, });

        if (error) {
            return responseManager.badrequest({ message: error.details.map((err) => err.message), }, res);
        }

        const { companyid, companyname, firstname, lastname, phoneno, email, password, img, designation, companywebsite, industry, attendanceAllowed } = value;

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { phoneno }] }).lean();

        if (existingUser) {
            return responseManager.badrequest({ message: "Account already exists with same email or phone number.", }, res)
        }

        // Encrypt password
        const encryptedPassword = await helper.passwordEncryptor(password);

        // Create user
        const createdUser = await User.create({ companyid, companyname, firstname, lastname, phoneno, email, role: "admin", img, password: encryptedPassword, designation, companywebsite, industry, attendanceAllowed });

        // Set companyid equal to user id
        createdUser.companyid = createdUser._id;
        await createdUser.save();

        // Generate token
        const userid = createdUser._id.toString();
        const sessionid = uuidv4();

        const accessToken = await helper.generateAccessToken({
            userid,
            sessionid,
            role: createdUser.role,
            companyid: createdUser.companyid,
        });

        // Save session
        await userSession.create({
            _id: sessionid,
            userid,
            token: accessToken,
            isactive: true,
        });

        return responseManager.onSuccess("User Created Successfully!", { accessToken, user: createdUser, }, res);
    } catch (error) {
        console.error(error);
        return responseManager.onError(error, res);
    }
}



























// // const accessToken = await helper.generateAccessToken({ userid, sessionid });

// // await userSession.create({
// //     _id: sessionid,
// //     userid,
// //     token: accessToken,
// //     isactive: true
// // });

// // return responseManager.onSuccess('User Created Successfully!', { accessToken, user: { createdUser }}, res)

// // const createdUser = await User.create(newUser)

// // const token = await helper.generateAccessToken({
// //     _id: createdUser._id,
// //     email: createdUser.email,
// //     role: createdUser.role,
// //     companyid: createdUser._id
// // })

// // return responseManager.onSuccess('User Create Successfully!', { accessToken, user: createdUser }, res)


















// // const User = require('../../models/user.model')
// // const responseManager = require('../../utilities/response.manager')
// // const helper = require('../../utilities/helper')
// // const jwt = require('jsonwebtoken')
// // const bcrypt = require('bcrypt')

// // exports.register = async (req, res) => {
// //     const { name, phoneno, email, password, img } = req.body

// //     const existUser = await User.findOne({ $or: [{ email }, { phoneno }]}).lean()
// //     if (existUser != null) {
// //         return responseManager.badrequest({ message: "User Already exist please login." }, res)
// //     }
// //     try {
// //         const hashedPassword = await bcrypt.hash(password, 12)

// //         const newUser = {
// //             name, phoneno, email, password: hashedPassword, role: 'employee', img
// //         }

// //         const addUser = await User.create(newUser)

// //         return responseManager.onSuccess("User Registered Successfully!", addUser, res)

// //     } catch (error) {
// //         console.error(error)
// //         return responseManager.onError(error, res)
// //     }
// // }