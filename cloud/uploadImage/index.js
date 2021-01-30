// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: 'lectureassistant-ug1tm'
})
const db = cloud.database();
const _ = db.command;
const fs = require('fs');
const path = require('path');

// 云函数入口函数
exports.main = async (event, context) => {
  var lectureID = event.lectureID;
  var userID = event.userID;
  var imgName = event.imgName;

  await db.collection("pictures").add({
    data: {
      lectureID: lectureID,
      userID: userID,
      imgName: imgName
    },
    success: res => {
      console.log(res);
    },
    fail: err => {
      console.log(err);
    }
  })
}