const router = require('koa-router')()
const Admin = require('../controllers/admin')

router.prefix('/admin')

router.get('/getAllAdmins', Admin.getAllAdmins)

router.post('/createAdmin', Admin.createAdmin)

router.post('/updatepwdById', Admin.updatepwdById)

router.get('/deleteById', Admin.deleteById)

module.exports = router
