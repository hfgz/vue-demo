<template>
  <div>
    <div class="adjustTypeContainer">
      <p><span class="appKeyTitle">{{appKey}}</span></p>
      <div class="adjustTypeItem">
        <span v-for="(item,index) in titles"
            @click="activeClick(index)"
            :class="{active:currentIndex === index}">{{item}}</span>
      </div>
      <p class="clear"></p>
    </div>
    <div class="operateContainer">
    <div class="operate-ul sn-f-cb">
      <div class="titleLeft">
        <label for="all">
          <input type="radio" name="statusType" id="all" v-model="nodeType" value="" @click="switchNodeData('')">
          全部<span>&nbsp;&nbsp;<span class="iconFontColor">{{this.allCount}}</span></span>
        </label>
        <label for="unStart">
          <input type="radio" name="statusType" id="unStart" v-model="nodeType" value="1" @click="switchNodeData(1)">
          启用<span>&nbsp;&nbsp;<span class="iconFontColor">{{this.openCount}}</span></span>
        </label>
        <label for="forbidden">
          <input type="radio" name="statusType" id="forbidden" v-model="nodeType" value="0" @click="switchNodeData(0)">
          禁用<span>&nbsp;&nbsp;<span class="iconFontColor">{{this.closeCount}}</span></span>
        </label>
      </div>
      <div class="titleRight">
        <span @click="nodeEnable(1)">节点启用</span>
        <span class="disabledStyle" @click="nodeEnable(2)">节点禁用</span>
        <span @click="batchAdjust(1)">权重调整</span>
      </div>
    </div>
    </div>
    <div class="reportContainer">
      <table class="reportTable">
        <thead>
          <tr>
            <th>
             <span class="btn-checkbox"
                   :class="{'select':selectList.length > 0 && dataList.length == selectList.length}"
                   @click="selectAllItem()"></span>
            </th>
            <th>节点名称</th>
            <th>IP</th>
            <th>节点状态</th>
            <th>类型</th>
            <th>端口</th>
            <th>权重</th>
            <th>机房</th>
            <th>泳道</th>
            <th>set</th>
            <th>http分组</th>
            <th>最后更新时间</th>
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
              <td>
                <span class="btn-checkbox"
                      :class="{'select':selectList.indexOf(listItem.ipAndPort)>-1}"
                      @click="selectItem(listItem.ipAndPort)"></span>
              </td>
              <td class="aFontColor">{{ listItem.nodeName || '' }}</td>
              <td><p class="omitStyle" :title="listItem.ip">{{ listItem.ip || '' }}</p></td>
              <td :class="[listItem.status == 2 ?'nodeStatusStyle':(listItem.status == 0)? 'nodeRed':'nodeYellow' ]">{{ listItem.status | getStatus }}</td>
              <td><span class="serviceTypeStyle">{{ listItem.type}}</span></td>
              <td class="aFontColor">{{ listItem.port || '' }}</td>
              <td>{{ listItem.weight || '' }}</td>
              <td>{{ listItem.machineRoom || '-' }}</td>
              <td>{{listItem.lane || '-'}}</td>
              <td>{{listItem.set || '-'}}</td>
              <td>{{listItem.httpGroup || '-'}}</td>
              <td>{{ checkTime(listItem.lastUpdateTime)}}</td>
              <td>
                <a class="iconFontColor" :class="{'nodeRed':listItem.open == 1}" @click="openOrClose(listItem.open,listItem)">{{listItem.open == 1 ? '禁用':'启用'}}&nbsp;&nbsp;</a>
                <a class="iconFontColor" @click="batchAdjust(2,listItem)">权重调整&nbsp;&nbsp;</a>
                <a class="iconFontColor" @click="deleteService(listItem)">删除</a>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
      <!--批量权重调整弹框-->
      <BatchWeightAdjust ref="batchWeightAdjustRef"></BatchWeightAdjust>
    </div>
  </div>
</template>

<script>
import bus from "../../eventBus.js";
import {getServiceDetail,deleteService,nodeEnableRequest,changeWeightRequest} from '@/api/product';
import BatchWeightAdjust from "./BatchWeightAdjust";
import { Loading } from 'element-ui';
import {timestamp} from '@/utils/date';

