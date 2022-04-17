export default class Template {
  static getHistoryLi(str: string) {
    const li = document.createElement('li');
    li.innerHTML = str;
    return li as Node;
  }
}