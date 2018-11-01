// pages/subble/devicesDiscovery/index.js
const app = getApp()
var util = require('../../../../utils/util.js')
var constant = require('../../constant.js')

function inArray(arr, key, val) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i][key] === val) {
      return i;
    }
  }
  return -1;
}

// ArrayBuffer转16进度字符串示例
function ab2hex(buffer) {
  var hexArr = Array.prototype.map.call(
    new Uint8Array(buffer),
    function(bit) {
      return ('00' + bit.toString(16)).slice(-2)
    }
  )
  return hexArr.join('');
}

Page({
  data: {
    devices: [], //扫描到的设备
    connected: false,
    chs: [], //已连接的数据通道
    connectedBles: []
  },
  /**
   * 打开蓝牙适配器
   */
  openBluetoothAdapter() {
    var that = this
    wx.openBluetoothAdapter({
      success: (res) => {
        util.log('openBluetoothAdapter success:' + JSON.stringify(res))
      },
      fail: (res) => {
        util.log('openBluetoothAdapter fail:' + JSON.stringify(res))
        // util.showToastNone(res.errMsg)
        this.dealBleMsg(res)
      }
    })
    //监听适配器状态
    wx.onBluetoothAdapterStateChange(function(res) {
      // util.log('onBluetoothAdapterStateChange :' + JSON.stringify(res))
      that.setData({
        discovering: res.discovering,
        available: res.available,
      })
      that._discoveryStarted = res.discovering
    })
    // 监听低功耗蓝牙设备的特征值变化。 操作之前先监听 notifyBLECharacteristicValueChange ，保证第一时间获取数据
    wx.onBLECharacteristicValueChange((characteristic) => {
      // util.log('onBLECharacteristicValueChange :' + JSON.stringify(characteristic))
      var idx = inArray(that.data.connectedBles, "deviceId", characteristic.deviceId)
      if (idx === -1) { //设备不存在
        that.setData({
          [`connectedBles[${that.data.connectedBles.length}]`]: {
            connected: true,
            deviceId: characteristic.deviceId,
            services: {
              uuid: characteristic.serviceId,
              characteristics: [{
                uuid: characteristic.characteristicId,
                valuen: ab2hex(characteristic.value)
              }]

              // value: ab2hex(characteristic.value)
            }
          }
        })
      } else { //设备存在
        // util.log("更新" + JSON.stringify(chss))
        var sers = that.data.connectedBles[idx].services
        if (sers == undefined) { //服务集合不存在
          that.setData({
            [`connectedBles[${idx}].services`]: [{
              uuid: characteristic.serviceId,
              characteristics: [{
                uuid: characteristic.characteristicId,
                valuen: ab2hex(characteristic.value)
              }]
            }]
          })
        } else { //服务集合存在
          var idy = inArray(sers, "uuid", characteristic.serviceId)
          if (idy === -1) { //服务不存在
            that.setData({
              [`connectedBles[${idx}].services[${sers.length}]`]: {
                uuid: characteristic.serviceId,
                characteristics: [{
                  uuid: characteristic.characteristicId,
                  valuen: ab2hex(characteristic.value)
                }]
              }
            })
          } else { //服务存在
            var chas = that.data.connectedBles[idx].services[idy].characteristics
            var idz = inArray(chas, "uuid", characteristic.characteristicId)
            if (idz === -1) { //通道不存在
              that.setData({
                [`connectedBles[${idx}].services[${idy}].characteristics`]: [{
                  uuid: characteristic.characteristicId,
                  valuen: ab2hex(characteristic.value)
                }]
              })
            } else { //通道存在
              that.setData({
                [`connectedBles[${idx}].services[${idy}].characteristics[${idz}]valuen`]: ab2hex(characteristic.value)
              })
            }
          }
        }
      }
    })
    //监听设备连接状态
    wx.onBLEConnectionStateChange(function(res) {
      util.log("onBLEConnectionStateChange :" + res.deviceId + " connected=" + res.connected + "  " + JSON.stringify(that.data.connectedBles))
      var idx = inArray(that.data.connectedBles, "deviceId", res.deviceId)
      if (idx != -1) {
        that.setData({
          [`connectedBles[${idx}].connected`]: res.connected
        })
      }
      // var idx = inArray(that.data.connectedBles, "deviceId", deviceId)
      // if (idx != -1) {
      //   that.setData({
      //     [`connectedBles`]: that.data[`connectedBles`].splice(0, idx).concat(that.data[`connectedBles`].splice(idx + 1))
      //   })

      // }
    })

  },
  /**
   * 获取蓝牙适配器状态
   */
  getBluetoothAdapterState() {
    wx.getBluetoothAdapterState({
      success: (res) => {
        util.log('getBluetoothAdapterState success:' + JSON.stringify(res))
        this.setData({
          discovering: res.discovering,
          available: res.available
        })
      },
      fail: res => {
        util.log('getBluetoothAdapterState fail:' + JSON.stringify(res))
        // util.showToastNone(res.errMsg)
        this.dealBleMsg(res)
      }
    })
  },
  /**
   * 开始搜索蓝牙设备
   */
  startBluetoothDevicesDiscovery() {
    if (this._discoveryStarted) {
      util.log('startBluetoothDevicesDiscovery _discoveryStarted=' + this._discoveryStarted)
      return
    }
    this._discoveryStarted = true
    wx.startBluetoothDevicesDiscovery({
      allowDuplicatesKey: true,
      success: (res) => {
        util.log('startBluetoothDevicesDiscovery success' + JSON.stringify(res))
        this.onBluetoothDeviceFound()
      },
      fail: res => {
        util.log('startBluetoothDevicesDiscovery fail' + JSON.stringify(res))
        // util.showToastNone(res.errMsg)
        this.dealBleMsg(res)
      }
    })
  },
  /**
   * 停止搜索蓝牙设备
   */
  stopBluetoothDevicesDiscovery() {
    wx.stopBluetoothDevicesDiscovery({
      success: function(res) {
        util.log('stopBluetoothDevicesDiscovery success:' + JSON.stringify(res))
      },
      fail: function(res) {
        util.log('stopBluetoothDevicesDiscovery fail:' + JSON.stringify(res))
        // util.showToastNone(res.errMsg)
        this.dealBleMsg(res)
      }
    })
  },
  /**
   * 打开设备搜索监听
   */
  onBluetoothDeviceFound() {
    util.log('onBluetoothDeviceFound ')
    wx.onBluetoothDeviceFound((res) => {
      // util.log('onBluetoothDeviceFound '+ res)
      res.devices.forEach(device => {
        if (!device.name && !device.localName) {
          return
        }
        const foundDevices = this.data.devices
        const idx = inArray(foundDevices, 'deviceId', device.deviceId)
        const data = {}
        if (idx === -1) {
          data[`devices[${foundDevices.length}]`] = device
          util.log('onBluetoothDeviceFound ' + JSON.stringify(device))
        } else {
          data[`devices[${idx}]`] = device
        }
        this.setData(data)
      })
    })
  },
  /**
   * 连接蓝牙设备
   */
  createBLEConnection(e) {
    util.log('createBLEConnection ' + JSON.stringify(e))
    const ds = e.currentTarget.dataset
    const deviceId = ds.deviceId
    const name = ds.name
    var that = this
    wx.createBLEConnection({
      deviceId,
      success: (res) => {
        var idx = inArray(this.data.connectedBles, "deviceId", deviceId)
        if (idx === -1) {
          this.setData({
            [`connectedBles[${that.data.connectedBles.length}]`]: {
              deviceId: deviceId,
              name: name,
              connected: true
            }
          })
        } else {
          this.setData({
            [`connectedBles[${idx}].connected`]: true
          })
        }

        // this.setData({
        //   connected: true,
        //   name,
        //   deviceId,
        // })
        this.getBLEDeviceServices(deviceId)
      },
      fail: res => {
        util.log('createBLEConnection fail:' + JSON.stringify(res))
        // util.showToastNone(res.errMsg)
        this.dealBleMsg(res)
      }
    })
    this.stopBluetoothDevicesDiscovery()
  },
  /**
   * 断开/连接蓝牙
   */
  closeBLEConnection:function(res) {
    var that=this
    var deviceId=res.currentTarget.dataset.deviceid
    var connected = res.currentTarget.dataset.connected
    if(connected){
    wx.closeBLEConnection({
      deviceId: deviceId,
      success: res => {
        util.log('closeBLEConnection success:' + JSON.stringify(res))
        var idx = inArray(that.data.connectedBles, "deviceId", deviceId)
        if (idx != -1) {
          that.setData({
            // [`connectedBles`]: that.data[`connectedBles`].splice(0, idx).concat(that.data[`connectedBles`].splice(idx + 1)),
            [`connectedBles[${idx}].connected`]: false
          })
        
        }
      },
      fail: res => {
        util.log('closeBLEConnection fail:' + JSON.stringify(res))
        // util.showToastNone(res.errMsg)
        this.dealBleMsg(res)
      }
      })
    }else{
      wx.createBLEConnection({
        deviceId,
        success: (res) => {
          var idx = inArray(this.data.connectedBles, "deviceId", deviceId)
          if (idx === -1) {
            this.setData({
              [`connectedBles[${that.data.connectedBles.length}]`]: {
                deviceId: deviceId,               
                connected: true
              }
            })
          } else {
            this.setData({
              [`connectedBles[${idx}].connected`]: true
            })
          }
          this.getBLEDeviceServices(deviceId)
        },
        fail: res => {
          util.log('createBLEConnection fail:' + JSON.stringify(res))
          // util.showToastNone(res.errMsg)
          this.dealBleMsg(res)
        }
      })
      this.stopBluetoothDevicesDiscovery()
    }   
  },



  /**
   * 获取蓝牙设备所有服务(service)。
   */
  getBLEDeviceServices(deviceId) {
    var that = this
    wx.getBLEDeviceServices({
      deviceId,
      success: (res) => {
        util.log('getBLEDeviceServices success:' + JSON.stringify(res))
        for (let i = 0; i < res.services.length; i++) {
          var service = res.services[i]
          var uuid = service.uuid
          // util.log("SDSDD:" + uuid + "  " + uuid.indexOf("0000180F") + "  " + uuid.indexOf("00001800"))
          //过滤基础服务
          if (uuid.indexOf("0000180F") == 0 || uuid.indexOf("00001801") == 0 || uuid.indexOf("00001800") == 0) {
            continue
          }
          var idx = inArray(that.data.connectedBles, "deviceId", deviceId)
          if (idx > -1) { //设备已经存在
            var services = that.data.connectedBles[idx].services //获取服务集合
            if (services) { //服务集合存在
              var idy = inArray(services, "uuid", service.uuid)
              if (idy == -1) { //服务集合中不存该服务
                that.setData({
                  [`connectedBles[${idx}].services[${that.data.connectedBles[idx].services.length}]`]: service
                })
              }
            } else { //服务集合不存在
              that.setData({
                [`connectedBles[${idx}].services`]: [service]
              })
            }
            if (service.isPrimary) {
              this.getBLEDeviceCharacteristics(deviceId, service.uuid)
            }
          }

        }
      },
      fail: res => {
        util.log('getBLEDeviceServices fail:' + JSON.stringify(res))
        // util.showToastNone(res.errMsg)
        this.dealBleMsg(res)
      }
    })
  },
  /**
   * 获取蓝牙设备某个服务中所有特征值(characteristic),并开启读写通道。
   */
  getBLEDeviceCharacteristics(deviceId, serviceId) {
    var that = this
    // util.log("发现服务：" + JSON.stringify(deviceId) + "  " + JSON.stringify(serviceId))
    wx.getBLEDeviceCharacteristics({
      deviceId,
      serviceId,
      success: (res) => {
        // util.log('getBLEDeviceCharacteristics success:' + JSON.stringify(res))
        var idx = inArray(that.data.connectedBles, "deviceId", deviceId)
        if (idx > -1) { //设备存在
          var idy = inArray(that.data.connectedBles[idx].services, "uuid", serviceId)
          if (idy > -1) { //服务存在
            var chars = that.data.connectedBles[idx].services[idy].characteristics
            if (chars) { //通道集合存在

              for (let i = 0; i < res.characteristics.length; i++) {
                let item = res.characteristics[i]
                var idz = inArray(that.data.connectedBles[idx].services[idy].characteristics, "uuid", item.uuid)
                if (idz > -1) { //通道存在
                  that.setData({
                    [`connectedBles[${idx}].services[${idy}].characteristics[${idz}].properties`]: item.properties
                  })
                } else { //通道不存在
                  that.setData({
                    [`connectedBles[${idx}].services[${idy}].characteristics[${that.data.connectedBles[idx].services[idy].characteristics.length}]`]: item
                  })
                }
              }

            } else {
              that.setData({
                [`connectedBles[${idx}].services[${idy}].characteristics`]: res.characteristics
              })
            }
          }
        }
      },
      fail: res => {
        util.log('getBLEDeviceCharacteristics fail:' + JSON.stringify(res))
        // util.showToastNone(res.errMsg)
        this.dealBleMsg(res)
      }
    })
  },

  sendResToDevice() {
    this.writeBLECharacteristicValue()
  },
  /**
   * 向低功耗蓝牙设备特征值中写入二进制数据。注意：必须设备的特征值支持 write 才可以成功调用。
   */
  writeBLECharacteristicValue(r) {
    // 向蓝牙设备发送一个0x00的16进制数据
    var bb = constant.makeBleData(r)
    this.setData({
      res: bb[1]
    })
    wx.writeBLECharacteristicValue({
      deviceId: this._deviceId,
      serviceId: this._serviceId,
      characteristicId: this._characteristicId,
      value: bb[0],
      success: res => {
        util.log('writeBLECharacteristicValue success :' + JSON.stringify(res))
      },
      fail: res => {
        util.log('writeBLECharacteristicValue fail:' + JSON.stringify(res))
        // util.showToastNone(res.errMsg)
        this.dealBleMsg(res)
      }
    })
  },
  /**
   * 关闭蓝牙适配器
   */
  closeBluetoothAdapter() {
    var that = this
    wx.closeBluetoothAdapter({
      success: function(res) {
        util.log('closeBluetoothAdapter success:' + JSON.stringify(res))
        that.setData({
          discovering: false,
          available: false,
          [`connectedBles`]: []
        })
      },
      fail: function(res) {
        util.log('closeBluetoothAdapter fail:' + JSON.stringify(res))
        // util.showToastNone(res.errMsg)
        this.dealBleMsg(res)
      }
    })
    this._discoveryStarted = false
  },
  onLoad: function(res) {
    // var c=constant.makeBleData()
    // util.log("SSSSSSSS=" + c[2].getInt8(0))
    // util.log("SSSSSSSS=" + c[2].getUint8(0))
  },
  getConnectedBluetoothDevices() {
    var that = this
    wx.getConnectedBluetoothDevices({
      services: [],
      success: function(res) {
        util.log("getConnectedBluetoothDevices success:" + JSON.stringify(res))
        that.setData({
          getConnectedBluetoothDevices: res.devices
        })
      },
      fail: res => {
        util.log("getConnectedBluetoothDevices fail:" + JSON.stringify(res))
        // that.dealBleErrCode(res.errCode)
        // util.showToastNone(res.errMsg)
        this.dealBleMsg(res)
      }
    })
  },
  dealBleMsg: function(res) {
    util.log("dealBleMsg :" + JSON.stringify(res))
    var msg
    var code = res.errCode
    if (code != undefined)
      msg =
      code == 0 ? '正常' :
      code == 10000 ? '未初始化蓝牙适配器' :
      code == 10001 ? '当前蓝牙适配器不可用' :
      code == 10002 ? '没有找到指定设备' :
      code == 10003 ? '连接失败' :
      code == 10004 ? '没有找到指定服务' :
      code == 10005 ? '没有找到指定特征值' :
      code == 10006 ? '当前连接已断开' :
      code == 10007 ? '当前特征值不支持此操作' :
      code == 10008 ? '其余所有系统上报的异常' :
      code == 10009 ? 'Android 系统特有，系统版本低于 4.3 不支持 BLE' : "未知异常"
    else
      msg = res.errMsg
    util.log("dealBleErrCode " + msg)
    util.showToastNone(msg)
  },


  // for (let i = 0; i < res.characteristics.length; i++) {
  //   let item = res.characteristics[i]
  //   if (item.properties.read) {
  //     wx.readBLECharacteristicValue({
  //       deviceId,
  //       serviceId,
  //       characteristicId: item.uuid,
  //     })
  //   }
  //   if (item.properties.write) {
  //     this.setData({
  //       canWrite: true
  //     })
  //     this._deviceId = deviceId
  //     this._serviceId = serviceId
  //     this._characteristicId = item.uuid
  //     // this.writeBLECharacteristicValue(0)
  //   }
  //   if (item.properties.notify || item.properties.indicate) {
  //     //启用低功耗蓝牙设备特征值变化时的 notify 功能，订阅特征值。注意：必须设备的特征值支持 notify 或者 indicate 才可以成功调用。
  //     // 另外，必须先启用 notifyBLECharacteristicValueChange 才能监听到设备 characteristicValueChange 事件
  //     wx.notifyBLECharacteristicValueChange({
  //       deviceId,
  //       serviceId,
  //       characteristicId: item.uuid,
  //       state: true,
  //       success: res => {
  //         util.log('notifyBLECharacteristicValueChange success:' + JSON.stringify(res))
  //       },
  //       fail: res => {
  //         util.log('notifyBLECharacteristicValueChange fail:' + JSON.stringify(res))
  //         // util.showToastNone(res.errMsg)
  //         this.dealBleMsg(res)
  //       }
  //     })
  //   }
  // }
  notifyBLECharacteristicValueChange: function(res) {
    util.log("notifyBLECharacteristicValueChange:" + JSON.stringify(res))
    var that = this
    var item = res.currentTarget.dataset
    var deviceId = item.deviceid
    var serviceId = item.serviceuuid
    var characteristicId = item.characteristic.uuid
    var toenable = item.characteristic.enable ? false : true
    var idx = parseInt(item.index[0])
    var idy = parseInt(item.index[1])
    var idz = parseInt(item.index[2])
    if (item.characteristic.properties.notify || item.characteristic.properties.indicate) {
      //启用低功耗蓝牙设备特征值变化时的 notify 功能，订阅特征值。注意：必须设备的特征值支持 notify 或者 indicate 才可以成功调用。
      // 另外，必须先启用 notifyBLECharacteristicValueChange 才能监听到设备 characteristicValueChange 事件
      wx.notifyBLECharacteristicValueChange({
        deviceId,
        serviceId,
        characteristicId,
        state: toenable,
        success: res => {
          util.log('notifyBLECharacteristicValueChange success:' + JSON.stringify(res))
          that.setData({
            [`connectedBles[${idx}].services[${idy}].characteristics[${idz}].enable`]: toenable
          })
        },
        fail: res => {
          util.log('notifyBLECharacteristicValueChange fail:' + JSON.stringify(res))
          // util.showToastNone(res.errMsg)
          this.dealBleMsg(res)
        }
      })
    }
  },
  readBLECharacteristicValue: function(res) {
    util.log("readBLECharacteristicValue:" + JSON.stringify(res))
  },
  writeBLECharacteristicValue: function(res) {
    util.log("writeBLECharacteristicValue:" + JSON.stringify(res))
  },

})