const Bucket = require('../../models/bucket.model')
const responseManager = require('../../utilities/response.manager')

exports.createBucket = async (req, res) => {
    try {
        const { bucketid, bucketname } = req.body
        const userid = req.user.userid
        const companyid = req.user.companyid

        if (!bucketname) {
            return responseManager.badrequest({ message: "Please Enter Bucketname..." }, res)
        }

        if (bucketid) {
            const existingBucket = await Bucket.findById({ _id: bucketid, companyid: req.user.companyid })

            if (!existingBucket) {
                return responseManager.badrequest({ message: "Bucket not found..." }, res)
            }

            const duplicateBucket = await Bucket.findOne({ bucketname, companyid: req.user.companyid, _id: { $ne: bucketid } })

            if (duplicateBucket) {
                return responseManager.badrequest({ message: "Bucket already exists..." }, res)
            }
 
            const updatedBucket = await Bucket.findByIdAndUpdate(
                { _id: bucketid, companyid: req.user.companyid },
                { bucketname },
                { new: true, runValidators: true }
            )

            return responseManager.onSuccess('Bucket Updated Successfully!', updatedBucket, res)

        } else {
            const existingBucket = await Bucket.findOne({ bucketname, companyid: req.user.companyid })

            if (existingBucket) {
                return responseManager.badrequest({ message: "Bucket already exists..." }, res)
            }

            const createBucket = await Bucket.create({ bucketname, createdBy: userid, companyid })

            const count = await Bucket.countDocuments({ companyid: req.user.companyid })

            return responseManager.onSuccess('Role created successfully', createBucket, res)

        }

    } catch (error) {
        console.error(error)
        return responseManager.onError(error, res)
    }
}