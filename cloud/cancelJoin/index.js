// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: 'lectureassistant-ug1tm'
})
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  var lectureID = event.lectureID;
  var userID = event.userID;
  var myJoin = event.myJoin;
  var joinList = event.joinList;

  await db.collection('lectures').where({
    _id: lectureID
  }).update({
    data: {
      'joinList': joinList
    },
    success: res => {
      console.log(res);

    }

  })

  return await db.collection('users').where({
    'userID': userID
  }).update({
    data: {
      'myJoin': myJoin
    },
    success: res => {
      console.log(res);
    },
    fail: err => {
      console.log(err);
    }
  })
}