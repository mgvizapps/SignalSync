let path = require("path");
let MiniCssExtract = require("mini-css-extract-plugin");
let modulesPath = path.join(__dirname, "node_modules");
let packagesPath = path.join(__dirname, "packages");

//Common loaders configuration
let loaders = {
    // Extract CSS styles to a separaate .css file
    "cssExtract": {
        "loader": MiniCssExtract.loader,
        "options": {
            "publicPath": "./"
        }
    },
    // sass loader
    "sass": {
        "loader": "sass-loader",
        "options": {
            "sassOptions": {
                "includePaths": [modulesPath]
            },
            "implementation": require("sass")
        }
    },
    // Common CSS loader for parsing .css and compiled .scss files
    "css": {
        "loader": "css-loader"
    }
};

//Export the webpack configuration
module.exports = function (env) {
    //Export webpack configuration
    return {
        "entry": {
            "mgvizapps": path.join(packagesPath, "app", "src", "index.js"),
            "mgvizapps-embed": path.join(packagesPath, "app", "src", "embed.js")
        },
        "mode": "development",
        "target": "web",
        "output": {
            "library": "MGvizApps",
            "libraryTarget": "umd",
            "path": path.join(__dirname, "public"),
            "filename": "[name].js"
        },
        "resolve": {
            "modules": [packagesPath, modulesPath],
        },
        "module": {
            "rules": Object.values({
                //Parse local .scss and ignore external .scss files
                "localScss": {
                    "test": /\.scss$/,
                    "include": packagesPath,
                    "use": Object.values({
                        "cssExtractLoader": loaders.cssExtract,
                        "cssLoader": {
                            "loader": "css-loader",
                            "options": {
                                "modules": {
                                    "mode": "local",
                                    "localIdentName": "miniapps__[hash:base64:5]"
                                }
                            }
                        },
                        "sassLoader": loaders.sass
                    })
                },
                //Parse external .scss files
                "externalScss": {
                    "test": /\.scss$/,
                    "exclude": packagesPath,
                    "use": Object.values({
                        "cssExtractLoader": loaders.cssExtract,
                        "cssLoader": loaders.css,
                        "scssLoader": loaders.sass
                    })
                },
                //Parse css files
                "cssLoader": {
                    "test": /\.css$/,
                    "use": Object.values({
                        "cssExtractLoader": loaders.cssExtract,
                        "cssLoader": loaders.css
                    })
                },
                "imageLoader": {
                    "test": /\.(png|jpg|gif|svg)$/,
                    "use": {
                        "loader": "file-loader",
                        "options": {
                            "name": "[hash].[ext]",
                            "outputPath": "img/"
                        }
                    }
                },
                "fontLoader": {
                    "test": /\.(ttf|woff|woff2)$/,
                    "use": {
                        "loader": "file-loader",
                        "options": {
                            "name": "[hash].[ext]",
                            "outputPath": "fonts/"
                        }
                    }
                },
                "jsxLoader": {
                    "test": /\.js$/,
                    "include": [packagesPath],
                    "exclude": /(node_modules)/,
                    "loader": "babel-loader"
                }
            })
        },
        "plugins": [
            new MiniCssExtract({
                "filename": "[name].css"
            })
        ]
    };
};

