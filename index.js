/**
 * Created by qqwan on 2018/6/20.
 */
var express = require('express')
var multer = require('multer')
const bodyParser = require('body-parser')
const fs = require('fs');

var createFolder = function(folder){
    try{
        fs.accessSync(folder);
    }catch(e){
        fs.mkdirSync(folder);
    }
};


var app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

var maxFileSize = 1024 * 1024
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        var dic = './files/temp/'
        createFolder(dic)
        cb(null, dic)
    },
    filename: function (req, file, cb) {
        // cb(null, file.originalname)
        cb(null, 'logo')
    }
})

var upload = multer({
    storage: storage,
    // limits: {fileSize: maxFileSize},
    fileFilter: function (req, file, cb) {
        cb(null, true)
    }
// }).single("recfile")
// }).fields([{ name: 'recfile', maxCount: 1 }, { name: 'recfile2', maxCount: 8 }])
}).array('recfile', 12)
app.get('/', function (req, res) {
    res.sendfile('index.html')
})
app.post('/uploadfile', upload, function (req, res) {
    // upload拿不到非file类型的数据，如果不在post上传递upload此处的req也拿不到req.body
    console.log('-----' + req.body.enterpriseId)
    var dic = './files/'
    if (req.body.enterpriseId !== undefined) {
        dic = './files/' + req.body.enterpriseId
    }
    createFolder(dic)
    for (const file of req.files) {
        console.log('-----' + file.path)
        if (file.size > maxFileSize) {
            res.send({ result: 'fail', error: { code: 1001, message: 'File is too big' } })
            return
        }
        // 默认情况下，destination.txt 将创建或覆盖
        fs.copyFileSync(file.path, dic + '/logo');
        fs.unlink(file.path)
    }
    upload(req, res, function (err) {
        if (err) {
            console.log('upload file error' + err)
            if (err.code === 'LIMIT_FILE_SIZE') {
                res.send({ result: 'fail', error: { code: 1001, message: 'File is too big' } })
                return
            }
            return
        }
        res.json({retCode: 0, msg: 'success'})
    })
})

app.listen('8880', ()=> {
    console.log('listening 8880')
})
