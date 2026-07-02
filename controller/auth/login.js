const User = require('../../models/user.model')
const Member = require('../../models/member.model')
const Role = require('../../models/role.model')
const responseManager = require('../../utilities/response.manager')
const helper = require('../../utilities/helper')
const { v4: uuidv4 } = require('uuid');
const userSession = require('../../models/usersessions.model')
const { loginValidator } = require('../../validators/authValidator')

exports.login = async (req, res) => {

    const { error, value } = loginValidator.validate(req.body, { abortEarly: false, stripUnknown: true, })

    if (error) {
        return responseManager.badrequest({ message: error.details.map((err) => err.message), }, res);
    }

    const { username, password } = value

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username);
    let query = isEmail
        ? { email: username, isActive: true, isVerified: true, isDeleted: false }
        : { phoneno: username, isActive: true, isVerified: true, isDeleted: false }

    try {

        let user = await User.findOne(query).lean()

        if (!user) {
            user = await Member.findOne(query).lean()
        }

        if (!user) {
            return responseManager.badrequest({ message: "Invalid Username and Password" }, res)
        }

        const decryptedPassword = await helper.passwordDecryptor(user.password)

        if (decryptedPassword !== password) {
            return responseManager.badrequest({ message: 'Invalid password' }, res)
        }

        const userid = user._id.toString()
        const sessionid = uuidv4()

        let roleName = user.role;

        if (!roleName && user.roleid) {

            const role = await Role.findById(user.roleid)
                .select('rolename')
                .lean();

            if (role) { roleName = role.rolename.toLowerCase() }
        }

        const companyid = user.companyid || user._id

        if (user.role !== 'admin' && !user.companyid) {
            return responseManager.badrequest({ message: 'Company not assigned' }, res)
        }

        const accessToken = await helper.generateAccessToken({ userid, sessionid, role: roleName, companyid })

        await userSession.create({
            _id: sessionid,
            userid,
            token: accessToken,
            isactive: true
        })

        return responseManager.onSuccess('Login successful',
            {
                accessToken,
                user: {
                    id: user._id,
                    name: `${user.firstname} ${user.lastname}`,
                    email: user.email,
                    role: user.role,
                    roleid: user.roleid
                }
            }, res)

    } catch (error) {
        console.error(error)
        return responseManager.onError(error, res)
    }
}


// const responseManager = require('../../utilities/response.manager')
// const User = require('../../models/user.model')
// const jwt = require('jsonwebtoken')
// const bcrypt = require('bcrypt')

// exports.login = async (req, res) => {
//     const { username, password } = req.body

//     const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username);
//     let query = isEmail
//         ? { email: username, isActive: true, isVerified: true, isDeleted: false }
//         : { phoneno: username, isActive: true, isVerified: true, isDeleted: false };

//     const existedUser = await User.findOne(query).lean()

//     // const existedUser = await User.findOne({ email, isDeleted: false }).lean()
//     if (!existedUser) {
//         return responseManager.badrequest({ message: "User doesn't exist, Please register first!" }, res)
//     }

//     try {
//         const isMatch = await bcrypt.compare(password, existedUser.password)
//         if (!isMatch) {
//             return responseManager.badrequest({ message: "Invalid Credential!" }, res)
//         }

//         const token = jwt.sign({
//             id: existedUser._id,
//             role: existedUser.role
//         },
//             process.env.JWT_SECRET,
//             { expiresIn: "7d" })

//         return responseManager.onSuccess('User LoggedIn Successfully!', { token }, res)

//     } catch (error) {
//         console.error(error)
//         return responseManager.onError(error, res)
//     }
// }