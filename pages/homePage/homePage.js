const app = getApp();
const db = wx.cloud.database();
const _ = db.command;

Page({
  data: {
    isOnShowDetail:false,
    lectures:[],
    myJoin: []
  },
  
  onLoad: function (options) {
    console.log(app.globalData.openid);
    wx.getUserInfo({
      success: res=> {
        console.log(res);
        app.globalData.userInfo = res.userInfo;
        app.globalData.NickName = res.userInfo.nickName;
      }
    })
    wx.setNavigationBarTitle({
      title: "学生主页"
    })
    wx.showLoading({
      title: '加载中...',
      mask:true
    })
    var that = this;
    var userID = app.globalData.userID;
    var password = app.globalData.password;
    var myJoin = [];

    //调试输出，检测是否传递成功
    console.log(userID);
    console.log(password);
    
    db.collection('lectures').get({
      success: res => {
        console.log(res.data);
        //获取讲座列表
        var lectures = [];
        var i = 0, j = res.data.length -1;
        for (;j >= 0;i++,j--) {
          lectures[i] = res.data[j];
          lectures[i].isOnShowDetail = false;
        }

        db.collection('users').where({
          'userID': userID
        }).get({
          success: res=> {
            console.log(res);
            myJoin = res.data[0].myJoin;

            that.setData({
              lectures: lectures,
              myJoin: myJoin
            })

            wx.hideLoading();
          }
        })
      }
    });
  },

  join: function (event) {
    var that = this;
    var title = event.currentTarget.dataset.title;
    var lectureID = event.currentTarget.dataset.lectureid;
    var lectureType = event.currentTarget.dataset.lecturetype;
    var userID = app.globalData.userID;
    var myJoin = that.data.myJoin;

    if (lectureType == 'joinedLecture') {
      wx.showLoading({
        title: '讲座已结束..',
        duration: 1000,
        mask: true
      })  
    } else {
      db.collection('lectures').where({
        _id:lectureID
      }).get({
        success: res=> {
          console.log(res);
          var joinList = res.data[0].joinList;
          var flag = myJoin.some(item => {
            if (item.lectureID == lectureID)
              return true;
          })
          
          if (flag) {
            wx.showModal({
              title: title,
              content: '您已报名该讲座，是否取消报名？',
              success: res=> {
                if (res.confirm) {
                  wx.showLoading({
                    title: '正在取消...',
                    mask: true
                  })
                  var i = (joinList || []).findIndex((joinList) => joinList.userID == userID);
                  joinList.splice(i, 1);
                  var j = (myJoin || []).findIndex((myJoin) => myJoin.lectureID == lectureID);
                  myJoin.splice(j, 1);
                  wx.cloud.callFunction({
                    name: "cancelJoin",
                    data: {
                      lectureID: lectureID,
                      userID: userID,
                      myJoin: myJoin,
                      joinList: joinList
                    },
                    success: res=> {
                      console.log(res);
                      wx.hideLoading();
                      wx.showToast({
                        title: '已取消',
                        icon: 'success',
                        duration: 1000
                      })
                      that.setData({
                        myJoin: myJoin
                      })
                    },
                    fail: err=> {
                      console.log(err);
                    }
                  })
                } else {
                  /**
                   * 用户点击取消
                   */
                }
              }
            })
          } else if (joinList.length >= 200) {
            wx.showToast({
              title: '报名人数已满！',
              icon: 'loading',
              mask: true,
              duration: 1000
            })
          } else {
            wx.showModal({
              title: title,
              content: '是否报名该讲座？',
              success: res=> {
                if (res.confirm) {
                  wx.showLoading({
                    title: '正在报名...',
                    mask: true
                  })

                  wx.cloud.callFunction({
                    name: 'join',
                    data: {
                      userID: userID,
                      lectureID: lectureID
                    },
                    success: res => {
                      console.log(res);

                      myJoin.push({ 'lectureID': lectureID });
                      that.setData({
                        myJoin: myJoin
                      })
                      wx.hideLoading();
                      wx.showToast({
                        title: '报名成功',
                        icon: 'success',
                        duration: 1000
                      })
                    },
                    fail: err => {
                      console.log(err);
                      wx.showToast({
                        title: '报名失败',
                        icon: 'loading',
                        duration: 1000
                      })
                    }
                  })    
                } else {
                  /**
                   * 用户点击取消
                   */
                }
              }
            })
          }
        }
      })
    }
  },

  showDetail: function(e) {
    var that = this;
    var index = e.currentTarget.dataset.index;
    var flag = !that.data.lectures[index].isOnShowDetail;
    var str = 'lectures[' + index + '].isOnShowDetail';
    this.setData({
      [str]: flag
    })
  },

  onPullDownRefresh:function() {
    this.onLoad();
  }
})