const express = require('express')
const router = express.Router()
const helper = require('../../utilities/helper')
const leaveCtrl = require('../../controller/leave/create')
const deletCtrl = require('../../controller/leave/delete')
const getoneCtrl = require('../../controller/leave/getone')
const alleaveCtrl = require('../../controller/leave/list')

router.post('/create-leave', helper.authenticateToken, leaveCtrl.createLeave)
router.delete('/remove-leave', helper.authenticateToken, deletCtrl.deleteLeave)
router.get('/get-leave', helper.authenticateToken, getoneCtrl.getLeave)
router.get('/all-leave', helper.authenticateToken, helper.rolePermission("admin","manager"), alleaveCtrl.leaveList)

module.exports = router