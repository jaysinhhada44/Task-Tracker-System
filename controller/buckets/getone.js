const Bucket = require('../../models/bucket.model')
const responseManager = require('../../utilities/response.manager')

exports.getOne = async (req, res) => {
    try {
        const { bucketid } = req.body
        const userid = req.user.userid

        if (!bucketid) {
            return responseManager.badrequest({ message: "Please enter Bucket id..." }, res)
        }

        const bucket = await Bucket.findById({ _id: bucketid, companyid: req.user.companyid })

        if (!bucket) {
            return responseManager.badrequest({ message: "Bucket not found" }, res)
        }

        return responseManager.onSuccess('Bucket fetched', bucket, res)

    } catch (error) {
        console.error(error)
        return responseManager.onError(error, res)
    }
}