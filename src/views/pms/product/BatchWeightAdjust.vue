<template>
    <div class="addOrUpdata" v-show="showBox">
        <div class="window-box-contailner">
            <div class="header">
                <span class="insert-title">{{windowTitle}}</span>
                <span class="insert-close-icon" @click="cancelHandle">×</span>
            </div>
            <ul class="window-box-content">
                <li class="li-item">
                    <span>权重：</span>
                    <input type="text" v-model.trim="weight" class="sn-input-box"
                           :class="{'errorInout': isSubmit && !checkWeight(weight) }">
                </li>
            </ul>
            <div class="footer">
                <button class="queryBtn" @click="saveHandle">保存</button>
                <button class="clearBtn" @click="cancelHandle">取消</button>
            </div>
        </div>
    </div>
</template>

<script>
    import bus from "../../eventBus.js";
    export default {
        name : 'BatchWeightAdjust',
        data : function(){
            return{
                boxType : 1,	//是添加还是修改弹窗，1：批量权重调整; 2 单个权重调整
                ipAndPort : "",
                weight : "",
                showBox : false,
                isSubmit : false, //是否提交过
            };
        },
        computed : {
            windowTitle : function(){
                var boxType = this.boxType,
                    title = "";
                switch(boxType) {
                    case 1:
                        title = "批量权重调整";
                        break;
                    case 2:
                        title = "权重调整";
                        break;
                }
                return title;
            }
        },
        methods : {
            saveHandle : function (){
                this.isSubmit = !this.isSubmit;
                var params = {
                    weight : this.weight,
                };
                if (this.boxType !== 1 ){
                    params.nodeList = [{ipAndPort : this.ipAndPort}];
                }
                var verifyResult = this.verifyRequestParams(params);
                if(verifyResult.code != 0){
                    CallWeakHint(verifyResult.msg,"btn-error");
                    return;
                }
                bus.$emit("batchWeightData",params,this.boxType);
            },
            verifyRequestParams(params){
                var _this = this;
                // 校验 供应商代码
                if(!_this.checkDispatch("weight", params.weight)){
                    return {
                        code : 1,
                        msg : "只支持大于0的整数，请检查输入",
                    };
                }
                return {
                    code : 0
                }
            },
            checkDispatch(name,value){
                var result = true;
                switch(name){
                    case "weight":
                        result = this.checkWeight(value);
                        break;
                    default :
                        break;
                }
                return result;
            },
            cancelHandle : function (){
                this.showBox = false;
            },
            show(boxType,data){
                this.showBox = true;
                this.boxType = boxType;
                if (data){
                    this.weight = data.weight;
                    this.ipAndPort = data.ipAndPort;
                } else{
                    this.weight = "";
                }
            },
            //校验权重  大于0的整数
            checkWeight :function(value){
                if(/^\+?[1-9]\d*$/.test(value)){
                    return true;
                }
                return false;
            },
        },
    };
</script>

<style lang="scss"  scoped>
    .addOrUpdata{position: fixed;top: 0px;left: 0px;width: 100%;height: 100%;background-color: rgba(0,0,0,0.6);overflow:scroll;}
    .window-box-contailner{width: 450px;background:#fff;margin:100px auto;overflow: hidden;}
    /*头部*/
    .header{height:40px;line-height:40px;padding:0 20px;box-sizing:border-box;font-size:15px;background-color: #f5f5f5}
    .header .insert-close-icon{float: right;cursor: pointer;font-size:20px;}
    .header .insert-close-icon:hover{color:#f00;}
    /*内容*/
    .window-box-content{padding:20px;box-sizing:border-box;}
    .window-box-content li{margin-bottom: 20px;}
    .window-box-content>li>span{width: 30%;text-align: right;display: inline-block;}
    .window-box-content .li-item input[type="text"]:focus{border:1px solid #62e6ff;}
    .li-item{margin: 5px 0;width: 100%;}
    .errorInout{border:1px solid red;}
    /*尾部*/
    .footer{position:relative;bottom:0;height:50px;text-align: center;padding-top: 8px;box-sizing: border-box;border-top: 1px solid #eee}
</style>
