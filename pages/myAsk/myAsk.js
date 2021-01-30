const app = getApp();
const db = wx.cloud.database();

Page({
  data: {
    havaQuestion: true,
    myComments:[]
  },

  onLoad: function(options) {
    wx.setNavigationBarTitle({
      title: "我发表的"
    })
    wx.showLoading({
      title: '加载中...',
      mask:true
    })

    var that = this;
    var userID = app.globalData.userID;
    var myComments = [];
    var LikeComments = [];
    var haveQuestion = false;

    db.collection('users').where({
      'userID': userID
    }).get({
        success: res => {
          console.log(res);
          myComments = res.data[0].myComments;
          LikeComments = res.data[0].LikeComments;
          console.log(myComments);

          myComments.forEach(it =>{
            var commentID = it.commentID;
            var result = LikeComments.some(function(item) {
              if (item.commentID == commentID) {
                return true;
              }
              return false;
            })
            console.log(result);
            if(result) {
              it.url = "../../images/goodAfterChoose.png";
              it.isGood = true;
            } else {
              it.url = "../../images/good.png";
              it.isGood = false;
            }
          })
          console.log(myComments);
          if (myComments.length != 0) 
            haveQuestion = true;
          that.setData({
            myComments:myComments,
            haveQuestion: haveQuestion
          })
          wx.hideLoading();
        }
    })
  },

  change: function(e) {
    var that = this;
    var commentID = e.currentTarget.dataset.commentid;
    var lectureID = e.currentTarget.dataset.lectureid;
    var index = e.currentTarget.dataset.index;
    var myComments = this.data.myComments;
    var tag = 0;

    console.log(this.data.myComments);
    if (!myComments[index].isGood) {  //没有被点赞
      myComments[index].goodNumber += 1;
      myComments[index].url = '../../images/goodAfterChoose.png';
      myComments[index].isGood = true;
      tag = 1;
    } else {   //被点赞过
      myComments[index].goodNumber -= 1;
      myComments[index].url = '../../images/good.png';
      myComments[index].isGood = false;
      tag = -1;
    }

    console.log(commentID);
    console.log(lectureID);
    console.log(index);
    var likeComments = [];

    index = 0;
    db.collection('lectures').where({
      '_id':lectureID
    }).get({
      success: res=> {
        console.log(res.data[0].commentList);
        var arr = res.data[0].commentList;
        index = (arr || []).findIndex((arr) => arr.commentID === commentID);
        console.log(index);
      }
    })

    db.collection("users").where({
      'userID': app.globalData.userID
    }).get({
      success: res => {
        // res.data[0].LikeComments.splice(index, 1);
        likeComments = res.data[0].LikeComments;
        var i = (likeComments || []).findIndex((likeComments) => likeComments.commentID == commentID);
        likeComments.splice(i, 1);
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
            likeComments: likeComments
          },
          success: res => {
            console.log("修改成功", res);

            that.setData({  //重置评论信息
              myComments: myComments
            })
          }
        })
      }
    })
  },
  onShow:function(){
    this.onLoad();
  },
  onPullDownRefresh:function() {
    this.onLoad();
  }
})