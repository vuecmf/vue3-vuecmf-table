const AutoImport = require('unplugin-auto-import/webpack')
const Components = require('unplugin-vue-components/webpack')
const { ElementPlusResolver } = require('unplugin-vue-components/resolvers')


module.exports = {
    configureWebpack: config => {
        const plugins = [];
        plugins.push(
            AutoImport({
                resolvers: [ElementPlusResolver()],
            }),
            Components({
                resolvers: [ElementPlusResolver()],
            }),
        )

        // 合并plugins
        config.plugins = [...config.plugins, ...plugins];
    },
    // 将 examples 目录添加为新的页面
    pages: {
        index: {
            // page 的入口
            entry: 'examples/main.ts',
            // 模板来源
            template: 'public/index.html',
            // 输出文件名
            filename: 'index.html'
        }
    },
    chainWebpack(config) {
        if (process.env.NODE_ENV === 'production') {
            config.optimization.minimize(true);
            config.optimization.splitChunks({
                chunks: 'all',
                cacheGroups: {
                    vendors: { //vendor 是导入的第三方依赖包
                        name: 'chunk-vendors',
                        test: /[\\/]node_modules[\\/]/,
                        chunks: 'initial',
                        maxSize: 300000,
                        priority: 1  //优先级：数字越大优先级越高
                    },
                    elementPlus: {
                        name: 'chunk-elementPlus',
                        test: /[\\/]node_modules[\\/]_?element-plus(.*)/,
                        priority: 2
                    }
                }
            });
        }
    }
}
