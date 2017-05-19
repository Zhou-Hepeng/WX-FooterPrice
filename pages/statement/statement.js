// pages/statement/statement.js
Page({
  data:{},
  onLoad:function(options){
        wx.setNavigationBarTitle({
          title: '个人信息保护声明'
        })
    // 页面初始化 options为页面跳转所带来的参数
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  },
  //打电话
  dial(e){
    wx.makePhoneCall({
      phoneNumber: e.target.dataset.phone
    })
  }
})