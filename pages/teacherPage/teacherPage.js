const app = getApp();
const db = wx.cloud.database();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    latitude:'',
    longitude:'',
    myLectures:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: "教师主页"
    })
    wx.showLoading({
      title: 'loading',
      icon: 'loading',
      mask: true
    })
    var that = this;
    var userID = app.globalData.userID;
    var myLectures = [];

    db.collection('lectures').where({
      authorID:userID
    }).get({
      success:res=>{
        myLectures = res.data;
        console.log(myLectures);

        myLectures.reverse();
        that.setData({
          myLectures: myLectures
        })
        wx.hideLoading();
      },fail:err=>{
        console.log(err);
      }
    })
  },
  /**
   * 发起签到
   */
  qiandao:function(event){
    var that = this;
    var lectureID = event.currentTarget.dataset.lectureid;
    var available = event.currentTarget.dataset.available;

    wx.showActionSheet({
      itemList: ['发起签到','查看签到情况','结束讲座'],
      success(res) {
        console.log(res.tapIndex);
        if (res.tapIndex == 0) { //老师选择发起签到
          if (available) { //若签到已发起
            wx.showModal({
              title: '操作失败',
              content: '签到未结束，请勿重复发布签到！',
              success: res=> {},
              fail: err=> {}
            })
          } else {  //否则发起签到
            //获取当前的地理位置、速度
            wx.getLocation({
              type: 'wgs84', // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
              success: function (res) {
                console.log(res);
                //赋值经纬度
                wx.showLoading({
                  title: '正在上传位置..',
                  mask: true
                });

                that.setData({
                  latitude: res.latitude,
                  longitude: res.longitude,
                })
                
                //调用云函数 添加地理位置
                wx.cloud.callFunction({
                  name: 'addLocation',
                  data: {
                    latitude: res.latitude,
                    longitude: res.longitude,
                    lectureID: lectureID
                  },
                  success: res => {  //发起成功后跳转界面
                    console.log(res);

                    wx.hideLoading();
                    wx.navigateTo({
                      url: '../signedList/signedList?lectureID='+lectureID+'&available='+true
                    })
                  }
                })
              },
              fail: function () {  //获取地理位置失败
                wx.getSetting({
                  success: function (res) {
                    var statu = res.authSetting;
                    if (!statu['scope.userLocation']) {
                      wx.showModal({
                        title: '是否授权当前位置',
                        content: '需要获取您的地理位置，请确认授权，否则地图功能将无法使用',
                        success: function (tip) {
                          console.log(1)
                          if (tip.confirm) {
                            console.log(1)
                            wx.openSetting({
                              success: function (data) {
                                if (data.authSetting["scope.userLocation"] === true) {
                                  wx.showToast({
                                    title: '授权成功',
                                    icon: 'success',
                                    duration: 1000
                                  })
                                  wx.getLocation({
                                    success(res) {
                                      that.setData({
                                        currentLon: res.longitude,
                                        currentLat: res.latitude,
                                      });
                                    },
                                  });
                                } else {
                                  wx.showToast({
                                    title: '授权失败',
                                    icon: 'loading',
                                    duration: 1000
                                  })
                                  wx.navigateBack({
                                    delta: -1
                                  });
                                }
                              }
                            })
                          } else {
                            wx.navigateBack({
                              delta: -1
                            });
                          }
                        }
                      })
                    }
                  },
                  fail: function (res) {
                    wx.showToast({
                      title: '调用授权窗口失败',
                      icon: 'success',
                      duration: 1000
                    })
                    wx.navigateBack({
                      delta: -1
                    });
                  }
                })
              }
            })
          }  //若老师选择查看签到名单
        } else if (res.tapIndex == 1) {   //跳转到签到名单界面
          wx.navigateTo({
            url: '../signedList/signedList?lectureID='+lectureID
          })
        } else {
          wx.showModal({
            title: '警告',
            content: '结束后学生无法进行评论，签到通道也将关闭，是否结束讲座？',
            showCancel: true,
            success: function(res) {
              var curTime = app.getTime();
              if (res.confirm) {
                wx.showLoading({
                  title: '正在处理...',
                  mask: true
                })
                wx.cloud.callFunction({
                  name: 'endLecture',
                  data: {
                    lectureID: lectureID
                  },
                  success: res=> {
                    wx.hideLoading();
                    wx.showToast({
                      title: '讲座已结束',
                      icon: 'success'
                    })
                    console.log(res);
                    that.onLoad();
                  },
                  fail: err=> {
                    console.log(err);
                  }
                })
              }
            },
            fail: function(res) {},
            complete: function(res) {},
          })
        }
      },
      fail(res) {
        console.log(res.errMsg)
      }
    })
  },

  getcomments: function(event) {
    var lectureID = event.currentTarget.dataset.lectureid;
    wx.showActionSheet({
      itemList: ['查看评论'],
      success: res => {
        console.log(res.tapIndex);
        if (res.tapIndex == 0) {
          wx.navigateTo({
            url: '../teacherComments/teacherComments?lectureID='+lectureID,
          })
        }
      },
      fail: err => {

      }
    })
  },

  addLecture: function () {
    wx.showActionSheet({
      itemList: ['发表讲座'],
      success: res=> {
        console.log(res.tapIndex);
        if (res.tapIndex == 0) {
          wx.navigateTo({
            url: '../addLecture/addLecture',
          })
        }
      },
      fail: err=> {
        
      }
    })
  },

  checkSignedList: function (event) {
    var lectureID = event.currentTarget.dataset.lectureid;
    wx.showActionSheet({
      itemList: ['查看签到列表'],
      success: res => {
        console.log(res.tapIndex);
        if (res.tapIndex == 0) {
          wx.navigateTo({
            url: '../signedList/signedList?lectureID=' + lectureID
          })
        }
      },
      fail: err => {

      }
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.onLoad();
  },

})