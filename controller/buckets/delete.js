const Bucket = require('../../models/bucket.model')
const responseManager = require('../../utilities/response.manager')

exports.removeBucket = async (req, res) => {
    try {
        const { bucketid } = req.body
        const userid = req.user.userid

        if (!bucketid) {
            return responseManager.badrequest({ message: "Please enter Bucket id..." })
        }

        const deleteBucket = await Bucket.findByIdAndDelete({ _id: bucketid, companyid: req.user.companyid })

        return responseManager.onSuccess('Bucket removed', deleteBucket, res)

    } catch (error) {
        console.error(error)
        return responseManager.onError(error, res)
    }
}