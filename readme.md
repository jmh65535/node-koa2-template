# koa2+koa-generator+mysql快速搭建nodejs服务器
> 用koa的脚手架koa-generator可以快速生成项目骨架,可以用于发开或者测试接口
> https://github.com/hellojinjin123/node-koa2-template
## 1. 全局安装koa-generator(不用全局安装koa)
项目名字fast-koa
```cmd
npm install koa-generator -g
koa2 fast-koa
cd fast-koa
npm install
```
> 目录结构如下
-bin     // www 项目启动目录 node ./www
-public  // 静态网站放置目录 也就是vue dist代码放置的地 项目入口index.html
-routes  // 路由
-views   // 视图  服务器渲染使用的模板
-app.js  // 项目入口
-packaga.json

## 2. 启动项目
```json
// package.json
 "scripts": {
    "start": "node bin/www",
    "dev": "./node_modules/.bin/nodemon bin/www",
    "prd": "pm2 start bin/www",
    "test": "echo \"Error: no test specified\" && exit 1"
  }
```
运行npm run dev开启服务器
同时可以看到generator自带了nodemon(Nodemon 是一款非常实用的工具，用来监控你 node.js 源代码的任何变化和自动重启你的服务器)
如下图：服务器启动了
![avatar1][base64str1]

## 3. 项目入口app.js
```js
// app.js
const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')

const index = require('./routes/index')
const users = require('./routes/users')

// error handler
onerror(app)

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(path.resolve(__dirname, config.publicPath))))

app.use(views(__dirname + '/views', {
  extension: 'pug'
}))

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// routes
app.use(index.routes(), index.allowedMethods())
app.use(users.routes(), users.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app

```
可以在根目录路添加config.js 把一些公共的配置放入 比如数据库信息，端口，静态资源路径等
```js
// config.js
const path = require('path');
const config = {
    // 项目启动监听的端口
    port: 3000,

    publicPath: 'public',
    logPath: 'logs/koa-template.log',

    // 数据库配置
    database: {
        HOST: 'xxx',    // 数据库地址
        USERNAME: 'xxx',    // 用户名
        PASSWORD: 'xxx',    // 用户密码
        DATABASE: 'xxx',    // 数据库名
        PORT: 3306      // 数据库端口(默认: 3306)
    }
};

module.exports = config;
```

## 4. koa-static 静态资源中间件
`app.use(require('koa-static')(path.resolve(__dirname, config.publicPath))))` 
koa-generator已经配置了静态资源中间件，只要放入public目录，静态网站就可以运行
浏览http://localhost:3000/，服务器会优先读取public下的index.html
如果没有index.html，服务器会根据路由,判断'/'是否有内容返回，没有对应路由则返回404 not found 
因为koa-generator默认设置了路由，所以服务器运行返回了`Hello Koa 2!`
如下：
```js
router.get('/', async (ctx, next) => {
  await ctx.render('index', {
    title: 'Hello Koa 2!'
  })
})
```

## 5. 添加models目录
相当于服务器数据层,存放数据库模型(相当于建表),使用Sequelize进行mysql操作
```js
const { sequelize, Sequelize } = require('../config/db')
const { DataTypes, Model } = Sequelize

class Admin extends Model {

    /**
     * @description: 添加管理员
     * @param {*} username
     * @param {*} password
     * @return {*} 返回添加的数据
     */
    static async createAdmin({ username, password }) {
        return await this.create({
            username,
            password
        })
    }

    /**
     * @description: 根据id修改管理员密码
     * @param {*} id
     * @return {*}  返回修改的数据
     */    
    static async updatepwdById({id, password}) {
        return await this.update({ password }, {
            where: {
                id
            }
        })
    }

    /**
     * @description: 根据id删除管理员
     * @param {*} id
     * @return {*} 
     */    
    static async deleteById(id){
        return await this.destroy({
            where: {
                id
            }
        })
    }

}
// 初始化表结构
Admin.init(
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false, //非空
            autoIncrement: true, //自动递增
            primaryKey: true //主键
        },
        username: {
            type: DataTypes.STRING,
            field: "username",
            allowNull: false,
            unique: true   // 唯一约束 用户名不能重复
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        }
    }, {
    underscored: true, //额外字段以下划线来分割
    timestamps: true, //取消默认生成的createdAt、updatedAt字段
    createdAt: "created_at",
    updatedAt: "updated_at",
    freezeTableName: true, // Model 对应的表名将与model名相同
    comment: "管理员表类",
    // paranoid: true      //虚拟删除
    sequelize, // 我们需要传递连接实例
    // modelName: 'Admin', // 我们需要选择模型名称
    // tableName: 'Admin'  // 表名
}
)

    // 创建表格
    ; (async () => {
        await Admin.sync();
        console.log("Admin表刚刚(重新)创建！");
        // 这里是代码
    })()
// 定义的模型是类本身
// console.log(User === sequelize.models.User); // true
module.exports = Admin

```


