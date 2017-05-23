#!/usr/bin/env node

'use strict';

var async = require('neo-async');
var _ = require('lodash');
var request = require('request');
var headers = {
  'Content-Type':'application/json'
};

(function() {


	var method = process.argv[2] || '';
	if (method && isNumber(method)) {
		Calc(method);
	} else if ('LIST' === method.toUpperCase()) {
		List();
	} else {
		Rate();
	}
	
})();

function isNumber(x){ 
    if( typeof(x) != 'number' && typeof(x) != 'string' )
        return false;
    else 
        return (x == parseFloat(x) && isFinite(x));
}

function Calc(target) {

	GetBitPrice(function(err, bit) {
		if (err) {
			console.log(err);
			return
		}

		console.log("---------------");
		console.log("" + (target * bit) + "円");
		console.log("BTC/JPY: " + bit + "円");
		console.log("---------------");
	});
}

function List() {

	GetBitPrice(function(err, bit) {
		if (err) {
			console.log(err);
			return
		}
		GetBitRate(false, function(err, body) {
			if (err) {
				console.log(err);
				return;
			}

			var coins = [];
			_.forEach(body, function(value, key) {
				if (_.includes(key, "BTC_")) {
					value['name'] = _.trim(key,'BTC_');
					coins.push(value);
				}
			});
			coins = _.sortBy(coins, function(c) { return c.lowestAsk });

			console.log("---------------");
			_.forEach(coins, function(c) {
				console.log(c.name + ": " + (c.lowestAsk * bit) + " 円");
			});
			console.log("---------------");
		});
	});
}

function Rate() {
	var targets = [];
	_.forEach(process.argv, function(value, key) {
		if (key >= 2) {
			targets.push(value.toUpperCase());
		}
	});

	GetBitPrice(function(err, bit) {
		if (err) {
			console.log(err);
			return
		}
		GetBitRate(targets.length === 0, function(err, body) {
			if (err) {
				console.log(err);
				return;
			}

			var rates = [];
			_.forEach(targets, function(target) {
				var b = body && body['BTC_' + target] || {};
				var lowest = b['lowestAsk'] || null;
				if (lowest) {
					rates.push({
						target: target,
						rate: lowest
					});
				}
			});

			console.log("---------------");
			console.log("BTC/JPY: " + bit + "円");
			_.forEach(rates || [], function(e) {
				console.log("---------------");
				console.log("BTC/" + e.target + ": " + e.rate);
				console.log(e.target + "/JPY: " + (e.rate * bit) + " 円");
			});
			console.log("---------------");
		});
	});
}


function GetBitPrice(callback) {
	var opts = {
		url: 'https://coincheck.com/api/rate/btc_jpy',
		method: 'GET',
 		headers: headers,
	  	json: true
	};
	request(opts, function(err, res, body) {
		if (err) {
			return callback(err);
		}
		var p = body && body.rate || '0';
		callback(null, parseInt(p, 10));
	});
}

function GetBitRate(skip, callback) {
	if (skip) {
		return callback();
	}
	var opts = {
		url: 'https://poloniex.com/public?command=returnTicker',
		method: 'GET',
 		headers: headers,
	  	json: true
	};
	request(opts, function(err, res, body) {
		if (err) {
			return callback(err);
		}
		callback(null, body);
	});
};