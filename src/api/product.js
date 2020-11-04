import request from '@/utils/request'
export function fetchList(params) {
  return request({
    url:'/service/query',
    method:'get',
    params:params
  })
}
export function getServiceDetail(params) {
  return request({
    url:'/node/detail',
    method:'get',
    params : params
  });
}

//删除请求
export function deleteService(params) {
  return request({
    url:'/node/delete',
    method:'get',
    params:params
  })
}

//批量启用和禁用
export function nodeEnableRequest(params) {
  return request({
    url : '/node/openOrClose',
    headers :{
      "content-type": "application/json",
    },
    method : 'post',
    data : JSON.stringify(params)
  })
}
//权重调整接口
export function changeWeightRequest(params) {
  return request({
    url : '/node/changeWeight',
    headers :{
      "content-type": "application/json",
    },
    method : 'post',
    data : JSON.stringify(params)
  })
}
