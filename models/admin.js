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
