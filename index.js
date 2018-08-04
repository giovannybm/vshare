const decrypt = require('./decrypt')
const fs = require('fs')
const writeFile = require('write')
const nodePath = require('path')
const RecursiveIterator = require('recursive-iterator')

const vrolFile = fs.readFileSync('vrol.nar')
const vrolIndex = JSON.parse(fs.readFileSync('fileIndex.json','utf8'))
const fileBundle = vrolFile.slice(73111,vrolFile.length)

const headerEnc= '7caa5cf662ad45ccaa92d5c113b6e4a4'
// const input = fs.readFileSync('bundled.enc').toString();
// console.log(decrypt.decipher(input));

for(let {node, path} of new RecursiveIterator(vrolIndex)) {

  path.forEach(function(item,index){
    if (item=='files'){
      path.splice(index,1)
    }
  })

  if (node.hasOwnProperty('size')&node.hasOwnProperty('offset')){
    var tempBuffer=fileBundle.slice(Number(node.offset)+1,(Number(node.offset) + node.size)+1);
    if  (tempBuffer.slice(0,32)==headerEnc){
      var stringBuffer=tempBuffer.slice(32,tempBuffer.length)
      tempBuffer=decrypt.decipher(stringBuffer.toString())
    }
    writeFile(nodePath.join('lin-unpack',path.join('/')), tempBuffer, function(err) {
      if (err) console.log(err);
    });
  }

}

//workstation.js { size: 7864, offset: '11055027' }
// const minibuffer=fileBundle.slice(11055027+33,(7864+11055027+1)).toString();
//
// console.log(decrypt.decipher(minibuffer))

//
// function printString(string){
//   setTimeout(
//     () => {
//       console.log(string)
//     },
//     Math.floor(Math.random() * 100) + 1
//   )
// }
//
// function printAll(){
//   printString("A")
//   printString("B")
//   printString("C")
// }
//
// printAll()


// function printString(string, callback){
//   setTimeout(
//     () => {
//       console.log(string)
//       callback()
//     },
//     Math.floor(Math.random() * 100) + 1
//   )
// }
//
// function printAll(){
//   printString("A", () => {
//     printString("B", () => {
//       printString("C", () => {})
//     })
//   })
// }
//
// printAll()


// function printString(string){
//   return new Promise((resolve, reject) => {
//     setTimeout(
//       () => {
//        console.log(string)
//        resolve()
//       },
//      Math.floor(Math.random() * 100) + 1
//     )
//   })
// }
//
// function printAll(){
//   printString("A")
//   .then(() => {
//     return printString("B")
//   })
//   .then(() => {
//     return printString("C")
//   })
// }
//
// printAll()

// async function printAll(){
//   await printString("A")
//   await printString("B")
//   await printString("C")
// }
//
// printAll()
