// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env:'lectureassistant-ug1tm'
})
const db = cloud.database()
const _ = db.command
// 云函数入口函数
exports.main = async (event, context) => {
  var lectureID = event.id;
  var commentID = event.commentID;
  var tag = event.tag;
  var userID = event.userID;
  var index = event.index;
  var likeComments = event.likeComments;

  try {
    //更改讲座中评论
    await db.collection('lectures').where({
      '_id': lectureID,
      'commentList.commentID':commentID
    }).update({
      data: {
        'commentList.$.goodNumber':_.inc(tag)
      }
    }).then({
      
    })

    var obj = {
      'lectureID': lectureID,
      'commentID': commentID
    }
    //更改用户历史点赞评论
    if (tag == 1) {   //如果为点赞
      await db.collection("users").where({
        'userID': userID,
      }).update({
        data: {
          'LikeComments':_.push(obj)
        }
      })
    } else {  //如果为取消点赞
      await db.collection("users").where({
        'userID': userID
      }).update({
        data:{
          'LikeComments': likeComments
        }
      })
    }

    //判断 点赞/取消点赞 是否为自己发表的评论
    await db.collection("users").where({
      'userID': userID,
      'myComments.commentID': commentID
    }).update({
      data: {
        'myComments.$.goodNumber': _.inc(tag)
      }
    })
  } catch (e) {
    console.log(e);
  }
}