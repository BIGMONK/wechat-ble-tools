// var pako = require('pako.min.js')
// var base64=require('base64.js')

// const formatTime = date => {
//   var date = new Date(date)
//   var year = date.getFullYear()
//   const month = date.getMonth() + 1
//   const day = date.getDate()
//   const hour = date.getHours()
//   const minute = date.getMinutes()
//   const second = date.getSeconds()

//   return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
// }

/**
 * 时间戳转化为年 月 日 时 分 秒
 * number: 传入时间戳
 * format：返回格式，支持自定义，但参数必须与formateArr里保持一致
*/
function formatTime(number, format) {

  var formateArr = ['Y', 'M', 'D', 'h', 'm', 's'];
  var returnArr = [];

  var date = new Date(number);
  returnArr.push(date.getFullYear());
  returnArr.push(formatNumber(date.getMonth() + 1));
  returnArr.push(formatNumber(date.getDate()));

  returnArr.push(formatNumber(date.getHours()));
  returnArr.push(formatNumber(date.getMinutes()));
  returnArr.push(formatNumber(date.getSeconds()));

  for (var i in returnArr) {
    format = format.replace(formateArr[i], returnArr[i]);
  }
  return format;
}

// function formatTime(date) {
//   // var date = new Date(Date.parse(date));
//   var date = new Date(date);
//   var year = date.getFullYear()
//   var month = date.getMonth() + 1
//   var day = date.getDate()

//   var hour = date.getHours()
//   var minute = date.getMinutes()
//   var second = date.getSeconds()


//   return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
// }


const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function json2Form(json) {
  var str = [];
  for (var p in json) {
    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(json[p]));
  }
  return str.join("&");

}

function timeToTimeHour(timeMs) {
  if (timeMs <= 0 /*|| timeMs >= 24 * 60 * 60 * 1000*/ ) {
    return "0";
  }
  var totalSeconds = parseInt(timeMs);
  var minutes = ((totalSeconds / 60) % 60);
  var hours = (totalSeconds / 3600);
  var diff = timeMs % 1000;
  console.error("时间--", "使用时间=" + hours + ":" + minutes + ":" + diff);
  // var mFormatBuilder = new StringBuilder();
  // var mFormatter = new Formatter(mFormatBuilder, Locale.getDefault());
  // return mFormatter.format("%02d时%02d分", hours, minutes).toString();

  var value = parseInt(hours) + "时" + parseInt(minutes) + "分";
  return value;
}

/**
 * 用于判断空，Undefined String Array Object
 */
function isBlank(str) {
  if (Object.prototype.toString.call(str) === '[object Undefined]') { //空
    return true
  } else if (
    Object.prototype.toString.call(str) === '[object String]' ||
    Object.prototype.toString.call(str) === '[object Array]') { //字条串或数组
    return str.length == 0 ? true : false
  } else if (Object.prototype.toString.call(str) === '[object Object]') {
    return JSON.stringify(str) == '{}' ? true : false
  } else {
    return true
  }

}

function safe_add(x, y) {
  var lsw = (x & 0xFFFF) + (y & 0xFFFF)
  var msw = (x >> 16) + (y >> 16) + (lsw >> 16)
  return (msw << 16) | (lsw & 0xFFFF)
}

/* 
 * Bitwise rotate a 32-bit number to the left. 
 */
function rol(num, cnt) {
  return (num << cnt) | (num >>> (32 - cnt))
}

/* 
 * These functions implement the four basic operations the algorithm uses. 
 */
function cmn(q, a, b, x, s, t) {
  return safe_add(rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b)
}

function ff(a, b, c, d, x, s, t) {
  return cmn((b & c) | ((~b) & d), a, b, x, s, t)
}

function gg(a, b, c, d, x, s, t) {
  return cmn((b & d) | (c & (~d)), a, b, x, s, t)
}

function hh(a, b, c, d, x, s, t) {
  return cmn(b ^ c ^ d, a, b, x, s, t)
}

function ii(a, b, c, d, x, s, t) {
  return cmn(c ^ (b | (~d)), a, b, x, s, t)
}

/* 
 * Calculate the MD5 of an array of little-endian words, producing an array 
 * of little-endian words. 
 */
