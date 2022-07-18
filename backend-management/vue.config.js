/* eslint-disable */
const { clear } = require('console')
const path=require('path')

function resolve (dir) {
    return path.join(__dirname, dir)
}
  

module.exports = {
    // chainWebpack: config => {
    //     config.module
    //     .rule('svg')
    //     .exclude.add(resolve('src/icons'))
    //     .end()
    //     config.module
    //     .rule('icons')
    //     .uses.clear()
    //     .test(/\.svg$/)
    //     .include.add(resolve('src/icons'))
    //     .end()
    //     .use('svg-sprite-loader')
    //     .loader('svg-sprite-loader')
    //     .options({
    //         symbolId: 'icon-[name]'
    //     })
    //     .end()
    //     }  
   
        publicPath: '/backend',
    
        chainWebpack: config => {
            config.plugins.delete('prefetch');
            config.optimization.minimizer('terser').tap((args) => {
                args[0].terserOptions.compress.drop_console = true
                return args
            });
            const svgRule = config.module.rule('svg');
            // 清除已有的所有loader
            // 如果你不这样做，接下来的loader会附加在该规则现有的loader之后
            svgRule.uses.clear();
            svgRule
             .test(/\.svg$/)
             .include.add(path.resolve(__dirname, './src/icons/svg'))
             .end()
             .use('svg-sprite-loader')
             .loader('svg-sprite-loader')
             .options({
             symbolId: 'icon-[name]'
             });
            const fileRule = config.module.rule('file');
            fileRule.uses.clear();
            fileRule
             .test(/\.svg$/)
             .exclude.add(path.resolve(__dirname, './src/icons/svg'))
             .end()
             .use('file-loader')
             .loader('file-loader');
            },
}
