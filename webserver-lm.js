var express = require('express'), Tail = require('tail').Tail, fs = require('fs'), http = require('http');
var app = express();
var rfact = new Array(10);
var linkact = new Array(10);
var linkptr = 0;
var rfptr = 0;
var currentNet = {};
var currentRF = {};
var stats = {};
var dupes = 0;
var statseconds = 10 * 1000;  // Set number of seconds between updating CPU stats times 1000;

// Modify paths, if different -- these should work for Compass Linux
var LinkLOG = '/var/log/opendv/Links.log';
var ircGW = '/etc/opendv/ircddbgateway';
var headers = '/var/log/opendv/Headers.log';

app.use(express.static(__dirname + '/public'));
app.set('port', '80');
app.set('host', ''); // Set to '::' to include IPv6 or set to specific address if not wanted on all interfaces

var remove = [ 'ircddbUsername', 'ircddbPassword', 'remotePassword',
		'remotePort' ];
var config = {};
var links = [];
fs.readFileSync(ircGW).toString().split('\n').forEach(
		function(line) {
			var kv = line.split('=', 2);
			config[kv[0]] = kv[1];
		});

remove.forEach(function(token) {
	config[token] = null;
	delete config[token];
});

var server = http.createServer(app).listen(app.get('port'), app.get('host'), function() {
	process.setgid('opendv');
	process.setuid('opendv');
	console.log('Express server listening on port ' + app.get('port'));
});

var io = require('socket.io')(server);

var rptlog = new Tail(headers);

function trimBetween(str, before, after) {
	var left = str.indexOf(before) + before.length;
	var right = str.indexOf(after);
	var target = str.substring(left, right).trim();
	return target;
}

function orderDS(a,b) {
	var ax = Date.parse(a.datestamp);
	var bx = Date.parse(b.datestamp);
	// console.log(ax + ' - ' + bx);
	var res = ax - bx;
	// console.log(a.datestamp + " - " + b.datestamp + " is " + res);
	return res;
}

function addNet(rec) {
	var c = JSON.stringify(currentNet);
	var r = JSON.stringify(rec);
	if (c === r) {
		dupes++;
		// console.log("Duplicate\n");
	} else {
		linkptr %= 10;
		linkact[linkptr] = rec;
		linkptr++;
		currentNet = rec;
	}
}

function addRF(rec) {
	var c = JSON.stringify(currentRF);
	var r = JSON.stringify(rec);
	if (c === r) {
		dupes++;
		// console.log("Duplicate\n");
	} else {
		rfptr %= 10;
		rfact[rfptr] = rec;
		rfptr++;
		currentRF = rec;
	}
}

function parseLinks(line) {
	var rest = line.substr(21);
	var rec = {};
	rec.datestamp = line.substr(0, 19);
	rec.date = line.substr(0, 10);
	rec.time = line.substr(11, 8);
	rec.source = rest.substring(0, rest.indexOf('-') - 1).trim();
	rec.direction = rest.substr(rest.lastIndexOf(':') + 1).trim();

	if (rest.indexOf('User') > 0) {
		rec.user = trimBetween(rest, "User:", "Dir:");
		rec.type = trimBetween(rest, "Type:", "User:");
	} else {
		rec.type = trimBetween(rest, "Type:", "Rptr:");
		rec.repeater = trimBetween(rest, "Rptr:", "Refl:");
		rec.reflector = trimBetween(rest, "Refl:", "Dir:");
	}
	return rec;
}

fs.readFileSync(LinkLOG).toString().split('\n').forEach(
		function(line) {
			if (line.trim().length > 0) {
				var linkline = parseLinks(line);
				links.push(linkline);
			}
		});

function parseLogLine(line) {
	var rest = line.substr(21);
	var rec = {};
	rec.datestamp = line.substr(0, 19);
	rec.date = line.substr(0, 10);
	rec.time = line.substr(11, 8);
	rec.source = rest.match(/\w+/)[0];
	rec.mycall = trimBetween(rest, "My:", "/");
	rec.comment1 = trimBetween(rest, "/", "Your:");
	rec.urcall = trimBetween(rest, "Your:", "Rpt1:");
	rec.rpt1 = trimBetween(rest, "Rpt1:", "Rpt2:");
	rec.rpt2 = trimBetween(rest, "Rpt2:", "Flags:");
	rec.flags = trimBetween(rest, "Flags:", "(");
	rec.remote = trimBetween(rest, "(", ")");
	var rs = rec.remote.split(":");
	rec.ipaddr = rs[0];
	rec.port = rs[1];
	return rec;
}

var SecondsTohhmmss = function(totalSeconds) {
        var days    = Math.floor(totalSeconds / 86400);
        var used    = days * 86400;
        var hours   = Math.floor((totalSeconds - used) / 3600);
        used        += hours * 3600;
        var minutes = Math.floor((totalSeconds - used) / 60);
        used        += minutes * 60;
        var seconds = totalSeconds - used;

        seconds = Math.floor(seconds);

        var result = days;
        result += " " + (hours < 10 ? "0" + hours : hours);
        result += ":" + (minutes < 10 ? "0" + minutes : minutes);
        result += ":" + (seconds  < 10 ? "0" + seconds : seconds);
        return result;
}


io.on('connection', function(socket) {

	setInterval(function() {
	        fs.readFileSync("/proc/uptime").toString().split('\n')
	        .forEach(function(line) {
	                if (line.trim().length > 0) {
	                        var timex = line.split(" ");
				stats['uptime'] = SecondsTohhmmss(timex[0]);
	                }
	        });
	        fs.readFileSync("/proc/loadavg").toString().split('\n')
	        .forEach(function(line) {
	                if (line.trim().length > 0) {
				stats['loadavg'] = line;
	                }
	        });
	        // Call lm_sensors to get temp data
	        var lm_sensors = require('sensors.js');
	        
	        lm_sensors.sensors(function (data, error) {
	        	if (error) throw error;
	        	//console.log(data); 
				
				//core temperature is embedded object, appears standard for all motherboards
				var temps = data['coretemp-isa-0000']['ISA adapter']['Core 0']['value'];
																			
				// temps is already in centigrade
				//var centigrade = temps / 1000;
	        	var centigrade = temps;
	        	var fahrenheit = (centigrade * 1.8) + 32;
	            centigrade = Math.round(centigrade * 100) / 100;
	            fahrenheit = Math.round(fahrenheit * 100) / 100;
				stats['cputemp'] = centigrade + "C " + fahrenheit + "F";
			});

		socket.emit('stats', stats);

	},statseconds);

	socket.emit('config', config);
	socket.emit('links', links);


	rfact.sort(orderDS).forEach(function(act) {
		if (act !== null) {
			socket.emit('header', act);
		}
	});
	linkact.sort(orderDS).forEach(function(act) {
		if (act !== null) {
			socket.emit('header', act);
		}
	});
	rptlog.on('line', function(line) {
		var lineobj = parseLogLine(line);
		if (lineobj.source === 'Repeater') {
			addRF(lineobj);
		} else {
			addNet(lineobj);
		}
		socket.emit('header', lineobj);
	});
	fs.watch(LinkLOG, function(event, filename) {
		if (event === 'change') {
			links = [];
			fs.readFileSync(LinkLOG).toString().split('\n')
					.forEach(function(line) {
						if (line.trim().length > 0) {
							var linkline = parseLinks(line);
							links.push(linkline);
						}
					});
			socket.emit('links', links);
		}
	});
});
