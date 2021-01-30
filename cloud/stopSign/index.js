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

  return await db.collection('lectures').where({
    _id:lectureID
  }).update({
    data: {
      'available':false
    },
    success:res=>{
      console.log(res);
    },
    fail:err=>{
      console.log(err);
    }
  })
}