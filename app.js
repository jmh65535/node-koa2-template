/*
 * @Author: jmh
 * @Github: https://github.com/hellojinjin123
 * @Date: 2021-01-31 17:22:29
 * @LastEditors: jmh
 * @LastEditTime: 2021-02-02 00:03:38
 * @Description: koa2+koa-generator+mysql 服务器快速搭建项目后台
 */

const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const path = require('path')

const index = require('./routes/index')
const users = require('./routes/users')
const admin = require('./routes/admin')

// midwares
const { loggerMiddleware } = require('./midwares/logger')
const { responseHandler, errorHandler } = require('./midwares/response')

// 引入
const config = require('./config')

// error handler
onerror(app)

app.use(loggerMiddleware)
app.use(errorHandler)

// middlewares
app.use(bodyparser({
  enableTypes: ['json', 'form', 'text']
}))
app.use(json())
app.use(logger())

app.use(require('koa-static')(path.resolve(__dirname, config.publicPath)))

app.use(views(__dirname + '/views', {
  extension: 'pug'
}))


// logger
// app.use(async (ctx, next) => {
//   const start = new Date()
//   await next()
//   const ms = new Date() - start
//   console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
// })

// routes
app.use(index.routes(), index.allowedMethods())
app.use(users.routes(), users.allowedMethods())
app.use(admin.routes(), admin.allowedMethods())

app.use(responseHandler)

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app
