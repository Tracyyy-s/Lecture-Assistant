const app = getApp();
const db = wx.cloud.database({
  env: 'lectureassistant-ug1tm'
});

Page({
  data: {
    //未开始讲座
    unjoinLec: [],

    //已经结束的讲座
    joinedLec: [],

    haveUnjoin: true,
    haveJoined: true
  },

  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: "我参与的"
    })
    wx.showLoading({
      title: 'loading...',
      mask:true
    })
    var that = this;
    var unjoinLectures = [];
    var joinedLectures = [];
    var haveUnjoin = false;
    var haveJoined = false;

    //获取讲座列表并将其分类
    db.collection('lectures').where({
      'joinList.userID':app.globalData.userID
    }).get({
      success: res => {
        console.log(res.data);
        //获取讲座列表
        var lecs = res.data;
        //通过讲座类别将讲座进行分类
        lecs.forEach(item => {
          if (item.lecturetype == 'joinedLecture') {
            //已结束的讲座
            joinedLectures.push(item);
          } else {
            //未开始的讲座
            unjoinLectures.push(item);
          }
        }) 
        
        if(unjoinLectures.length != 0) 
          haveUnjoin = true;
        if(joinedLectures.length != 0)
          haveJoined = true;
        //设置本页面的讲座列表
        that.setData({
          unjoinLec: unjoinLectures,
          joinedLec: joinedLectures,
          haveJoined: haveJoined,
          haveUnjoin: haveUnjoin
        })
        wx.hideLoading();
      }
    });
  },

  download_File: function (e) {
    //获取相应的fileID
    var fileID = e.currentTarget.dataset.fileid;
    var lecturetype = e.currentTarget.dataset.lecturetype;

    if (lecturetype == 'joinedLecture') {  //如果为已经结束的讲座
      wx.showModal({
        title: '操作失败',
        content: '讲座已经结束',
        success: res=> {},
        fail: err=> {}
      })
    } else {
      wx.showModal({
        title: '资料下载',
        content: '是否下载该讲座相关资料？',
        success: res => {
          if (res.confirm) {
            //从云环境下载文件
            wx.cloud.downloadFile({
              fileID: fileID,
              success: function (res) {
                console.log("下载成功");

                wx.showToast({
                  title: '下载成功',
                  icon: 'success',
                  duration: 1000
                })

                console.log(res.tempFilePath)
                //文件下载路径
                const filePath = res.tempFilePath;
                //打开文件
                wx.openDocument({
                  filePath: filePath,
                  success: res=> {
                    console.log('打开文档成功');
                  }
                })
              },
              fail: err=> {
                console.log("下载失败", err);
              }
            })
          } else {
            /**
             * 用户选择取消
             */
          }
         },
        fail: err => { 
          wx.showModal({
            title: '操作异常',
            content: '下载失败，请检查网络是否连接或稍后重新尝试！',
          })
        }
      })
    }
  },

  wantToAsk: function (e) {
    var id = e.currentTarget.dataset.id;
    var lecturetype = e.currentTarget.dataset.lecturetype;
    var userID = e.currentTarget.dataset.userid;
    wx.navigateTo({
      url: '../ask/ask?id=' + id + '&lecturetype=' + lecturetype
    })
  },
  
  onPullDownRefresh:function(){
    this.onLoad();
  }
})