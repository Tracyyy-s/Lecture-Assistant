// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: 'lectureassistant-ug1tm'
})
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  var latitude = event.latitude;
  var longitude = event.longitude;
  var lectureID = event.lectureID;
  var userID = event.userID;
  var NickName = event.NickName;
  var time = event.time;
  var openid = event.openid;

  var operate = '';
  var obj = {
    'userID':userID, 
    'openid':openid, 
    'NickName':NickName,
    'time':time
  };
  var obj2 = {'lectureID':lectureID};

  try {
    await db.collection('lectures').where({
      '_id': lectureID
    }).get().then(res => {
      console.log(res);

      var lat = parseFloat(res.data[0].location.latitude);
      var lgd = parseFloat(res.data[0].location.longitude);
      console.log(lat + ' ' + lgd);
      var distance = getDistance(latitude, longitude, lat, lgd);
      console.log(distance);
      if (distance > 250) {
        operate = 'so far';
      } else {
        return db.collection('lectures').where({
          '_id': lectureID
        }).update({
          data: {
            'signedList': _.push(obj)
          }
        }).then(res => {
          console.log(res);
          if (res.stats.updated == 1) {
            return db.collection('users').where({
              'userID': userID
            }).update({
              data: {
                'mySigns': _.push(obj2)
              }
            }).then(res => {
              console.log(res);
              if (res.stats.updated == 1) 
                operate = 'success';
              else 
                operate = 'fail';
            })
          } else 
            operate = 'fail';         
        })
      }
    })
    return operate;
  } catch (e) {
    console.log(e);
  }
}

function getDistance (lat1, lng1, lat2, lng2) {

  lat1 = lat1 || 0;
  lng1 = lng1 || 0;
  lat2 = lat2 || 0;
  lng2 = lng2 || 0;

  var rad1 = lat1 * Math.PI / 180.0;
  var rad2 = lat2 * Math.PI / 180.0;
  var a = rad1 - rad2;
  var b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0;
  var r = 6378137;
  var distance = r * 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(rad1) * Math.cos(rad2) * Math.pow(Math.sin(b / 2), 2)));

  return distance;
}
