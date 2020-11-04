<template>
  <div>
    <div class="searchInput">
      <div class="queryContainer sn-f-cb" style="width:96%">
        <div class="serviceTitle">我的服务</div>
        <div class="addService">
          <div class="main-search">
            <input type="text" id="serviceInput" v-model.trim="params.appKey" v-my-focus/>
            <span class="search" @click="getSearchData()" v-on:keyup.enter="getSearchData()"></span>
          </div>
          <!--<button class="op-btn op-btn-blue p-ab">新增服务</button>-->
          <h1 @click="goModal()">(使用mixin):当前计数器为：{{num}}</h1>
        </div>
      </div>
    </div>
    <div v-show="showList">
      <div class="reportContainer">
        <table class="reportTable">
          <thead>
          <tr>
            <th>AppKey</th>
            <th>描述</th>
            <th>容灾等级</th>
            <th>服务器数</th>
            <th>服务等级</th>
            <th>服务状态</th>
            <th>服务负责人</th>
            <th>测试负责人</th>
            <th>运维负责人</th>
            <th>上线时间</th>
            <th>操作</th>
          </tr>
          </thead>
          <tr v-if="(dataList.length == 0 && !inRequest)">
            <td colspan="100">暂无数据</td>
          </tr>
          <tr v-else-if="inRequest">
            <td colspan="100" class="locdingImg" style="text-align:left;text-indent:28px;">
              <img :src="loading" />
            </td>
          </tr>
          <tbody v-else>
          <template v-for="(listItem,index) in dataList">
            <tr :key="index">
              <td class="aFontColor" @click="goDetail(listItem.appKey)">{{ listItem.appKey || '' }}</td>
              <td><p class="omitStyle" :title="listItem.desc">{{ listItem.desc || '' }}</p></td>
              <td><span  :class="{'levelStyle': listItem.disasterRecoveryLevel }">{{ listItem.disasterRecoveryLevel || '-' }}</span></td>
              <td>{{ listItem.serverCount || '-' }}</td>
              <td><span class="serviceLevelStyle">{{listItem.serviceLevel == 1 ? '核心服务':'基础服务'}}</span></td>
              <td :class="[listItem.serviceStatus == 1? 'nodeStatusStyle':(listItem.serviceStatus == 2?'nodeYellow':'nodeRed')]">{{ listItem.serviceStatus == 1?'健康':(listItem.serviceStatus == 2 ?'可用':'不可用') }}</td>
              <td>
                <p class="omitStyle" :title="listItem.mainPersion"> {{ listItem.mainPersion || '-' }}</p>
              </td>
              <td>
                <p class="omitStyle" :title="listItem.qaPersion">{{ listItem.qaPersion || '-' }}</p>
              </td>
              <td>
                <p class="omitStyle" :title="listItem.opsPerson">{{ listItem.opsPerson || '-' }}</p>
              </td>
              <td>{{ checkTime(listItem.lastUpdateDate)}}</td>
              <td><a class="aFontColor"  @click="goDetail(listItem.appKey)">详情</a></td>
            </tr>
          </template>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
  import {fetchList} from '@/api/product';
  import {timestamp} from '@/utils/date';
  import {myMixin} from "../../mixin"; //引入mixin对象；

  export default {
    name: "index",
    mixins : [myMixin],
    data() {
      return {
        dataList: [],
        params: {
          appKey: "",
        },
        showList : true,
        inRequest: false, //是否正在请求，用于显示正在请求的动画
        loading: require("@/assets/images/loading.gif"),
        requestStatue: false,
      };
    },
    mounted: function() {
      var _this = this;
      //按下enter按键时候
      document.onkeydown = function(e){
        let key = window.event.keyCode;
        if (key == 13){
          _this.getSearchData()
        }
      }
    },
    methods: {
      checkTime(date){
        return timestamp(date);
      },
      getSearchParams: function() {
        return this.params;
      },
      /* 获取列表数据 */
      getSearchData: function() {
        var params = this.getSearchParams();
        this.listLoading = true;
        this.inRequest = !this.inRequest;
        fetchList(params).then(response => {
          this.inRequest = !this.inRequest;
          this.listLoading = false;
          this.showList = true;
          this.dataList = response.extra;
        });
      },
      //跳转到详情页面
      goDetail(appKey){
        this.$router.push({path:'/pms/serviceDetail',query:{appKey:appKey}})
      },
      goModal(){
        console.log(this.$router);
        this.$router.push({path:'/other/otherListInfo'})
        // this.$router.push({path:'/pms/serviceList'})
      },
      /* 清空搜索结果，
         有些场景需要清空结果，比如获取请求之前或过去数据请求失败
          */
      clearResult: function() {
        this.dataList = [];
      },
    },
  };
</script>

<style lang="scss"  scoped>
  /*搜索部分*/
  .serviceTitle{
    font-size : 16px;
    margin-bottom:10px;
  }
  #serviceInput{
    width:270px ;
    height:34px  ;
    line-height :34px ;
    border:none;
    font-size:16px;
    color: #555;
  }
  .search{
    position: absolute;
    left:280px;
    top:10px;
    cursor: pointer;
    display:inline-block;
    width:25px;
    height:20px;
    background:url("../../assets/images/ht_icon.png") no-repeat  -168px 0;
  }

  .addService{
    position: relative;
  }
  .main-search{
    width:310px;
    height:40px;
    border: 1px solid #cdd0d1;
    padding: 3px 20px 3px 8px;
    background: #fff;
  }
  #serviceInput:focus.main-search{
    border: 1px solid #000;
  }
  .p-ab{
    position: absolute;
    right:0;
    margin-right:0;
  }

  .omitStyle{
    width:80px;
    overflow: hidden;
    white-space: nowrap;
    -ms-text-overflow: ellipsis;
    text-overflow: ellipsis;
    padding-left : 8px;
  }
  /*容灾等级样式*/
  .levelStyle{
    display: inline-block;
    width:16px;
    height : 16px;
    border: 1px solid #8E99BE;
    color:#8E99BE;
    background: #eee;
  }
  /*服务等级样式*/
  .serviceLevelStyle{
    display: inline-block;
    width:max-content;
    padding:0 5px;
    height : 20px;
    line-height:20px;
    border: 1px solid #76C98D;
    color:#76C98D;
  }
  #commit_yy {
    width: 100%;
    height: 100%;
    background: #000;
    opacity: 0.5;
    filter: alpha(opacity=50);
    position: fixed;
    top: 0;
    left: 0;
    z-index: 220;
    display: block;
  }
  #commit_title {
    width: 270px;
    height: 50px;
    line-height: 50px;
    text-align: center;
    position: fixed;
    top: 50%;
    left: 50%;
    z-index: 230;
    background: #fff;
    display: block;
    box-shadow: 0px 0px 5px 1px #000;
    margin: -30px 0px 0px -135px;
    border-radius: 3px;
    font-size: 18px;
  }
  .aFontColor{
    color : #5dacf0;
    cursor: pointer;
  }
  .nodeStatusStyle{
    color:#76C98D;
  }
  .nodeYellow{
    color:#eac100;
  }
  .nodeRed{
    color:red;
  }
</style>