function coreMD5(x) {
  var a = 1732584193
  var b = -271733879
  var c = -1732584194
  var d = 271733878

  for (var i = 0; i < x.length; i += 16) {
    var olda = a
    var oldb = b
    var oldc = c
    var oldd = d

    a = ff(a, b, c, d, x[i + 0], 7, -680876936)
    d = ff(d, a, b, c, x[i + 1], 12, -389564586)
    c = ff(c, d, a, b, x[i + 2], 17, 606105819)
    b = ff(b, c, d, a, x[i + 3], 22, -1044525330)
    a = ff(a, b, c, d, x[i + 4], 7, -176418897)
    d = ff(d, a, b, c, x[i + 5], 12, 1200080426)
    c = ff(c, d, a, b, x[i + 6], 17, -1473231341)
    b = ff(b, c, d, a, x[i + 7], 22, -45705983)
    a = ff(a, b, c, d, x[i + 8], 7, 1770035416)
    d = ff(d, a, b, c, x[i + 9], 12, -1958414417)
    c = ff(c, d, a, b, x[i + 10], 17, -42063)
    b = ff(b, c, d, a, x[i + 11], 22, -1990404162)
    a = ff(a, b, c, d, x[i + 12], 7, 1804603682)
    d = ff(d, a, b, c, x[i + 13], 12, -40341101)
    c = ff(c, d, a, b, x[i + 14], 17, -1502002290)
    b = ff(b, c, d, a, x[i + 15], 22, 1236535329)

    a = gg(a, b, c, d, x[i + 1], 5, -165796510)
    d = gg(d, a, b, c, x[i + 6], 9, -1069501632)
    c = gg(c, d, a, b, x[i + 11], 14, 643717713)
    b = gg(b, c, d, a, x[i + 0], 20, -373897302)
    a = gg(a, b, c, d, x[i + 5], 5, -701558691)
    d = gg(d, a, b, c, x[i + 10], 9, 38016083)
    c = gg(c, d, a, b, x[i + 15], 14, -660478335)
    b = gg(b, c, d, a, x[i + 4], 20, -405537848)
    a = gg(a, b, c, d, x[i + 9], 5, 568446438)
    d = gg(d, a, b, c, x[i + 14], 9, -1019803690)
    c = gg(c, d, a, b, x[i + 3], 14, -187363961)
    b = gg(b, c, d, a, x[i + 8], 20, 1163531501)
    a = gg(a, b, c, d, x[i + 13], 5, -1444681467)
    d = gg(d, a, b, c, x[i + 2], 9, -51403784)
    c = gg(c, d, a, b, x[i + 7], 14, 1735328473)
    b = gg(b, c, d, a, x[i + 12], 20, -1926607734)

    a = hh(a, b, c, d, x[i + 5], 4, -378558)
    d = hh(d, a, b, c, x[i + 8], 11, -2022574463)
    c = hh(c, d, a, b, x[i + 11], 16, 1839030562)
    b = hh(b, c, d, a, x[i + 14], 23, -35309556)
    a = hh(a, b, c, d, x[i + 1], 4, -1530992060)
    d = hh(d, a, b, c, x[i + 4], 11, 1272893353)
    c = hh(c, d, a, b, x[i + 7], 16, -155497632)
    b = hh(b, c, d, a, x[i + 10], 23, -1094730640)
    a = hh(a, b, c, d, x[i + 13], 4, 681279174)
    d = hh(d, a, b, c, x[i + 0], 11, -358537222)
    c = hh(c, d, a, b, x[i + 3], 16, -722521979)
    b = hh(b, c, d, a, x[i + 6], 23, 76029189)
    a = hh(a, b, c, d, x[i + 9], 4, -640364487)
    d = hh(d, a, b, c, x[i + 12], 11, -421815835)
    c = hh(c, d, a, b, x[i + 15], 16, 530742520)
    b = hh(b, c, d, a, x[i + 2], 23, -995338651)

    a = ii(a, b, c, d, x[i + 0], 6, -198630844)
    d = ii(d, a, b, c, x[i + 7], 10, 1126891415)
    c = ii(c, d, a, b, x[i + 14], 15, -1416354905)
    b = ii(b, c, d, a, x[i + 5], 21, -57434055)
    a = ii(a, b, c, d, x[i + 12], 6, 1700485571)
    d = ii(d, a, b, c, x[i + 3], 10, -1894986606)
    c = ii(c, d, a, b, x[i + 10], 15, -1051523)
    b = ii(b, c, d, a, x[i + 1], 21, -2054922799)
    a = ii(a, b, c, d, x[i + 8], 6, 1873313359)
    d = ii(d, a, b, c, x[i + 15], 10, -30611744)
    c = ii(c, d, a, b, x[i + 6], 15, -1560198380)
    b = ii(b, c, d, a, x[i + 13], 21, 1309151649)
    a = ii(a, b, c, d, x[i + 4], 6, -145523070)
    d = ii(d, a, b, c, x[i + 11], 10, -1120210379)
    c = ii(c, d, a, b, x[i + 2], 15, 718787259)
    b = ii(b, c, d, a, x[i + 9], 21, -343485551)

    a = safe_add(a, olda)
    b = safe_add(b, oldb)
    c = safe_add(c, oldc)
    d = safe_add(d, oldd)
  }
  return [a, b, c, d]
}

