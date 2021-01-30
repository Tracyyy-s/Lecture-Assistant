const app = getApp();
const db = wx.cloud.database();

Page({
  data: {
    userID: '',
    password: ''
  },

  // 获取输入账号
  IDInput: function (e) {
    this.setData({
      userID: e.detail.value
    })
  },

  // 获取输入密码
  passwordInput: function (e) {
    this.setData({
      password: e.detail.value
    })
  },

  // 登录
  login: function () {
    wx.showLoading({
      title: '正在登录...',
      icon: 'loading',
      mask: true
    })
    var that = this;
    var userID = that.data.userID;
    var password = that.data.password;
    if (userID.length == 0 || password.length == 0) {
      wx.hideLoading();
      wx.showToast({
        title: '请完整输入！',
        icon: 'loading',
        duration: 500
      })
    } else {
      db.collection('users').where({
        'userID': userID
      }).get({
        success: res => {
          if (res.data.length != 0) {
            var User = res.data[0];
            if (password.trim() != User.password) {
              wx.hideLoading();
              wx.showToast({
                title: '密码错误',
                icon: 'loading',
                duration: 1000
              })
            } else {
              wx.hideLoading();
              //为homePage传递参数
              app.globalData.userID = that.data.userID;
              app.globalData.password = that.data.password;
              
              wx.login({
                success: function (res) {
                  console.log(res)
                  if (res.code) {
                    console.log('通过login接口的code换取openid');
                    wx.request({
                      url: 'https://api.weixin.qq.com/sns/jscode2session',
                      data: {
                        //填上自己的小程序唯一标识
                        appid: app.globalData.appid,
                        //填上自己的小程序的 app secret
                        secret: app.globalData.secret,
                        grant_type: 'authorization_code',
                        js_code: res.code
                      },
                      method: 'GET',
                      header: { 'content-type': 'application/json' },
                      success: function (openIdRes) {
                        console.info("登录成功返回的openId：" + openIdRes.data.openid);
                        app.globalData.openid = openIdRes.data.openid;
                        wx.showToast({
                          title: '登录成功',
                          icon: 'success',
                          duration: 1000
                        })
                        if (User.identify == 'student') {
                          wx.switchTab({
                            url: '../homePage/homePage'
                          });
                        } else {
                          wx.redirectTo({
                            url: '../teacherPage/teacherPage',
                          })
                        }
                      },
                      fail: function (error) {
                        console.info("获取用户openId失败");
                        console.info(error);
                      }
                    })
                  }
                }
              })
            }
          } else {
            wx.showToast({
              title: '用户不存在',
              icon: 'loading',
              duration: 1000
            })
          }
        }
      })
    }
  },

  onLoad: function() {
   
  }
})