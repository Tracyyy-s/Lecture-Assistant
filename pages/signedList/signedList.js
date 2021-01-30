const app = getApp();
const db = wx.cloud.database();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    lectureID:'',
    signedList:[],
    available: false,
    over: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var lectureID = options.lectureID;
    var signedList = [];
    var over = false;

    db.collection('lectures').doc(lectureID).get({
      success:res=>{
        signedList = res.data.signedList;
        console.log(res);
        if (res.data.lecturetype == 'joinedLecture') {
          over = true;
        }
        that.setData({
          lectureID:lectureID,
          signedList:signedList,
          available:res.data.available,
          over:over
        })    
      }
    })
  },
  
  /**
   * 取消签到 
   */
  cancelsign: function() {
    var that = this;
    var available = that.data.available;
    console.log(available);

    wx.showModal({
      title: '停止签到',
      content: '是否停止本次签到？',
      success: res=> {
        if (res.confirm) {
          if (available) {  //如果讲座在可签到的状态
            //调用云函数 停止签到
            wx.cloud.callFunction({
              name: 'stopSign',
              data: {
                lectureID: that.data.lectureID
              },
              success: res => {
                console.log(res);

                that.setData({
                  available: false
                })
                wx.showModal({
                  title: '操作成功',
                  content: '签到已停止！',
                  success: res=> {},
                  fail: err=> {}
                })
              },
              fail: err => {
                console.log(err);
                wx.showToast({
                  title: '取消失败...',
                  icon: 'loading',
                  duration: 1000
                })
              }
            })
          } else {
            wx.showModal({
              title: '操作失败',
              content: '当前未在签到状态，请先发起签到！',
              success: res=> {},
              fail: err=> {}
            })
          }
        } else {
          /**
           * 用户选择取消
           */
        }
      }
    })
  }

})