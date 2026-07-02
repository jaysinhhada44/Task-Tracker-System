const Joi = require('joi')

exports.registerValidator = Joi.object({
    companyid: Joi.string().optional(),

    companyname: Joi.string()
        .trim()
        .required()
        .messages({
            "string.empty": "Company name is required.",
            "any.required": "Company name is required."
        }),

    firstname: Joi.string()
        .trim()
        .required()
        .messages({
            "string.empty": "First name is required.",
            "any.required": "First name is required."
        }),

    lastname: Joi.string()
        .trim()
        .required()
        .messages({
            "string.empty": "Last name is required.",
            "any.required": "Last name is required."
        }),

    phoneno: Joi.string()
        .trim()
        .pattern(/^[0-9]{10}$/)
        .required()
        .messages({
            "string.empty": "Phone number is required.",
            "string.pattern.base": "Phone number must be 10 digits.",
            "any.required": "Phone number is required."
        }),

    email: Joi.string()
        .trim()
        .email()
        .required()
        .messages({
            "string.email": "Please enter a valid email.",
            "string.empty": "Email is required.",
            "any.required": "Email is required."
        }),

    password: Joi.string()
        .min(6)
        .required()
        .messages({
            "string.min": "Password must be at least 6 characters.",
            "string.empty": "Password is required.",
            "any.required": "Password is required."
        }),

    role: Joi.string().optional(),

    img: Joi.string().uri().allow("", null).optional(),

    designation: Joi.string()
        .trim()
        .required()
        .messages({
            "string.empty": "Designation is required.",
            "any.required": "Designation is required."
        }),

    companywebsite: Joi.string().uri().allow("", null).optional(),

    industry: Joi.string().allow("", null).optional(),

    attendanceAllowed: Joi.boolean().optional()
});

exports.loginValidator = Joi.object({
    username: Joi.string().trim().required()
        .custom((value, helpers) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const phoneRegex = /^[0-9]{10}$/;

            if (emailRegex.test(value) || phoneRegex.test(value)) {
                return value;
            }

            return helpers.message("Username must be a valid email or 10-digit phone number.");
        }),

    password: Joi.string().required()
        .messages({
            "string.empty": "Password is required.",
            "any.required": "Password is required."
        })
});