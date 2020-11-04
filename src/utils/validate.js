export function isvalidUsername(str) {
  if (str == null) return true;
  if (str == undefined || str == "undefined") return true;
  if (str == "") return true;
  if (str.length == 0) return true;
  if (!/[^(^\s*)|(\s*$)]/.test(str)) return true;
  return false;
}
