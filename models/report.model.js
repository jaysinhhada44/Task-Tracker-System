const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({

    companyid: {
        type: mongoose.Schema.Types.ObjectId,
        // ref: "User",
        // required: true,
        // index: true
    },
    generatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        // required: true
    },
    generatedByType: {
        type: String,
        enum: ["User", "Member"],
        default: "User"
    },
    reportType: {
        type: String,
        enum: [
            "all",
            "attendance",
            "task",
            "leave",
            "member",
            "bucket",
            "dashboard"
        ],
        // required: true,
        // index: true
    },
    fromDate: {
        type: Date,
        // default: null
    },
    toDate: {
        type: Date,
        // default: null
    },
    filters: {
        memberid: {
            type: mongoose.Schema.Types.ObjectId,
            // ref: "Member",
            // default: null
        },
        bucketid: {
            type: mongoose.Schema.Types.ObjectId,
            // ref: "Bucket",
            // default: null
        },
        priority: {
            type: String,
            default: ""
        },
        status: {
            type: String,
            default: ""
        }
    },
    exportType: {
        type: String,
        enum: ["json", "pdf", "excel", "csv"],
        default: "pdf"
    },
    reportData: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    fileUrl: {
        type: String,
        default: ""
    }
}, { timestamps: true } );

module.exports = mongoose.model("Report", reportSchema);