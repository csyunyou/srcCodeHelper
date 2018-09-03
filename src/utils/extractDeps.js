var fs = require('fs');
var path = require('path');
const EventEmitter = require('events');
let _ = require("underscore")

function extractDep(file, content, deps, rootDir) {

  // console.log(data)
  let re = /\s*import\s*{\s*(\S*)\s*}\s*from\s*'([^']*)'/g,
    searchRes, importModule, importPath
  while ((searchRes = re.exec(content)) !== null) {
    importModule = searchRes[1], importPath = searchRes[2]
    if (!importPath.startsWith('.'))
      deps.push({ src: file, ref: path.resolve(rootDir, importPath) })
    else deps.push({ src: file, ref: path.resolve(path.dirname(file), importPath) })
    // console.log(importPath, file, path.resolve(path.dirname(file), importPath))
    /*            importModule=searchRes[1],importPath=searchRes[2]
                console.log(importPath,file,path.resolve(path.dirname(file),importPath))*/
  }

}
/** 
 * 文件遍历方法 
 * @param filePath 需要遍历的文件路径 
 */
function fileDisplay(filePath, deps, rootDir) {
  //根据文件路径读取文件，返回文件列表  
  let files = fs.readdirSync(filePath)


  //遍历读取到的文件列表  
  files.forEach(function(filename) {
    //获取当前文件的绝对路径  
    var filedir = path.join(filePath, filename),
      stats = fs.statSync(filedir)
    //根据文件路径获取文件信息，返回一个fs.Stats对象

    var isFile = stats.isFile(); //是文件  
    var isDir = stats.isDirectory(); //是文件夹  
    if (isFile) {
      let content = fs.readFileSync(filedir) 
      extractDep(filedir, content, deps, rootDir)
    }
    if (isDir) {
      fileDisplay(filedir, deps, rootDir); //递归，如果是文件夹，就继续遍历该文件夹下面的文件  
    }

  })
}

function extractModuleDep(deps) {
  let moduleDeps = [],
    re = /E:\\srcCodeHelper\\node_modules\\vue\\src\\[^\\]*/,
    srcGroup, refGroup
  srcGroup = _.groupBy(deps, function(d) {
    let src = d.src
    return src.match(re)[0]
  });
  // console.log(srcGroup)
  Object.keys(srcGroup).forEach(function(srcKey) {
    refGroup = _.groupBy(srcGroup[srcKey], function(d) {
      let ref = d.ref
      return ref.match(re)[0]
    })
    Object.keys(refGroup).forEach(function(refKey) {
      moduleDeps.push({ srcModule: srcKey, refModule: refKey, deps: refGroup[refKey].length})

    })
  })
  return moduleDeps
}

function main() {
  //解析需要遍历的文件夹，我这以E盘根目录为例  
  var rootDir = 'E:\\srcCodeHelper\\node_modules\\vue\\src',
    filePath = path.resolve(rootDir)
  // var filePath=path.resolve('E:\\srcCodeHelper\\src\\utils') 
  let deps = []
  fileDisplay(filePath, deps, rootDir);
  let moduleDeps = extractModuleDep(deps)
  console.log(moduleDeps)
  let tmp=moduleDeps[0].deps
/*  console.log(tmp.length)
  console.log(tmp)*/
}
main()
