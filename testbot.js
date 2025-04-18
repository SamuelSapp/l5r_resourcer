

var mysql = require("mysql");
const mysql_config = {
	"host":"localhost",
	"user":"ryoshun",
	"password":"rMJ$2UxSE3P@nA*&!&K8Tq2*P$Mkj%a*x98&RUZg_^!6nwyWRr%BkF$C8Pmjjbk9",
	"database":"ryoshun"
}
var proto = {
	"stringtest":'{"kata":{}, "kiho":{}}',
	"jtest": {"kata":{}, "kiho":{}}
}

var con = mysql.createConnection(mysql_config);

function parsething(input) {
	console.log(input.replace(/[\\]/g, ''));
}
var testobject = {};
con.connect(function(err) {
	if (err) throw err;
	con.query("SELECT * FROM test", function (err, result, fields) {
		if (err) throw err;
		console.log(result);
		con.query("UPDATE test SET stringtest = ? WHERE indexname = 'test'", proto["stringtest"], function (err, result2) {
			if (err) throw err;
			con.query("SELECT * FROM test", function (err, result3, fields) {
				if (err) throw err;
				console.log(result3);
				
				proto["stringtest"] = result3[0]["stringtest"];
				console.log(proto["stringtest"]);
				parsething(proto["stringtest"]);
			});
		});
	});
	
});


console.log(proto);
console.log(JSON.stringify(proto["jtest"]));

