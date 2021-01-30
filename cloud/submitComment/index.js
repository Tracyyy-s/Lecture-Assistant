// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env:'lectureassistant-ug1tm'
})
const db = cloud.database();
const _ = db.command;

// 云函数入口函数
exports.main = async (event, context) => {
  var _id = event.id;  //讲座的_id
  var asker = event.asker;  //提问者ID
  var NickName = event.NickName;
  var content = event.content; //提问者提问内容
  var time = event.time;  //提问时间
  var commentID = event.commentID;  //评论的ID

  var obj = {  //定义评论对象
    'askerID': asker,
    'NickName':NickName,
    'content': content,
    'goodNumber': 0,
    'time': time,
    'commentID': commentID
  };

  try {
    await db.collection('lectures').where({
      '_id': _id,
    }).update({
      data: {
        'commentList': _.push(obj)
      }
    })
  } catch (e) {
    console.log("Error:", e);
  }

  //为提问者的提问添加记录
  var myobj = {
    'NickName': NickName,
    'content': content,
    'time': time,
    'lectureID': _id,
    'commentID': commentID,
    'goodNumber': 0
  }

  try {
    await db.collection('users').where({
      'userID': asker,
    }).update({
      data: {
        'myComments': _.unshift(myobj)
      }
    })
  } catch (e) {
    console.log("Error:", e);
  }
}