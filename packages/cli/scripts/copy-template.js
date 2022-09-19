const fsExtra = require('fs-extra')
fsExtra.copySync(".gitignore", "dist/gitignore")
fsExtra.copySync(".npmignore", "dist/npmignore")
