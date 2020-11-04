import Cookies from "js-cookie";
const SupportKey='supportKey';

export function setSupport(isSupport) {
  return Cookies.set(SupportKey, isSupport,{ expires: 3 })
}

export function getCookie(key) {
  return Cookies.get(key)
}
