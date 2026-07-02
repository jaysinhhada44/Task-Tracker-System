const express = require('express')
const router = express.Router()
const createCtrl = require('../../controller/tasks/create')
const deleteCtrl = require('../../controller/tasks/delete')
const getoneCtrl = require('../../controller/tasks/getone')
const listCtrl = require('../../controller/tasks/list')
const updateCtrl = require('../../controller/tasks/member.task.update')
const helper = require('../../utilities/helper')

router.post('/create-task', helper.authenticateToken, helper.rolePermission("admin","manager"), createCtrl.createTask)
router.delete('/remove-task', helper.authenticateToken, deleteCtrl.deleteTask)
router.get('/get-task', helper.authenticateToken, getoneCtrl.getontask)
router.get('/all-task', helper.authenticateToken, helper.rolePermission("admin","manager"), listCtrl.tasksList)
router.put('/update-task-status', helper.authenticateToken, updateCtrl.updatebyMember)

module.exports = router