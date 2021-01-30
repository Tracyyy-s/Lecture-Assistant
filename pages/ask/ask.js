const app = getApp();
const db = wx.cloud.database();
const _ = db.command;

Page({
  data: {
    question: '',   //问题
    lecturetype: "",  //传入讲座类型
    id: "",     //传入讲座的_id
    commentList: [],   //该讲座的评论列表
    myComments: [],  //我在该讲座的评论

    bgcolor1: "gainsboro",
    bgcolor2: "white",
    bgcolor3: "rgba(255, 144, 0, .2)",
    ismine: false,
    value: '',
  },

  //页面初始化
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: "讲座详情"
    })
    var that = this;
    var id = options.id;     //讲座id
    var lecturetype = options.lecturetype; //讲座类型
    console.log(id + ' ' + lecturetype);

    var comments = [];
    that.setData({  //动态修改界面元素
      lecturetype: lecturetype,
      id: id
    })
    that.showAll();
  },
  /**
   * 展示所有评论
   */
  showAll: function() {
    wx.showLoading({
      title: 'loading',
      mask: true
    })
    var that = this;
    var id = that.data.id;     //讲座id
    var lecturetype = that.data.lecturetype; //讲座类型
    var comments = [];  //评论列表
    db.collection('lectures').doc(id).get({  //获取该讲座类型的集合
      success: res => {
        comments = res.data.commentList;
        console.log(comments);

        var likeCommentIDList = []
        db.collection('users').where({
          'userID': app.globalData.userID
        }).get({
          success: res => {
            console.log(res.data[0].LikeComments);
            //用户点赞的评论列表
            var arr = res.data[0].LikeComments;
            if (arr.length != 0) {  //如果用户有点赞的评论
              for (var i = 0; i < arr.length; i++) {
                //得到用户点赞的评论列表
                likeCommentIDList.push(arr[i].commentID);
              }
              //对讲座评论列表进行遍历
              //在点赞列表里查询 是否点赞评论列表中的评论
              comments.forEach(item => {
                console.log(likeCommentIDList.indexOf(item.commentID));
                //如果点赞列表里存在该评论
                if (likeCommentIDList.indexOf(item.commentID) > -1) {
                  item.url = '../../images/goodAfterChoose.png';
                  item.isGood = true;
                } else {
                  item.url = '../../images/good.png';
                  item.isGood = false;
                }
                console.log(item);
              })
            } else {  //如果没有用户点赞的评论
              comments.forEach(item => {
                item.url = '../../images/good.png';
                item.isGood = false;
                console.log(item);
              })
            }
            //修改commentList元素
            that.setData({
              commentList: comments
            })
            wx.hideLoading();
          },
          fail: err => {
            console.log("Not Found!", err);
          }
        })
      }
    })
  },
  /**
   * 展示我在该讲座的评论
   */
  showMine: function() {
    wx.showLoading({
      title: 'loading',
      mask: true
    });

    var that = this;
    var id = that.data.id;     //讲座id
    var lecturetype = that.data.lecturetype; //讲座类型
    var myComments = [];  //存储我在该讲座的评论
    var userID = app.globalData.userID;  //我的账号

    db.collection('lectures').where({
      _id: id
    }).get({
      success: res=> {
        console.log(res.data);
        var list = res.data[0].commentList;

        list.forEach(item => {
          if (item.askerID == userID) {
            myComments.push(item);
          }
        })

        that.setData({
          myComments: myComments
        })
        wx.hideLoading();
      }
    })
  },

  questionInput: function (e) {
    this.setData({
      question: e.detail.value,
      value: e.detail.value
    })
  },

  change: function (e) {
    var that = this;
    //评论的id
    var commentID = e.currentTarget.dataset.commentid;  
    //评论在讲座评论列表中的位置
    var index = e.currentTarget.dataset.index;  
    //当前讲座的评论列表
    var commentList = that.data.commentList;
    var tag = 0; //判断为点赞还是取消点赞
    console.log(that.data.commentList);
    console.log(commentID);
    console.log(index);
    
    if (!commentList[index].isGood) {  //没有被点赞
      commentList[index].goodNumber += 1;
      commentList[index].url = '../../images/goodAfterChoose.png';
      commentList[index].isGood = true;
      tag = 1;
    } else {   //取消点赞
      commentList[index].goodNumber -= 1;
      commentList[index].url = '../../images/good.png';
      commentList[index].isGood = false;
      tag = -1;
    }

    that.setData({  //重置评论信息
      commentList: commentList
    })

    var likeComments = [];  //用户点赞的评论列表
    db.collection("users").where({
      'userID': app.globalData.userID
    }).get({
      success: res => {
        console.log(res);
        likeComments = res.data[0].LikeComments;
        var i = (likeComments || []).findIndex((likeComments) => likeComments.commentID == commentID);
        likeComments.splice(i,1);
        console.log(likeComments);
        //调用云函数更新数据库
        wx.cloud.callFunction({
          name: "good",
          data: {
            commentID: commentID,
            id: that.data.id,
            tag: tag,
            index: index,
            userID: app.globalData.userID,
            NickName:app.globalData.NickName,
            likeComments: likeComments
          },
          success: res => {
            console.log("修改成功", res);
          }
        })
      }
    })
  },

  handIn: function () {
    var that = this;

    if(that.data.lecturetype == 'joinedLecture') {
      wx.showToast({
        title: '讲座已结束！',
        icon: 'loading',
        duration: 500
      })
    } else if (that.data.question.length == 0) {
      wx.showToast({
        title: '内容不能为空',
        icon: 'loading',
        duration: 500
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '确认发表提问吗？',
        success: res=> {
          if (res.confirm) {
            wx.showLoading({
              title: '正在发表...',
              mask: true
            })
            //将提问添加到数据库中
            var content = that.data.question;
            var askerID = app.globalData.userID;
            var NickName = app.globalData.NickName;
            console.log(app.globalData.userID);

            wx.cloud.callFunction({
              name: 'submitComment',
              data: {
                id: that.data.id,
                asker: askerID,
                content: content,
                time: app.getTime(),
                commentID: app.guid(),
                NickName: NickName
              },
              success: res => {
                console.log("提交", res);
                // 这里修改成跳转的页面
                wx.hideLoading();

                wx.showToast({
                  title: '提交成功',
                  icon: 'success',
                  duration: 500
                })
                that.setData({
                  value: ''
                })
                that.mine();
              }
            })
          } else {
            /**
             * 用户选择取消
             */
          }
        }
      })

    }
  },
  /**
   * 签到
   */
  tosign: function() {
    var that = this;
    var id = that.data.id;
    var lecturetype = that.data.lecturetype;
    var userID = app.globalData.userID;
    var openid = app.globalData.openid;

    if (lecturetype == 'joinedLecture') {
      wx.showModal({
        title: '签到失败',
        content: '该讲座已结束',
        success: res=> {},
        fail: err=>{}
      })
    } else {
      wx.showLoading({
        title: '正在签到...',
        mask: true
      });
      
      db.collection('lectures').where({
        '_id': id
      }).get({
        success: res=> {
          var signedList = res.data[0].signedList;
          var flag = false;
          var flag2 = false;
          for (var i = 0; i < signedList.length ;i++) { //判断是否完成签到
            if (signedList[i].userID == userID) {
              flag = true;
              break;
            }
            if (signedList[i].openid == openid) {
              flag2 = true;
              break;
            }
          }
          if (flag) {  //已经完成签到，提示无法二次签到
            wx.hideLoading();
            wx.showModal({
              title: '操作失败',
              content: '请勿重复签到！',
            })
          } else if (flag2) {  //检测是否为同一微信号签到
            wx.hideLoading();
            wx.showModal({
              title: '操作失败',
              content: '每个微信账号只能签到一次！',
            })
          } else {  //发起签到请求
            db.collection('lectures').where({
              _id: id
            }).get({
              success: res => {
                console.log(res);
                wx.hideLoading();

                if (!res.data[0].available) { //若讲座没有发布签到
                  wx.showModal({
                    title: '签到失败',
                    content: '该讲座尚未发布签到',
                    success: res => { },
                    fail: err => { }
                  })
                } else {
                  wx.getLocation({
                    type: 'wgs84', // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
                    success: function (res) {
                      console.log(res);

                      wx.showLoading({
                        title: '正在获取位置..',
                        mask: true
                      });
                      /**
                       * 调用云函数
                       */
                      var time = app.getTime();
                      wx.cloud.callFunction({
                        name: 'signin',
                        data: {
                          latitude: res.latitude,
                          longitude: res.longitude,
                          lectureID: id,
                          userID: userID,
                          NickName: app.globalData.NickName,
                          time: time,
                          openid: openid
                        },
                        success: res => {
                          wx.hideLoading();
                          console.log(res);

                          if (res.result == 'so far') {  //返回距离过远
                            wx.showModal({
                              title: '操作失败',
                              content: '当前位置距离讲座太远，无法进行签到',
                              succee: {},
                              fail: err => { }
                            })
                          } else if (res.result == 'fail') {  //写入数据库失败
                            wx.showModal({
                              title: '操作失败',
                              content: '签到失败，请检查网络设置或稍后重试',
                              succee: res=> {},
                              fail: err => { }
                            })
                          } else {  //签到成功
                            wx.showModal({
                              title: '操作成功',
                              content: '已完成签到',
                              success: res => { },
                              fail: err => { }
                            })
                          }
                        },
                        fail: err => {
                          wx.hideLoading();
                          console.log(err);
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
                }
              }
            })
          }
        }
      })
    }
  },

  all: function () {
    this.setData({
      bgcolor1: "gainsboro",
      bgcolor2: "white",
      ismine: false
    });
    this.showAll();
  },

  mine: function () {
    this.setData({
      bgcolor1: "white",
      bgcolor2: "gainsboro",
      ismine: true
    }),
    this.showMine();
  },

  getImage: function() {
    var that = this;
    if (that.data.lecturetype == 'joinedLecture') {
      wx.showModal({
        title: '操作失败',
        content: '讲座已结束！',
        success: res=> {},
        fail: err=> {}
      })
      return;
    }

    var tempFilePath;
    wx.showActionSheet({
      itemList: ["拍照","从手机相册选择"],
      success: res=> {
        console.log(res.tapIndex);
        if(res.tapIndex == 0) {  //选择拍照
          wx.chooseImage({
            count: 1,
            sizeType: ['original', 'compressed'],
            sourceType: ['camera'],
            success(res) {
              // tempFilePath可以作为img标签的src属性显示图片
              tempFilePath = res.tempFilePaths[0];
              console.log(tempFilePath);
              that.uploadImg(tempFilePath);
            }
          })
        } else {
          wx.chooseImage({
            count: 1,
            sizeType: ['original', 'compressed'],
            sourceType: ['album'],
            success(res) {
              // tempFilePath可以作为img标签的src属性显示图片
              tempFilePath = res.tempFilePaths[0];
              console.log(tempFilePath);
              that.uploadImg(tempFilePath);
            }
          })
        }
      },
      fail: err=> {}
    })
  },

  uploadImg: function(imgPath) {
    var that = this;
    wx.showLoading({
      title: '正在上传...',
      mask: true
    });
    var lectureID = that.data.id;
    var arr = imgPath.split('.');
    var imgName = app.guid() + '.' + arr[arr.length - 1];
  
    var path = 'pictures/'+lectureID+'/'+app.globalData.userID;
    wx.cloud.uploadFile({
      cloudPath: path + '/' + imgName,
      filePath: imgPath,
      success: res=> {
        wx.cloud.callFunction({
          name: 'uploadImage',
          data: {
            lectureID: lectureID,
            userID: app.globalData.userID,
            imgName: imgName,
          },
          success: res => {
            console.log(res);
            wx.hideLoading();
            wx.showToast({
              title: '上传成功！',
              icon: 'success'
            })
          },
          fail: err => {
            console.log(err);
            wx.hideLoading();
            wx.showToast({
              title: '上传失败...',
              icon: 'loading'
            })
          }
        })
      }
    })
  }
})