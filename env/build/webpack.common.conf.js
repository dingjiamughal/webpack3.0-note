const productionConfig = require("./webpack.prod.conf")
const developmentConfig = require("./webpack.dev.conf")
const path = require("path")
const merge = require("webpack-merge")
const ExtractTextWebpackPlugin = require("extract-text-webpack-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin")

const generateConfig= env => {

  // 定义module中的loader
  const scriptLoader = ["babel-loader"]
        .contact(env === "production"
        ? []
        : [{
            loader:"eslint-loader",
            options:{
              formatter:require("eslint-friendly-formatter")
            }
          }]
        );
  const extractLess = new ExtractTextWebpackPlugin({
    filename:"css/[name]-bundle-[hash:5].css"
  })

const cssLoaders = [
  {
    loader: "css-loader",
    options: {
      minimize: true,
      modules: true,
      localIdentName: '[path][name]_[local]_[hash:base64:5]'
    }
  }, {
    loader: "postcss-loader",
    options: {
      ident: "postcss",
      sourceMap: env === "development",
      plugins: [
        require("autoprefixer")(),
        // :root {--mainColor:#fff;} div {color:var(--mainColor)}
        require("postcss-cssnext")()
      ].concat(env === "production"
        ? require("postcss-sprites")({
            spritePath: "dist/assets/img/sprites",
            retina: true
          })
        )
    }
  }, {
    loader: "less-loader",
    options: {
      sourceMap: env === "development"
    }
  }
]
  const styleLoader = env === "production" // 生产环境需要加载提取css文件，除去style-loader要加上
        ? extracctLess.extract({
          fallback:"style-loader",
          use:cssLoaders
        })
        :[{
          loader:"style-loader"
        }].concat(cssLoaders);

  const fileLoader = env === "development"
      ? [{
        loader:"file-loader",//生产环境：file-loader/开发环境：url-loader
        options:{
          name:"[name]-[hash:5].[ext]",
          outputPath:"assets/imgs",
        }
      }]
      : [{
        loader:"url-loader",  //  打包图片可以直接使用url-loader
        options:{
          name:"[name][hash:5].min.[ext]",//重命名图片文件[文件名].min.[后缀]
          limit:50000,//5kb
          outputPath:"assets/imgs",
        }
      }]

  return {
    entry:{
      "app":"./src/app.js",
    },
    output:{
      path:path.resolve(_dirname,"./dist"),
      publicPath:"/", //根目录配合webpack-dev-server能解决各种路径问题
      filename:"js/[name].bundle.js",
      chunkFilename:"[name].chunk.js"//动态打包文件（非入口的js文件）
    },
    resolve:{
      alias:{
        jquery$:path.resolve(__dirname,"src/libs/jquery.min.js")
      }
    },
    module:{
      rules:[{
        test:/\.js$/,
        include:[path.resolve(__dirname,"src")],
        exclude:[path.resolve(__dirname,"src/libs")],
        use: scriptLoader
      },{
        test:/\.less$/,
        use:styleLoader
      },{
        test:/\.(jpg|jpeg|png|gif)$/,
        use: fileLoader.concat(
          env === "production"
          ?  {
                loader:"img-loader",
                options:{
                  pngquant:{  //调整图片精度
                    quality:80
                  }
                }
              }
          : []
        )
      },{
        test:/\.(eot|woff|woff2|ttf|svg)$/,
        use:fileLoader
      }]
    },
    plugins:[
      extractLess,
      new HtmlWebpackPlugin({
        filename:"index.html",
        template:"./index.html",
        inject:false, //剔除生产版本引人的css和js
        minify:{
          collapseWhitespace:true//html不留间隙
        }
      }),
      new webpack.providePlugin({
        $:"jquery"
      })
    ]
  }

}

// 区别生产环境、开发环境
module.exports = env =>{
  let config = env ==="production"?productionConfig:developmentConfig

  return merge(generateConfig(env),config);
}