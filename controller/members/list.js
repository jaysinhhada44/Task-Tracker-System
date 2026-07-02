const Member = require('../../models/member.model')
const responseManager = require('../../utilities/response.manager')

exports.allMembers = async (req, res) => {
    try {

        const { search, createdBy, page = 1, limit = 50 } = req.body
        
        // const createdBy = req.user.userid
        // const userid = req.user.userid
        // const role = req.user.role

        let filter = { isDeleted: false, companyid: req.user.companyid }

        if (createdBy) {
            filter.createdBy = createdBy
        }

        const skip = (page - 1) * limit

        if (search) {
            filter = {
                createdBy,
                $or: [
                    { firstname: { $regex: search, $options: 'i' } },
                    { lastname: { $regex: search, $options: 'i' } }
                ]
            }
        }

        // const allMember = await Member.find(filter)
        //     .select('-password')
        //     .sort({ createdAt: -1 })
        //     .lean()

        const [allMember, total] = await Promise.all([
            Member.find(filter)
                .select('-password')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .lean(),

            Member.countDocuments(filter)
        ])

        return responseManager.onSuccess('Members fetched successfully!', {
            allMember,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / limit)
        }, res)

    } catch (error) {
        console.error(error)
        return responseManager.onError(error, res)
    }
}