var fs = require('fs');
var util = require('util');
var path = './assets';
//var outPath="./out.json"
var outPath = "./assets";

//var array={};
function explorer(path) {

	fs.readdir(path, function(err, files) {
		//err 为错误 , files 文件名列表包含文件夹与文件
		if (err) {
			console.log('error:\n' + err);
			return;
		}
		var length = files.length;
		//var i=0;
		files.forEach(function(file) {

			fs.stat(path + '/' + file, function(err, stat) {
				if (err) {
					console.log(err);
					return;
				}
				if (stat.isDirectory()) { // 如果是文件夹遍历			
					explorer(path + '/' + file);
				} else { // 读出所有的文件
					//i++;
					if (file.lastIndexOf('.json') < 0 || file.lastIndexOf('.meta') >= 0) {
						console.log('过滤掉:' + path + '/' + file);
						return;
					}
					if (path.indexOf('.svn') < 0) { // 过滤掉svn文件夹
						//console.log('文件名:' + path + '/' + file);
						var key = String(file.substr(0, file.length - 5));
						var jsonObj = JSON.parse(fs.readFileSync(path + '/' + file, "utf-8"));
						//array[key]=jsonObj;
						writeFile(path + '/' + file, JSON.stringify(jsonObj, null, 0));
					}
				}
			});

		});
	});


}

function writeFile(file, str) {
	//var arr = iconv.encode(str, 'gbk');  
	fs.writeFile(file, str, function(err) {
		if (err)
			console.log('fail ' + err);
		else
			console.log('写入文件 ' + file);
	});
}
explorer(path);