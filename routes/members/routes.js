const express = require('express');
const router = express.Router();

const createCtrl = require('../../controller/members/create');
const deleteCtrl = require('../../controller/members/delete');
const getoneCtrl = require('../../controller/members/getone');
const listCtrl = require('../../controller/members/list');
const searchCtrl = require('../../controller/members/filter');
const userCtrl = require('../../controller/auth/profile');
const dashCtrl = require('../../controller/members/dashboard');
const mytaskCtrl = require('../../controller/members/my.task');
const helper = require('../../utilities/helper');

router.post( '/create-member', helper.authenticateToken, helper.rolePermission("admin", "manager"), createCtrl.createMember)
router.delete('/remove-member', helper.authenticateToken, helper.rolePermission("admin"), deleteCtrl.removeMember)
router.get('/get-member', helper.authenticateToken, helper.rolePermission("admin"), getoneCtrl.getMember)
router.post('/all-member', helper.authenticateToken, helper.rolePermission("admin", "manager"), listCtrl.allMembers)
router.get('/search-member', helper.authenticateToken, helper.rolePermission("admin", "manager"), searchCtrl.searchMember)
router.get('/view-profile', helper.authenticateToken, userCtrl.profile)
router.get('/my-task', helper.authenticateToken, mytaskCtrl.assignedTask)
router.get('/dashboard', helper.authenticateToken, dashCtrl.userDashboard)

module.exports = router;
























// const express = require('express')
// const router = express.Router()
// const createCtrl = require('../../controller/members/create')
// const deleteCtrl = require('../../controller/members/delete')
// const getoneCtrl = require('../../controller/members/getone')
// const listCtrl = require('../../controller/members/list')
// const searCtrl = require('../../controller/members/filter')
// const profileCtrl = require('../../controller/auth/profile')
// const userCtrl = require('../../controller/auth/profile')
// const dashCtrl = require('../../controller/members/dashboard')
// const mytaskCtrl = require('../../controller/members/my.task')
// const helper = require('../../utilities/helper')

// router.post('/create-member', helper.authenticateToken, helper.rolePermission("admin","manager"), createCtrl.createMember)
// router.delete('/remove-member', helper.authenticateToken, helper.rolePermission("admin"), deleteCtrl.removeMember)
// router.get('/get-member', helper.authenticateToken, helper.rolePermission("admin"), getoneCtrl.getMember)
// router.post('/all-member', helper.authenticateToken, helper.rolePermission("admin","manager"), listCtrl.allMembers)
// router.get('/search-member', helper.authenticateToken, helper.rolePermission("admin", "manager"), searCtrl.searchMember)
// router.get('/view-profile', helper.authenticateToken, userCtrl.profile)
// router.get('/my-task', helper.authenticateToken, mytaskCtrl.assignedTask)
// router.get('/dashboard', helper.authenticateToken, dashCtrl.userDashboard)

// module.exports = router