
App({
  onLaunch: function () {
    //云开发环境初始化
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        env: 'lectureassistant-ug1tm',
        traceUser: true,
      })
    }
  },

  getTime: function () {
    var today = new Date();
    var year = today.getFullYear();
    var month = today.getMonth() + 1;
    var day = today.getDate();
    var hour = today.getHours();
    var minute = today.getMinutes();
    var second = today.getSeconds();

    if (month < 10)
      month = '0' + month;
    if (day < 10)
      day = '0' + day;
    if (hour < 10)
      hour = '0' + hour;
    if (minute < 10)
      minute = '0' + minute;
    if (second < 10)
      second = '0' + second;


    return year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
  },

  //全局变量
  globalData: {
    userInfo: null,
    userID: '',   //使用者账号
    openid: '',   //使用者openid
    password: '',  //密码
    NickName: '',  //使用者昵称
    identify: '',  //使用者身份
    appid: 'wxe12260b013a87043',
    secret: 'bcf80248a9981edea590965d47c397d9',
  },

  //生成唯一ID
  guid: function () {
    function S4() {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }
    return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
  }
})

