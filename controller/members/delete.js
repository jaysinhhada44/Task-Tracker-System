const Member = require('../../models/member.model')
const responseManager = require('../../utilities/response.manager')

exports.removeMember = async (req, res) => {
    try {

        const { memberid } = req.body
        const userid = req.user.userid

        if (!memberid) {
            return responseManager.badrequest({ message: "Please enter id..." }, res)
        }

        const deleteMember = await Member.findByIdAndDelete({ _id: memberid, companyid: req.user.companyid })

        return responseManager.onSuccess('Member remover successfully', deleteMember, res)

    } catch (error) {
        console.error(error)
        return responseManager.onError(error, res)
    }
}