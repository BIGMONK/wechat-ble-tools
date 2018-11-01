// //通用参数
var CLIENT_CHARACTERISTIC_CONFIG = "00002902-0000-1000-8000-00805f9b34fb"

//单车  连接就能收到数据  发送数据格式：AA 02 06 00 00 00 00 00 55  
//服务uuid
var service_uuid = "0003cdd0-0000-1000-8000-00805f9b0131"
//notify uuid
var notify_uuid = "0003cdd1-0000-1000-8000-00805f9b0131"
//write uuid
var write_uuid = "0003cdd2-0000-1000-8000-00805f9b0131"


let buffer = new ArrayBuffer(9)
let dataView = new DataView(buffer)
dataView.setUint8(0, 0xaa)
dataView.setUint8(1, 0x02)
dataView.setUint8(3, 0x00)
dataView.setUint8(4, 0x00)
dataView.setUint8(5, 0x00)
dataView.setUint8(6, 0x00)
dataView.setUint8(7, 0x00)
dataView.setUint8(8, 0x55)

/**
 * 获取蓝牙阻力数据包
 */
function _makeBleData(r) {
  if (r == undefined)
    r = Math.random() * 100 | 0
  dataView.setUint8(2, r)
  return [buffer,r,dataView];
}

module.exports = {
  service_uuid: service_uuid,
  notify_uuid: notify_uuid,
  write_uuid: write_uuid,
  makeBleData: _makeBleData
}