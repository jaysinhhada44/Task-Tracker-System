const express = require('express')
const router = express.Router()
const registerCtrl = require('../../controller/auth/register')
const loginCtrl = require('../../controller/auth/login')
const userProfile = require('../../controller/auth/profile')
const dashCtrl = require('../../controller/auth/dashboard')
const upldFile = require('../../controller/auth/profile')
// const { registerValidator, loginValidator } = require('../../validators/authValidator')
const upload = require('../../utilities/multer')
const helper = require('../../utilities/helper')

router.post('/register', registerCtrl.register)
router.post('/login',  loginCtrl.login)
router.get('/view-profile', helper.authenticateToken, userProfile.profile)
router.put('/update-profile', helper.authenticateToken, userProfile.updatedProfile)
router.get('/admin-dashboard', helper.authenticateToken, helper.rolePermission("admin","manager"), dashCtrl.adminDashboard)
router.post('/upload-files', helper.authenticateToken, upload.single('file'), upldFile.uploadFile)


module.exports = router