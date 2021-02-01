// 导入模型
const Admin = require('../models/admin')

module.exports = {

    async getAllAdmins(ctx, next) {
        try {
            let data = await Admin.findAll()
            ctx.body = { msg: 1001, data }
        } catch (err) {
            ctx.body = { code: -1, msg: 1000, }
        }
        await next();
    },

    async createAdmin(ctx, next) {
        let req = ctx.request.body
        if (!req.username || !req.password) {
            ctx.body = { code: -1, msg: 1002 }
            return await next();
        }
        try {
            let data = await Admin.createAdmin(req)
            ctx.body = { msg: 1003, data }
        } catch (err) {
            ctx.body = { code: -1, msg: 1000 }
        }
        await next();
    },

    async updatepwdById(ctx, next) {
        let req = ctx.request.body
        if (req.id && req.password) {
            try {
                await Admin.updatepwdById(req)
                ctx.body = { msg: 1004 }
            } catch (err) {
                ctx.body = { code: -1, msg: 1000 }
            }
        } else {
            ctx.body = { code: -1, msg: 1002 }
        }
        await next();
    },

    async deleteById(ctx, next) {
        let query = ctx.request.query // 获取get请求参数
        if (query && query.id) {
            try {
                await Admin.deleteById(query.id)
                ctx.body = { msg: 1005 }
            } catch (err) {
                ctx.body = { code: -1, msg: 1000 }
            }
        } else {
            ctx.body = { code: -1, msg: 1002 }
        }
        await next();
    }
}