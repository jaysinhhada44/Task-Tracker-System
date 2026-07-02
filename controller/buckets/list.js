const Bucket = require('../../models/bucket.model');
const responseManager = require('../../utilities/response.manager');

exports.bucketList = async (req, res) => {
    try {
        const userid = req.user.userid;

        const filter = { companyid: req.user.companyid, isDeleted: false }

        const { page = 1, limit = 50 } = req.query

        const skip = (page - 1) * limit

        const [buckets, count] = await Promise.all([
            Bucket.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .lean(),

            Bucket.countDocuments(filter)
        ])

        return responseManager.onSuccess('Buckets fetched successfully',{ buckets, count }, res)

    } catch (error) {
        console.error(error)
        return responseManager.onError(error, res)
    }
}

// const Bucket = require('../../models/bucket.model')
// const responseManager = require('../../utilities/response.manager')

// exports.bucketList = async (req, res) => {
//     try {
//         const userid = req.user.userid

//         const allBucket = await Bucket.find({ createdBy: userid }).lean()

//         if (allBucket.length === 0) {
//             return responseManager.badrequest({ message: "No buckets found..." }, res)
//         }

//         const count = await Bucket.countDocuments({ createdBy: userid })

//     } catch (error) {
//         console.error(error)
//         return responseManager.onError(error, res)
//     }
// }