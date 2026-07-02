const express = require('express')
const router = express.Router()
const attendanceCtrl = require('../../controller/attendance/create')
const attendanceLst = require('../../controller/attendance/list')
const attendanceGetone = require('../../controller/attendance/getone')
const attendanceDel = require('../../controller/attendance/delete')
const helper = require('../../utilities/helper')

router.post('/attendance', helper.authenticateToken, attendanceCtrl.attendanceAction)
router.get('/all-attendance', helper.authenticateToken, helper.rolePermission("admin","manager"), attendanceLst.attendanceList)
router.post('/get-attendance', helper.authenticateToken, attendanceGetone.getAttendance)
router.delete('/remove-attendance', helper.authenticateToken, helper.rolePermission("admin"), attendanceDel.deleteAttendance)

module.exports = router