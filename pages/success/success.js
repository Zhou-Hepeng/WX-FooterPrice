// pages/success/success.js
Page({
  data:{
    //总数据
    submitData:{},
    //经销商列表
    modelList:[],
    //定义当前的经销商列表
    modelIndex:0,
  },
  onLoad:function(options){
        wx.setNavigationBarTitle({
          title: '询价成功'
        })

    // 页面初始化 options为页面跳转所带来的参数
    let submitData;
    if(options.submitData){
      submitData = JSON.parse(options.submitData)
      this.setData({
        submitData:submitData
      })
    }
    console.log(submitData,'submitDatasubmitData')
    //请求经销商
    wx.request({
      url:'https://product.360che.com/index.php?r=api/getcompeteproduct&productId=' + submitData.truckid,
      data:{},
      success:(res) => {
        if(res.errMsg == 'request:ok'){
          this.setData({
            modelList:res.data.data
          })
          console.log(this.data.modelList)
        }
      }
    });

  },
  //快速询价
  goFooterPrice(e){
    let productId = e.currentTarget.dataset.productid;
    let index = e.currentTarget.dataset.index;
    let submitData = this.data.submitData;
    
    this.showLoading()

    submitData.truckid = productId

    wx.request({
      url:'http://api.dealer.360che.com/inquiryprice/Dealer/submitClues.aspx?',
      data:submitData,
      success:(res) => {
       
        //隐藏加载
        this.cancelLoading()

        if(res.errMsg == 'request:ok'){
          if(res.data.isok == 1){
             let modelList = this.data.modelList;
             modelList[this.data.modelIndex][index].text = '询价成功';
             this.setData({
               modelList:modelList
             })
          }else{
            if(res.data.error == 1){
               this.setData({
                  errText:'姓名错误',
                  errPop:true
                })
            }else if(res.data.error == 2){
                this.setData({
                  errText:'手机号错误',
                  errPop:true
                })
            }else if(res.data.error == 3){
                this.setData({
                  errText:'提车地区错误',
                  errPop:true
                })
            }else if(res.data.error == 6){
                this.setData({
                  errText:'同一手机号，对同一款车型，在3天内重复提交',
                  errPop:true
                })
            }else if(res.data.error == 8){
                this.setData({
                  errText:'车型为空或者车型无效',
                  errPop:true
                })
            }else if(res.data.error == 8){
                this.setData({
                  errText:'车型为空或者车型无效',
                  errPop:true
                })
            }else if(res.data.error == 9){
                this.setData({
                  errText:'网络错误',
                  errPop:true
                })
            }
          }
        }else{
          this.setData({
            errText:'网络错误',
            errPop:true
          })
        }
        console.log(res,'最终提交')
      }
    })
  },
  // 换一批
  switchover(){
    let number = this.data.modelIndex;
    number++;
    if(number >= this.data.modelList.length){
      number = 0;
    }
    this.setData({
      modelIndex:number
    })
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
  showLoading:function(){
     wx.showToast({
      title: '询价中...',
      icon: 'loading'
     });
  },
  cancelLoading:function(){
     wx.hideToast();
  },
})