const express = require('express')
const router = express.Router()
const crateCtrl = require('../../controller/buckets/create')
const deleteCtrl = require('../../controller/buckets/delete')
const getoneCtrl = require('../../controller/buckets/getone')
const listCtrl = require('../../controller/buckets/list')
const helper = require('../../utilities/helper')

router.post('/create-bucket', helper.authenticateToken, helper.rolePermission("admin","manager"), crateCtrl.createBucket)
router.delete('/remove-bucket', helper.authenticateToken, helper.rolePermission("admin"), deleteCtrl.removeBucket)
router.get('/get-bucket', helper.authenticateToken, getoneCtrl.getOne)
router.get('/all-bucket', helper.authenticateToken, helper.rolePermission("admin","manager"), listCtrl.bucketList)

module.exports = router