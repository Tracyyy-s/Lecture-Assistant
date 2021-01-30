// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env:'lectureassistant-ug1tm'
})
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  var lectureID = event.lectureID;  //讲座的ID
  var latitude=event.latitude;      //经度
  var longitude= event.longitude;   //纬度
  
  return await db.collection('lectures').where({
    _id:lectureID
  }).update({
    data:{
      'location.latitude':latitude,
      'location.longitude':longitude,
      'available':true
    },
    success:res=>{
      console.log(res);
    }
  })
}
