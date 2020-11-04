import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '../views/layout/Layout'

/**
 * hidden: true                   if `hidden:true` will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu, whatever its child routes length
 *                                if not set alwaysShow, only more than one route under the children
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noredirect           if `redirect:noredirect` will no redirct in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    title: 'title'               the name show in submenu and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar,
  }
 **/
export const constantRouterMap = [
  {path: '/login', component: () => import('@/views/login/index'), hidden: true},
  {path: '/404', component: () => import('@/views/404'), hidden: true},
  {
    path: '',
    component: Layout,
    redirect: '/home',
    children: [{
      path: 'home',
      name: 'home',
      component: () => import('@/views/home/index'),
      meta: {title: '首页', icon: 'home'}
    }]
  },
  {
    path: '/other',
    component: Layout,
    redirect: '/other/otherListInfo',
    name: 'other',
    children: [{
      path: 'otherListInfo',
      name: 'other',
      component: () => import('@/views/other/testList/otherListInfo'),
      meta: {title: '其他'},
    }]
  },
]

export const asyncRouterMap = [
  {
    path: '/pms',
    component: Layout,
    redirect: '/pms/serviceList',
    name: 'pms',
    meta: {title: '服务', icon: 'product'},
    children: [{
      path: 'serviceList',
      name: 'product',
      component: () => import('@/views/pms/product/serviceList'),
      meta: {title: '服务列表', icon: 'product-list'}

    },
      {
        path: 'serviceDetail',
        name: 'serviceDetail',
        component: () => import('@/views/pms/product/serviceDetail'),
        meta: {title: '服务详情'},
        hidden:true
      },
    ]
  },

  {path: '*', redirect: '/404', hidden: true}
]

export default new Router({
  // mode: 'history', //后端支持可开
  scrollBehavior: () => ({y: 0}),
  routes: constantRouterMap
})

