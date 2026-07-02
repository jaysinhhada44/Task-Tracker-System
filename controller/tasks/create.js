const User = require('../../models/user.model')
const Task = require('../../models/task.model')
const Member = require('../../models/member.model')
const Bucket = require('../../models/bucket.model')
const responseManager = require('../../utilities/response.manager')
const notification = require('../../utilities/helper')
const { createTaskSchema } = require('../../validators/task.validator')

exports.createTask = async (req, res) => {
    try {
        const { error, value } = createTaskSchema.validate(req.body, { abortEarly: false, stripUnknown: true })

        if (error) {
            return responseManager.badrequest({ message: error.details.map(x => x.message) }, res)
        }

        const { taskid, bucketid, title, description, assignedTo, priority, status, attachmentRequired, dueDate, dueTime, recurringTask, recurringType } = value

        const createdBy = req.user?.userid
        const companyid = req.user.companyid

        const assignedExists = await Member.exists({ _id: assignedTo, companyid: req.user.companyid })

        if (!assignedExists) {
            return responseManager.badrequest({ message: "Assigned member not found" }, res)
        }

        if (bucketid) {

            const bucketExists = await Bucket.exists({ _id: bucketid, companyid: req.user.companyid })

            if (!bucketExists) {
                return responseManager.badrequest({ message: 'Bucket not found' }, res)
            }
        }

        const taskData = { createdBy, title, bucketid, description, assignedTo, priority: "Medium", status: "todo", dueDate, dueTime, attachmentRequired, recurringTask, recurringType, assignedAt: new Date() }

        if (taskid) {
            const existingTask = await Task.findById({ _id: taskid, companyid: req.user.companyid }).lean()

            if (!existingTask) {
                return responseManager.badrequest({ message: "Task not found" }, res)
            }

            const oldStatus = existingTask.status
            const newStatus = status || oldStatus

            if (oldStatus === "todo" && newStatus === "in_progress") { taskData.workStartedAt = new Date() }

            if (oldStatus === "in_progress" && newStatus === "completed") {

                const now = new Date()

                taskData.workCompletedAt = now

                const startTime = existingTask.workStartedAt

                if (startTime) {
                    const diff = now - new Date(startTime)
                    taskData.totalWorkedMinutes = Math.floor(diff / 60000)
                } else {
                    taskData.totalWorkedMinutes = 0
                }
            }

            const updatedTask = await Task.findByIdAndUpdate(
                { taskid, companyid: req.user.companyid },
                { $set: { ...taskData, status: newStatus } },
                { new: true, runValidators: true }
            )

            return responseManager.onSuccess("Task updated successfully!", updatedTask, res)

        } else {

            const newTask = await Task.create({ ...taskData, companyid, createdBy })

            const count = await Task.countDocuments({ companyid: req.user.companyid })

            try {
                await notification.notify({
                    companyid,
                    userid: assignedTo,
                    title: "New Task Assigned",
                    message: `You have been assigned "${title}"`,
                    type: "task_assigned",
                    referenceid: newTask._id
                })
            } catch (error) {
                console.error(error)
                return responseManager.onError(error, res)
            }

            return responseManager.onSuccess("Task created successfully!", { newTask, count }, res)
        }

    } catch (error) {
        console.error(error)
        return responseManager.onError(error, res)
    }
}