const webpack = require('webpack')
const path = require("path")
module.exports = {
  /* 部署生产环境和开发环境下的URL：可对当前环境进行区分，baseUrl 从 Vue CLI 3.3 起已弃用，要使用publicPath */
  /* baseUrl: process.env.NODE_ENV === 'production' ? './' : '/' */
  publicPath: process.env.NODE_ENV === 'production' ? './' : './',
  /* 输出文件目录：在npm run build时，生成文件的目录名称 */
  outputDir: process.env.VUE_APP_DIR_NAME ? 'dist_' + process.env.VUE_APP_DIR_NAME : 'dist',
  /* 放置生成的静态资源 (js、css、img、fonts) 的 (相对于 outputDir 的) 目录 */
  assetsDir: "assets",
  /* 是否在构建生产包时生成 sourceMap 文件，false将提高构建速度 */
  productionSourceMap: false,
  /* 默认情况下，生成的静态资源在它们的文件名中包含了 hash 以便更好的控制缓存，
  你可以通过将这个选项设为 false 来关闭文件名哈希。(false的时候就是让原来的文件名不改变) */
  filenameHashing: true,
  /* 代码保存时进行eslint检测 */
  lintOnSave: false,
  /* webpack-dev-server 相关配置 */
  devServer: {
    /* 自动打开浏览器 */
    open: false,
    /* 设置为0.0.0.0则所有的地址均能访问 */
    host: '0.0.0.0',
    port: 8080,
    https: false,
    hotOnly: false,
    /* 使用代理 */
    proxy: {
      '/api':{
        target:'http://61.153.48.134:8340',
        changeOrigin:true,
        secure:false,
        pathRewrite:{
          '^/api':'/api'
        }
      }
    },
    disableHostCheck: true
  },
  chainWebpack: config => {
    config.resolve.alias
        .set("@", path.join(__dirname, "src"))
        .set("@assets", path.join(__dirname, "src/assets"))
        .set("@components", path.join(__dirname, "src/components"))
        .set("@model", path.join(__dirname, "src/model"))
        .set("@views", path.join(__dirname, "src/views"))

    config.module
      .rule('swf')
      .test(/\.swf$/)
      .use('url-loader')
      .loader('url-loader')
      .tap(options => {
        return {
          limit: 10000
        }
      })
    //第三方库 采用CDN引入，以下配置 打包的时候会忽略这些第三方库，从而减小打包后的vendor.js体积
    config.set('externals', {
      // vue: 'Vue',
      // 'vue-router': 'VueRouter',
      // 'element-ui': 'ELEMENT',
      // 'vuex': 'Vuex',
      // axios: 'axios'
    })

  },
  configureWebpack: {
    plugins: [
      new webpack.ProvidePlugin({
        'window.Quill': 'quill/dist/quill.js',
        'Quill': 'quill/dist/quill.js'
      })
    ]
  }
}
