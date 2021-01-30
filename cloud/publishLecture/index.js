// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: 'lectureassistant-ug1tm'
})
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  var userID = event.userID;
  var title = event.title;
  var author = event.author;
  var authorID = event.authorID;
  var address = event.address;
  var date = event.date;
  var introduction = event.introduction;
  var fileID = event.fileID;

  var result = "";
  try {
    await db.collection("lectures").add({
      data: {
        'title': title,
        'author': author,
        'authorID': authorID,
        'address': address,
        'commentList': [],
        'date': date,
        'introduction': introduction,
        'lecturetype': "unjoinLecture",
        'fileID': fileID,
        'available':false,
        'location': {},
        'signedList': [],
        'joinList': []
      }
    }).then(res => {
      console.log(res);
      result += res._id;
      var obj = {
        'lectureID': res._id
      };

      return db.collection('users').where({
        'userID': userID
      }).update({
        data: {
          'myLectures': _.unshift(obj)
        }
      }).then(res => {
        result += ('&' + res.stats.updated);
        console.log(res);
      })
    })
    return result;

  } catch (e) {
    console.log(e);
  }
}