/* 
 * Convert an array of little-endian words to a hex string. 
 */
function binl2hex(binarray) {
  var hex_tab = "0123456789abcdef"
  var str = ""
  for (var i = 0; i < binarray.length * 4; i++) {
    str += hex_tab.charAt((binarray[i >> 2] >> ((i % 4) * 8 + 4)) & 0xF) +
      hex_tab.charAt((binarray[i >> 2] >> ((i % 4) * 8)) & 0xF)
  }
  return str
}

/* 
 * Convert an array of little-endian words to a base64 encoded string. 
 */
function binl2b64(binarray) {
  var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
  var str = ""
  for (var i = 0; i < binarray.length * 32; i += 6) {
    str += tab.charAt(((binarray[i >> 5] << (i % 32)) & 0x3F) |
      ((binarray[i >> 5 + 1] >> (32 - i % 32)) & 0x3F))
  }
  return str
}

/* 
 * Convert an 8-bit character string to a sequence of 16-word blocks, stored 
 * as an array, and append appropriate padding for MD4/5 calculation. 
 * If any of the characters are >255, the high byte is silently ignored. 
 */
function str2binl(str) {
  var nblk = ((str.length + 8) >> 6) + 1 // number of 16-word blocks 
  var blks = new Array(nblk * 16)
  for (var i = 0; i < nblk * 16; i++) blks[i] = 0
  for (var i = 0; i < str.length; i++)
    blks[i >> 2] |= (str.charCodeAt(i) & 0xFF) << ((i % 4) * 8)
  blks[i >> 2] |= 0x80 << ((i % 4) * 8)
  blks[nblk * 16 - 2] = str.length * 8
  return blks
}

/* 
 * Convert a wide-character string to a sequence of 16-word blocks, stored as 
 * an array, and append appropriate padding for MD4/5 calculation. 
 */
function strw2binl(str) {
  var nblk = ((str.length + 4) >> 5) + 1 // number of 16-word blocks 
  var blks = new Array(nblk * 16)
  for (var i = 0; i < nblk * 16; i++) blks[i] = 0
  for (var i = 0; i < str.length; i++)
    blks[i >> 1] |= str.charCodeAt(i) << ((i % 2) * 16)
  blks[i >> 1] |= 0x80 << ((i % 2) * 16)
  blks[nblk * 16 - 2] = str.length * 16
  return blks
}

/* 
 * External interface 
 */
function hexMD5(str) {
  return binl2hex(coreMD5(str2binl(str)))
}

function hexMD5w(str) {
  return binl2hex(coreMD5(strw2binl(str)))
}

function b64MD5(str) {
  return binl2b64(coreMD5(str2binl(str)))
}

function b64MD5w(str) {
  return binl2b64(coreMD5(strw2binl(str)))
}
/* Backward compatibility */
function calcMD5(str) {
  return binl2hex(coreMD5(str2binl(str)))
}


const reg = new RegExp('^(1[3456789])\\d{9}$');

function isPhone(num) {
  return reg.test(num);
}


