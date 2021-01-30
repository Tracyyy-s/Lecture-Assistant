const app = getApp();
const db = wx.cloud.database();

Page({
  data: {
    value: "", // 文本的内容
    placeholder: "填写您的意见！",
    maxlength: 150, // 最大输入长度，设置为 -1 的时候不限制最大长度
    showModel: false,
    content: ''
  },
  
  onLoad: function () {
    wx.setNavigationBarTitle({ title: "建议或反馈" })
  },

  /**
   * 获取意见
   */
  contentInput: function (e) {
    var value = e.detail.value;
    var len = parseInt(value.length);

    //最多字数限制
    if (len > this.data.maxlength) return;
    this.setData({
      currentWordNumber: len, //当前字数  
      content: e.detail.value.trim()

    });
    console.log(this.data.content);
  },

  /**
   * 弹窗
   */
  showDialogBtn: function () {
    this.setData({
      showModal: true
    })
  },
  /**
   * 弹出框蒙层截断touchmove事件
   */
  preventTouchMove: function () {
  },
  /**
   * 隐藏模态对话框
   */
  hideModal: function () {
    this.setData({
      showModal: false
    });
  },
  /**
   * 对话框取消按钮点击事件
   */
  onCancel: function () {
    this.hideModal();
  },
  /**
   * 对话框确认按钮点击事件
   */
  onConfirm: function () {
    var that = this;
    that.hideModal();
    console.log(that.data.content);
    if (that.data.content == '') {
      wx.showModal({
        title: '反馈失败',
        content: '反馈意见不能为空！',
      })
    } else if (that.data.content.length < 5) {
      wx.showModal({
        title: '反馈失败',
        content: '反馈意见不能少于十个字！',
      })
    } else {
      wx.showLoading({
        title: '正在发表...',
        icon: 'loading',
      })
      db.collection('suggestions').add({
        data: {
          userID: app.globalData.userID,
          content: that.data.content,
          date: new Date()
        },
        success: res => {
          wx.hideLoading();
          wx.showToast({
            title: '反馈成功！',
            icon: 'success',
          })
          that.setData({
            value: '',
            currentWordNumber: 0
          });
        }
      })
    }
  },

  datePickerBindchange: function (e) {
    this.setData({
      dateValue: e.detail.value,
    })
  }
});