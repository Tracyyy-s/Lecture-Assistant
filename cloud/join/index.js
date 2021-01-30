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

  var joinList = [];
  var obj1 = {'userID': userID};
  var obj2 = {'lectureID': lectureID};
  await db.collection('lectures').where({
    _id: lectureID
  }).update({
    data:{
      'joinList': _.push(obj1)
    },
    success: res=> {
      console.log(res);
      
    }
    
  })

  return await db.collection('users').where({
    'userID': userID
  }).update({
    data: {
      'myJoin': _.push(obj2)
    },
    success: res => {
      console.log(res);
    },
    fail: err => {
      console.log(err);
    }
  })
}