const regPsw = new RegExp('^(?![^a-zA-Z]+$)(?![^0-9]+$)[a-zA-Z0-9]{6,18}$'); //至少包含一个数字和一个字母且仅包含数字和字母
// const regPsw = new RegExp('^(?![^a-zA-Z]+$)(?![^0-9]+$).{6,18}$');//至少包含一个数字和一个字母(除此之外还可以有其他的)
// const regPsw = new RegExp('^(?![^a-zA-Z]+$)(?![^0-9]+$)(?![^_]+$).{6,18}$');//至少包含一个数字、一个字母和一个下划线(除此之外还可以有其他的)
// const regPsw = new RegExp('^(?![0-9]+$)(?![a-zA-Z]+$).{6,18}$');//不仅包含数字或字母(也就是说除了数字或字母之外还要有其他的字符)

function checkPswOk(psw) {
  return regPsw.test(psw);
}

function showToast(title, icon, duration) {
  wx.showToast({
    title: title,
    icon: icon,
    duration: duration,
    mask: true,
    success: function(res) {},
    fail: function(res) {},
    complete: function(res) {},
  })
}

function showToastSuccess(title) {
  this.showToast(title, "success", 2000)
}

function showToastNone(title) {
  this.showToast(title, "none", 2000)
}

function showToastLoading(title) {
  this.showToast(title, "loading", 2000)
}


function log(msg) {
  if (true) {
    console.log(msg)
  }
}

/* 秒级倒计时 */
function countdown(that) { 
  var second = that.data.second 
  if (second == 0) {  
    that.setData({   
      second: "Time out!"
    });  
    clearTimeout(timer);  
    return; 
  } 
  var timer = setTimeout(function() {  
    that.setData({   
      second: second - 1  
    });  
    countdown(that); 
  } , 1000)
}
/**
 * 获取一维数组
 */
function getArray(min, max) {
  var arr = [];
  for (var i = min; i <= max; i++) {
    arr.push(i)
  }
  return arr;
}
/**
 * 获取二维数组
 */
function getMArray(indexs) {
  var mArr = [];
  for (var i = 0; i < indexs.length; i++) {
    var arr = [];
    for (var j = indexs[i][0]; j <= indexs[i][1]; j++) {
      arr.push(j);
    }
    mArr.push(arr);
  }
  return mArr;
}

function showLoading(title) {
  wx.showLoading({
    title: title,
    mask: true,
  })
}

function hideLoading() {
  wx.hideLoading()
}
// /**
//  * 字符串gzip解压
//  */
// function unzip(str){
//   // this.log("unzip")
//   var strData = base64.atob(str);
//   // this.log("unzip base64")  
//   // Convert binary string to character-number array
//   var charData = strData.split('').map(function (x) { return x.charCodeAt(0); });
//   // Turn number array into byte-array
//   var binData = new Uint8Array(charData);
//   // // unzip
//   var data = pako.inflate(binData);
//   // this.log("unzip base64 pako")  
//   // Convert gunzipped byteArray back to ascii string:

//   // strData = String.fromCharCode.apply(null, new Uint16Array(data));

//   strData = '';
//   var chunk = 8 * 1024;
//   var i;
//   for (i = 0; i < data.length / chunk; i++) {
//     strData += String.fromCharCode.apply(null, data.slice(i * chunk, (i + 1) * chunk));
//   }
//   strData += String.fromCharCode.apply(null, data.slice(i * chunk));


//   // this.log("unzip base64 pako String")  
//   return strData;
// }
// /**
//  * 字符串gzip压缩
//  */
// function zip(str){
//   var binaryString = pako.gzip(str, { to: 'string' });
//   return btoa(binaryString);
// }


module.exports = {
  // formatTime: formatTime,
  // formatTime: formatTime,
  // formatTimeTwo: formatTimeTwo  
  timeToTimeHour: timeToTimeHour,
  isBlank: isBlank,
  json2Form: json2Form,
  hexMD5: hexMD5,
  isPhone: isPhone,
  formatTime: formatTime,
  showToast: showToast,
  checkPswOk: checkPswOk,
  showToastLoading: showToastLoading,
  showToastSuccess: showToastSuccess,
  showToastNone: showToastNone,
  log: log,
  countdown: countdown,
  getArray: getArray,
  getMArray: getMArray,
  showLoading: showLoading,
  hideLoading: hideLoading,
  // unzip:unzip,
  // zip:zip
}