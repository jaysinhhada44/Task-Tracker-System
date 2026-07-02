const express = require('express')
const router = express.Router()
const helper = require('../../utilities/helper')
const roleCtrl = require('../../controller/roles/create')
const deleteCtrl = require('../../controller/roles/delete')
const getoneCtrl = require('../../controller/roles/getone')
const listCtrl = require('../../controller/roles/list')

router.post('/create-role', helper.authenticateToken, helper.rolePermission("admin","manager"), roleCtrl.createRole)
router.delete('/remove-role', helper.authenticateToken, helper.rolePermission("admin"), deleteCtrl.removeRole)
router.get('/get-role', helper.authenticateToken, helper.rolePermission("admin"), getoneCtrl.oneRole)
router.get('/all-role', helper.authenticateToken, helper.rolePermission("admin","manager"), listCtrl.rolesList)

module.exports = router