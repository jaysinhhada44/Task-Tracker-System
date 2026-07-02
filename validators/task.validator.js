const Joi = require('joi')

exports.createTaskSchema = Joi.object({

    taskid: Joi.string().optional().allow("", null),

    bucketid: Joi.string().optional().allow("", null),

    title: Joi.string().trim().min(3).max(150).required(),

    description: Joi.string().trim().min(5).required(),

    assignedTo: Joi.string().required(),

    priority: Joi.string().valid("Low", "Medium", "High").optional(),

    status: Joi.string().valid("todo", "in_progress", "completed", "cancelled").optional(),

    attachmentRequired: Joi.boolean().optional(),

    dueDate: Joi.date().optional(),

    dueTime: Joi.string().optional(),

    recurringTask: Joi.boolean().optional(),

    recurringType: Joi.string().valid( "Daily", "Weekly", "Monthly", "Yearly").optional()
})