export default {
  name: "serviceDetail",
    components:{
        BatchWeightAdjust
    },
    data: function() {
      return {
          dataList: [],
          rsDataList: [],
          params: {
              env: 1,
              nodeStatus : "",
              appKey : ""
        },
          inRequest: false, //是否正在请求，用于显示正在请求的动画
          loading: require("@/assets/images/loading.gif"),
          currentIndex : 0,
          titles : ["prod","staging","ppe","test","dev"],
          env : 1,  //1：prod 2：staging 3：ppe  4：test  5：dev
          selectList : [],
          unStart : 0,
          forbidden : 0,
          nodeType : "" , //0:全部 1：启动 0：禁用
          closeCount : 0,
          openCount : 0,
          allCount : 0,
          appKey:""
      };
  },
    mounted(){
      var _this = this;
      this.appKey = this.$route.query.appKey;
      this.getSearchData();
        bus.$on("batchWeightData",function(data,boxType){
            _this.batchWeightRequest(data,boxType);
        });
    },
    filters:{
        getStatus(value){
            var nodeStatusList = {
                0 : '宕机',
                2 : "存活",
                4 : "停止",
            };
            return nodeStatusList[value] || "";
        }
    },
  methods: {
    checkTime(date){
      return timestamp(date);
    },
      //tab切换
      activeClick(index){
          this.currentIndex = index;
          this.env = index + 1;
          this.getSearchData();
      },
      //不同类型切换
      switchNodeData(type){
          this.nodeType = type;
          this.getSearchData();
      },
      //获取列表请求参数
      getSearchParams: function() {
          return{
              env : this.env,
              nodeStatus : this.nodeType,
              appKey :this.appKey ,
          }
      },
      /* 获取列表数据 */
      getSearchData: function() {
        var params = this.getSearchParams();
        this.inRequest = !this.inRequest;
        getServiceDetail(params).then(response => {
          this.inRequest = !this.inRequest;
          this.dataList = response.extra.nodeList;
          this.closeCount = response.extra.closeCount;
          this.openCount = response.extra.openCount;
          this.allCount = response.extra.allCount;
        });
    },
      /* 选取每一项 */
      selectItem(ipAndPort) {
          var currIndex = this.selectList.indexOf(ipAndPort);
          if (currIndex > -1) {
              this.selectList.splice(currIndex, 1);
          } else {
              this.selectList.push(ipAndPort);
          }
      },

      /* 全选所有项 */
      selectAllItem() {
          if (this.dataList.length > 0 && this.dataList.length == this.selectList.length) {
              this.selectList = [];
          } else if (this.dataList.length > 0 && this.dataList.length != this.selectList.length) {
              var tempList = [];
              this.dataList.some((item) => {
                  tempList.push(item.ipAndPort);
              });
              this.selectList = tempList;
          }
      },
      //批量节点启用/禁用
      nodeEnable(type){
          var _this = this;
          var typeStr = type == 1 ? "启用" : "禁用";
          if (this.selectList.length == 0) {
            this.$message({
              message: "请选择需要"+typeStr+"的数据项",
              showClose: true,
              type: 'error'
              });
              return;
          }
          var params = {
              appKey : this.appKey ,
              nodeList : this.getNodeList(),
              open : type == 1 ? 1 : 0
          };
          //发送启用/禁用数据请求
        this.$confirm('确定'+typeStr+'这些数据吗?', '确定'+typeStr, {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'error'
        }).then(() => {
          _this.nodeEnableRequest(type, params);
        }).catch(()=>{
          this.$message({
            type: 'info',
            message: '已取消'+typeStr
          });
        });
      },
      //当前节点启用/禁用
      openOrClose(type,data){
          var _this = this;
          var params = {
              appKey : this.appKey ,
              nodeList : [{ipAndPort : data.ipAndPort}],
              open : type === 0 ? 1 : 0
          };
          var str = type === 0 ? '启用': '禁用';
        this.$confirm('确定'+str+'这些数据吗?', '确定'+str, {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'error'
        }).then(() => {
          _this.nodeEnableRequest(type, params);
        }).catch(()=>{
          this.$message({
            type: 'info',
            message: '已取消'+str
          });
        })
        ;
      },
      nodeEnableRequest(type,nodeList){
        nodeEnableRequest(nodeList).then(response => {
          this.$message({
            message:  type == 1 ? "节点启用操作成功" : "节点禁用操作成功" ,
            type: 'success',
            duration: 1000
          });
          this.getSearchData();
        });
      },
      batchAdjust(type,data){
          if (type == 1){
              if (this.selectList.length == 0) {
                this.$message({
                  message: "请选择需要权重调整的数据项",
                  showClose: true,
                  type: 'error'
                });
                return;
              }
          }
          this.$refs.batchWeightAdjustRef.show(type,data);
      },
      batchWeightRequest(params,boxType){
          if (boxType == 1){
              params.nodeList = this.getNodeList();
          }
          params.appKey = this.appKey;
        let loadingInstance = Loading.service(params);
        changeWeightRequest(params).then(response => {
          this.$nextTick(() => { // 以服务的方式调用的 Loading 需要异步关闭
            loadingInstance.close();
          });
          this.$message({
            message: boxType == 1 ? "批量权重调整操作成功" : "权重调整操作成功",
            duration: 1000
          });
          this.$refs.batchWeightAdjustRef.showBox = false;
          this.getSearchData();
        }).catch(()=>{
          this.$nextTick(() => { // 以服务的方式调用的 Loading 需要异步关闭
            loadingInstance.close();
          });
        });
      },
      getNodeList(){
          var arrList = [];
          this.selectList.map((value,index)=>{
              var obj = {
                  ipAndPort : value,
              };
              arrList.push(obj);
          });
          return arrList
      },
      //删除前的确认
      deleteService(data){
          var _this = this;
        this.$confirm('是否要进行删除操作?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          _this.deleteRequest(data);
        }).catch(()=>{
          this.$message({
            type: 'info',
            message: '已取消删除'
          });
        });
      },
      //删除请求
      deleteRequest(data){
          var param = {
              appKey : this.appKey,
              ipAndPort : data.ipAndPort
          };
          var _this = this;
        let loadingInstance = Loading.service(param);
        deleteService(param).then(response => {
          this.$nextTick(() => { // 以服务的方式调用的 Loading 需要异步关闭
            loadingInstance.close();
          });
          this.$message({
            message: '删除成功',
            type: 'success',
            duration: 1000
          },(e)=>{
            _this.getSearchData();
          });
        }).catch(()=>{
          this.$nextTick(() => { // 以服务的方式调用的 Loading 需要异步关闭
            loadingInstance.close();
          });
        })
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
  .adjustTypeContainer{
    width:96%;
    margin:0 auto;
    min-width: 900px;
    padding: 20px 0;
    .adjustTypeItem{
      margin: 10px auto;
      height:40px;
      line-height: 40px;
      span{
        display: inline-block;
        width: 76px;
        text-align: center;
        cursor: pointer;
        background: #fff;
        border: 1px solid #ddd;
        height:32px;
        line-height: 31px;
        font-size : 15px;
      }
    }
  }
  .adjustTypeItem span:nth-child(even){
    border:none;
    border-top:1px solid #ddd;
    border-bottom:1px solid #ddd;
  }
  .active{
    background: #5dacf0 !important;
    border-color: #5dacf0 !important;
    color:#fff;
  }
  .appKeyTitle{font-size:16px;}
  .omitStyle{
    width:80px;
    overflow: hidden;
    white-space: nowrap;
    -ms-text-overflow: ellipsis;
    text-overflow: ellipsis;
    padding-left : 8px;
  }
  .nodeStatusStyle{
    color:#76C98D;
  }
  .nodeYellow{
    color:#eac100;
  }
  .nodeRed{
    color:red !important;
  }
  /*等级样式*/
  .serviceTypeStyle{
    display: inline-block;
    width:max-content;
    padding: 0 5px;
    height : 20px;
    line-height:16px;
    border: 1px solid #76C98D;
    color:#76C98D;
  }
  .aFontColor{
    color : #0D7AF0;
    /*cursor: pointer;*/
  }

  /*table表格上面的*/
.titleLeft{
  float: left;
  font-size : 14px;
}
.titleLeft>label{
  margin-right:30px;
  cursor: pointer;

}
.iconFontColor{
  color : #5dacf0;
  text-decoration: none;
  cursor: pointer;
}
  .titleRight{
    float: right;
    font-size : 14px;
    cursor: pointer;
    color : #7B85A6;
  }
  .titleRight .disabledStyle{
    margin: 0 30px;
  }

</style>
