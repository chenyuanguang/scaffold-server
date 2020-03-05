const path = require("path")

module.exports = {
    resolve(paths) {
        return typeof (paths) == "string"?path.normalize(path.join(process.cwd(),process.projectName,paths)):
        path.normalize(path.join(process.cwd(),process.projectName))
    
    }
}