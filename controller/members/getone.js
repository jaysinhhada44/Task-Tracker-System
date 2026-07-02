const Member = require('../../models/member.model')
const responseManager = require('../../utilities/response.manager')

exports.getMember = async (req, res) => {
    try {
        const { memberid } = req.body
        const userid = req.user.userid

        if (!memberid) {
            return responseManager.badrequest({ message: "Please enter Id..." }, res)
        }

        const user = await Member.findById({ _id: memberid, companyid: req.user.companyid }).lean()

        if (!user) {
            return responseManager.badrequest({ message: "User not found" }, res)
        }

        return responseManager.onSuccess('User fetched', user, res)

    } catch (error) {
        console.error(error)
        return responseManager.onError(error, res)
    }
}