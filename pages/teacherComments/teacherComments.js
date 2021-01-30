const app = getApp();
const db = wx.cloud.database({
  env: 'lectureassistant-ug1tm'
});

Page({

  /**
   * 页面的初始数据
   */
  data: {
    lectureID: '',
    commentList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: 'loading...',
      mask:true
    })
    var that = this;
    var lectureID = options.lectureID;
    var commentList = [];
    db.collection('lectures').where({
      _id: lectureID
    }).get({
      success: res=> {
        console.log(res);
        commentList = res.data[0].commentList;

        commentList.sort(function (o1, o2) {
          if (o1.goodNumber < o2.goodNumber)
            return 1;
          else if (o1.goodNumber == o2.goodNumber)
            return 0; 
          else 
            return -1;
        });
        wx.hideLoading();
        that.setData({
          commentList:commentList
        })
      }
    })
  },
})