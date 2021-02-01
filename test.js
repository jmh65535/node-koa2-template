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