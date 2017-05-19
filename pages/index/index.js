//index.js
var util = require('../../utils/util.js')
//获取应用实例
var app = getApp()
Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    //车型id
    productId:'19359',
    //定义发送请求的url公共域名
    ajaxUrl : 'https://dealer-api.360che.com/inquiryprice/',
    truckInfo:{},
    //经销商数据
    dealerData:[],
    //参数配置信息
    parameterData:{},
    //显示哪个参数配置选项
    parameterIndex:0,
    //推荐经销商
    dealerSelected:[],//https://s.kcimg.cn/wap/images/detail/checked.png
    //选择个人信息保护声明
    statementSelected:true,//https://s.kcimg.cn/wap/images/detail/statement-checked.png
    //地区信息
    locationInfo:{},
    // 最终提交数据
    submitData:{

    },
    errPop:false,
    errText:'',
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onShow:function(options){
    wx.getStorage({
      key:"locationInfo",
      success:(res) => {

        //设置选中地区
        this.setData({
          locationInfo:JSON.parse(res.data)
        })
        //删除缓存
        wx.removeStorage({
          key: 'locationInfo',
        })
        //重新请求经销商数据
        this.getDealer();
      } 
    })
  },
  // 页面初始化
  onLoad: function (options) {

    if(options.productId){
      this.setData({
        productId:options.productId
      })
    }
    // wx.navigateTo({
    //   url: '../location/location'
    // })
    var that = this
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function(userInfo){
      //更新数据
      that.setData({
        userInfo:userInfo
      })
    })
    
    //删除保留的选择地区
    // wx.getStorage({
    //   key:"locationInfo",
    //   success:(res) => {
        //删除缓存
        wx.removeStorage({
          key: 'locationInfo',
        })
    //   } 
    // })

    //请求车型数据
    wx.request({
      url:this.data.ajaxUrl + 'Dealer/getProductInfo.aspx?productid=' + this.data.productId,
      data:{},
      success:(res) => {
        if(res.errMsg == 'request:ok'){
          this.setData({
            truckInfo:res.data
          })
        }
      }
    })

    //请求参数配置信息
    wx.request({
      url:'https://product.360che.com/index.php?r=api/getproparam&id=' + this.data.productId + '&isSem=1',
      data:{},
      success:(res) => {
         
        if(res.errMsg == 'request:ok'){
           console.log(res.data.data[this.data.productId],'res')
          this.setData({
             parameterData:res.data.data[this.data.productId]
          })
        }
      }
    })

    //调取当前所在地区
      //查看之前是否存储过
      wx.getStorage({
        key: 'my_region',
        success: (res) => {
            // 如果存储过
            let data = JSON.parse(res.data);
            let time = new Date().getTime()

            //获取当前时间是否大于之前存储时间的6小时 ？ 重新获取 ： 否则读取缓存数据
            if(((time - data.time)/1000/60/60) > 6){
              this.getLocation();
            }else{
              this.setData({
                locationInfo:data.data
              })
              //请求经销商数据
              this.getDealer();
            }
        },
        fail: () => {
          this.getLocation();
        } 
      })
   
  },
   // 页面渲染完成
  onReady:() => {
    
  },
  //请求经销商数据
  getDealer(provinceId,cityId){
    wx.request({
      url:this.data.ajaxUrl + 'Dealer/getDealerList.aspx?productid=' + this.data.productId + '&provincesn=' + this.data.locationInfo.provincesn + '&citysn=' + this.data.locationInfo.citysn,
      data:{},
      success:(res) => {
        if(res.errMsg == 'request:ok'){
          this.setData({
            dealerData:res.data
          })
          //循环经销商数据，添加选中状态
          let arr = [];
          for(let i = 0; i < this.data.dealerData.length;i++){
            if(i<3){
              arr[i] = this.data.dealerData[i].DealerId;
            }else{
              arr[i] = '';
            }
            
          }
          this.setData({
              dealerSelected:arr
          })
        }
      }
    })
  },
  // 点击推荐经销商
  selectDealer(e){

    let index = e.currentTarget.dataset.index;
    let DealerId = e.currentTarget.dataset.dealerid;

    let arr = this.data.dealerSelected;
    console.log(index,'index')
    if(arr[index] != ''){
      arr[index] = ''
    }else{
        arr[index] = DealerId
        // arr[index] = 'https://s.kcimg.cn/wap/images/detail/checked.png'
    }
    this.setData({
      dealerSelected:arr
    })
    console.log(this.data.dealerSelected)
    // console.log(this.data.dealerData)
  },
  //选择参数配置
  selectParameter(e){
      let index = e.currentTarget.dataset.index;
      this.setData({
        parameterIndex:index,
      })
  },
  //选择个人信息保护声明
  selectStatement(){
    if(this.data.statementSelected){
      this.setData({
        statementSelected:false,
      })
    }else{
      this.setData({
        statementSelected:true,
      })
    }
  },
  getLocation(){
    // 微信获取经纬度
    wx.getLocation({
        type: 'wgs84',
        success: res => {
          
          var latitude = res.latitude;
          var longitude = res.longitude;
          
          // 获取当前位置省市
          wx.request({
            url:this.data.ajaxUrl + '/Dealer/getLocation.aspx',
            data:{},
            success:(res) => {
              if(res.errMsg == 'request:ok'){
                let my_region = {};
                my_region.time = new Date().getTime();
                my_region.data = res.data;
                
                this.setData({
                   locationInfo:res.data
                })
                //请求经销商数据
                this.getDealer();

                //存储定位城市
                wx.setStorage({
                  key:"my_region",
                  data:JSON.stringify(my_region)
                })

                //存储常用定位地区列表
                wx.getStorage({
                  key: 'hotLocation',
                  success: function(res){
                    let data = JSON.parse(res.data);
                    if(data[0].citysn != my_region.data.citysn){
                      data.shift();
                      data.unshift(my_region.data);
                      wx.setStorage({
                        key:"hotLocation",
                        data:JSON.stringify(arr)
                      })
                    }
                  },
                  fail: function() {
                    let arr = [];
                    arr.push(my_region.data)
                    wx.setStorage({
                      key:"hotLocation",
                      data:JSON.stringify(arr)
                    })
                  }
                })
              }
            }
          })
        }
      })
  },
  //跳转到选择地区
  goSelectLocation(){
    wx.setStorage({
      key: 'locationInfo',
      data: JSON.stringify(this.data.locationInfo),
      complete: function() {
        wx.navigateTo({
          url: '../location/location'
        })
      }
    })


  },
  //输入姓名
  importName(e){
    let submitData = this.data.submitData;
    submitData.relname = e.detail.value
    this.setData({
      submitData:submitData
    })
  },
  importPhone(e){
    let submitData = this.data.submitData;
    submitData.tel = e.detail.value
    this.setData({
      submitData:submitData
    })
  },
  //提交最终数据
  submitData(){
    let submitData = this.data.submitData;
    let locationInfo = this.data.locationInfo;
    
    //车型id赋值
    submitData.truckid = this.data.productId;
    
    // 验证姓名
    let name = /[^\u4e00-\u9fa5]/;  
    if(name.test(submitData.relname) || submitData.relname.length > 6 || submitData.relname == ''){
      this.setData({
        errText:'请填写您的姓名(1-6个汉字)',
        errPop:true
      })
      return 
    }  

    // 验证手机号码
    let phone = /0?(13|14|15|17|18)[0-9]{9}/;
    if(!phone.test(submitData.tel) || submitData.tel == ''){ 
      this.setData({
        errText:'请填写正确的手机号码',
        errPop:true
      })
      return
    } 

    //验证省份
    console.log(locationInfo.provincesn)
    if(!locationInfo.provincesn){
      this.setData({
        errText:'请选择省份',
        errPop:true
      })
      return      
    }else{
      submitData.provincesn = locationInfo.provincesn;
    }

    //验证城市
    if(!locationInfo.citysn){
      // this.setData({
      //   errText:'请选择城市',
      //   errPop:true
      // })
      // return      
    }else{
      submitData.citysn = locationInfo.citysn;
    }

    // 验证选择经销商
    if(this.data.dealerSelected.length > 3){
      let number = 0;
      for(let i = 0 ; i < this.data.dealerSelected.length ; i++){
          if(this.data.dealerSelected[i]){
            number++;
          }
      }
      if(this.data.dealerData.length && number == 0){
          this.setData({
          errText:'最选择经销商',
          errPop:true
        })
        return       
      }
      if(number > 3){
        this.setData({
          errText:'最多选择3家经销商',
          errPop:true
        })
        return 
      }
    }else{
      submitData.shopstr = this.data.dealerSelected.join(',');
    }
    
    //判断个人信息保护声明
    if(!this.data.statementSelected){
      this.setData({
        errText:'请勾选《个人信息保护声明》后再提交您的询价信息',
        errPop:true
      })
      return  
    }

    //线索来源
    submitData.clueresource = 23;//小程序
    //加载中
    this.showLoading();

    wx.request({
      url:this.data.ajaxUrl + 'Dealer/submitClues.aspx?',
      data:submitData,
      success:(res) => {

        //隐藏加载
        this.cancelLoading()
        if(res.errMsg == 'request:ok'){
          if(res.data.isok == 1){
            wx.navigateTo({
              url: '../success/success?submitData=' + JSON.stringify(submitData)
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
    console.log(submitData)

  },
  //关闭报错弹层
  closeErrPop(){
    this.setData({
      errPop:false,
      errText:'',
    })
  },
  //跳转到个人信息声明保护页
  goStatement(){
    wx.navigateTo({
      url: '../statement/statement'
    })
  },
  showLoading:function(){
     wx.showToast({
      title: '加载中',
      icon: 'loading'
     });
  },
  cancelLoading:function(){
     wx.hideToast();
  },
})