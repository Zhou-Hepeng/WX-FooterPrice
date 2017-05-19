// pages/location/location.js
Page({
  data:{
    //定义发送请求的url公共域名
    ajaxUrl : 'https://dealer-api.360che.com/inquiryprice/',
    //导航列表
    indexNav:[],
    //定位常用地区
    hotLocation:[],
    //地区列表
    locationList:[],
    //城市列表
    cityList:[],
    //是否显示城市列表
    cityListPop:false,
    // 选择的地区信息
    locationInfo:{},
    //选中的nav
    navInfo:"",
    //显示选中的nav
    navInfoShow:false,
    //搜索结果列表数据
    searchResultData:[],
    searchResultPop:false,
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数

    wx.setNavigationBarTitle({
      title: '选择地区'
    })

    wx.getStorage({
      key: 'locationInfo',
      success: (res) => {
       this.setData({
         locationInfo:JSON.parse(res.data)
       })
       console.log(this.data.locationInfo,'locationInfolocationInfolocationInfolocationInfo')
      }
    })
    
    
    this.showLoading();
    // 判断有没有缓存省份数据 ？ 直接读取缓存 ： 发送请求，请求省份数据
    wx.getStorage({
      key: 'provinceData',
      success: (res) => {
         this.cancelLoading();
        let data = JSON.parse(res.data)
         //设置省份和indexNav数据
        this.setData({
          indexNav:data.indexNav,
          locationList:data.list
        })
      },
      //如果没有数据，那么发送请求
      fail: () => {
        //请求省份数据
        wx.request({
          url:this.data.ajaxUrl + 'Dealer/getProvinceListAZ.aspx',
          data:{},
          success:(res) => {
            if(res.errMsg == 'request:ok'){
              this.cancelLoading();
              
              //设置省份和indexNav数据
              this.setData({
                indexNav:res.data.indexNav,
                locationList:res.data.list
              })
              //缓存省份的数据
              wx.setStorage({
                key:"provinceData",
                data:JSON.stringify(res.data)
              })
            }
          }
        })
      }
    })
    //查看有没有常用地区
    wx.getStorage({
      key: 'hotLocation',
      success: (res) => {
        this.setData({
          hotLocation:JSON.parse(res.data)
        })
        console.log(this.data.hotLocation,'hotLocationhotLocationhotLocationhotLocation')
      }
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
  //触摸导航列表
  indexNav(e){
    // console.log(e)
    console.log(e.target.dataset.index)
    this.setData({
      navInfo:e.target.dataset.index,
      navInfoShow:true
    })
    let time = setTimeout(() => {
      clearTimeout(time)
       this.setData({
          navInfoShow:false
        })
    },500)
  },
  //搜索框获取焦点
  searching(){
    this.setData({
      searchResultPop:true
    })
  },
  //输入搜素内容，
  searchResult(e){
    console.log(e.detail.value)
    wx.request({
      url:'https://product.360che.com/index.php?r=weex/series/get-search-region&value=' + e.detail.value,
      success:(res) => {
        if(res.errMsg == 'request:ok' && res.data.info == 'ok'){
          console.log(res.data,'res.data')
          this.setData({
           searchResultData:res.data.data,
          })
          console.log(this.data.searchResultData,'searchResultDatasearchResultData')
        }
      }
    })
  },
  //选择省份，请求城市列表
  selectProvince(e){

    let locationInfo = e.currentTarget.dataset;
    locationInfo.cityname = '';
    locationInfo.citysn = '';
    //设置选中地区信息
    this.setData({
      locationInfo:locationInfo
    })
    //存储已选择的城市
    wx.setStorage({
      key:"locationInfo",
      data:JSON.stringify(this.data.locationInfo)
    })

    wx.request({
      url:this.data.ajaxUrl + 'Dealer/getCityList.aspx?provincesn=' + this.data.locationInfo.provincesn,
      success:(res) => {
        if(res.errMsg == 'request:ok'){
          //给城市列表赋值  显示城市列表
          this.setData({
            cityList:res.data,
            cityListPop:true
          })
        }
      }
    })
    console.log(this.data.locationInfo)
  },
  //选择城市弹窗
  selectCity(e){
    let locationInfo = this.data.locationInfo;
    locationInfo.cityname = e.currentTarget.dataset.cityname;
    locationInfo.citysn = e.currentTarget.dataset.citysn;
    this.setData({
      locationInfo:locationInfo,
      cityListPop:false
    })
    //存储已选择的城市
    wx.setStorage({
      key:"locationInfo",
      data:JSON.stringify(this.data.locationInfo)
    })
    //存储常用地区
    this.storageLocation();

    //返回询底价页面
    wx.navigateBack()
  },
  //点击搜素结果列表或者定位地区
  speedySelectLocation(e){
    //赋值
    this.setData({
      locationInfo:e.currentTarget.dataset,
    })
    console.log(this.data.locationInfo,'点击搜素结果列表或者定位地区')
    //存储已选择的城市
    wx.setStorage({
      key:"locationInfo",
      data:JSON.stringify(this.data.locationInfo)
    })
    //返回询底价页面
    wx.navigateBack()
  },
  //隐藏选择城市列表弹层
  cityPopHide(){
    this.setData({
      cityListPop:false
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
  //存储常用地区
  storageLocation(){
    wx.getStorage({
      key: 'hotLocation',
      success: (res) => {
        let data = JSON.parse(res.data);
        let ishave = true;
        for(let i = 0 ; i < data.length ; i++){
            if(data[i].citysn == this.data.locationInfo.citysn && ishave){
                ishave = false;
            }
        }
        if(ishave){
          if(data.length >= 6){
            data.splice(1,1);
          }
          data.push(this.data.locationInfo)
          wx.setStorage({
            key: 'hotLocation',
            data: JSON.stringify(data),
          })
        }
      },
      //如果没有地区存储
      fail: () => {
        let arr = [];
        arr.push(this.data.locationInfo)
        wx.setStorage({
          key: 'hotLocation',
          data: JSON.stringify(arr),
        })
      },
    })
  }
})