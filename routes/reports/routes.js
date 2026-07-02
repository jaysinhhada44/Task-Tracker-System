const express = require('express')
const router = express.Router()
const reportCtrl = require('../../controller/reports/report')
const helper = require('../../utilities/helper')

router.post('/report', helper.authenticateToken, helper.rolePermission('admin','manager'), reportCtrl.report)

module.exports = router