## 6. mysql数据库的使用(Sequelize stars 23.6k in github )
Sequelize 是一个基于 promise 的 Node.js ORM, 目前支持 Postgres, MySQL, MariaDB, SQLite 以及 Microsoft SQL Server. 它具有强大的事务支持, 关联关系, 预读和延迟加载,读取复制等功能。

Sequelize 遵从 语义版本控制。 支持 Node v10 及更高版本以便使用 ES6 功能。https://www.sequelize.com.cn/core-concepts/model-basics

安装mysql&sequelize
```cmd
npm install --save mysql mysql2
npm install --save sequelize

```
安装sequelize之后,在config目录下创建db.js,进行数据库连接设置
```js
const Sequelize = require('sequelize');
const db = require('./index').db

// 初始化数据库
const sequelize = new Sequelize(db.database, db.username, db.password, {
    host: db.host,
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    }
})

//测试数据库链接
sequelize.authenticate().then(function() {
    console.log("数据库连接成功");
}).catch(function(err) {
    //数据库连接失败时打印输出
    console.error(err);
    throw err;
});             

module.exports = { sequelize, Sequelize }
```

## 7. 添加controllers目录
有了模型层对操作数据库的支持,就可以进行业务操作了,也就是控制器目录(在这个层可以放心调用models层方法进行curd)
```js
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
```

## 8. 路由配置
```js
// app.js 中添加
// routes
const admin = require('./routes/admin')
app.use(admin.routes(), admin.allowedMethods())
```
到此为止,一个完整的请求(接口)就处理完成了
比如请求 http://localhost:3000/admin/getAllAdmins

koa经历的简单过程:
1. 浏览器发出请求 -> 中间件 ->路由中间件 -> 中间件 -> 中间件若干回调 -> 浏览器收到响应
2. 路由: 
- `router.get/post` -> `controllers.func` -> `models.func`-> mysql
-      请求行为      ->       业务逻辑     ->   模型支持   ->  入库

## 9. 配置自定义的中间件处理日志和response消息
可以参考github代码

## 10. 附上一个很好理解的中间件原理的简析
```js
// 根目录下test.js
// koa2 中间件原理简析
// 中间件的仓库
const arr = [
    async (next) => {
        console.log(1);
        await next();
        console.log(2);
    },
    async (next) => {
        console.log(3);
        await new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(
                    console.log(4)
                );
            }, 3000);
        }); // 异步操作 await 会等待后面的promise resolve 后再向下执行
        await next();
        console.log(5);
    },
    async (next) => {
        console.log(6);
    },
    async (next) => {
        // 不会执行 因为上一个函数中没有执行next
        console.log(7);
        await next();
        console.log(8);
    },
    async (next) => {
        // 不会执行 因为前面的函数中没有执行next
        console.log(9);
    }
];

function fun(arr) {
    function dispose(index) {
        const currentFun = arr[index];
        const next = dispose.bind(null, index + 1);
        return currentFun(next); // 尾递归
    }

    dispose(0);
}

fun(arr); // 先打印 1 3 一秒后打印4 6 5 2
```

## 参考链接
- https://www.sequelize.com.cn/
- https://www.cnblogs.com/zjknb/p/12149420.html

[base64str1]:data:image/png;base64,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