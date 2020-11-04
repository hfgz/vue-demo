import request from '@/utils/request'

export function login(username, password) {
  return request({
    url: '/sso/login',
    method: 'get',
    params: {
      user : username,
      pwd : password
    },
  })
}

export function getInfo() {
  return request({
    url: '/sso/getUserName',
    method: 'get',
  })
}

export function logout() {
  return request({
    url: '/sso/logout',
    method: 'get'
  })
}
