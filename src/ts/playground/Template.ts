import Cell from "./Cell";

export default class Template {
  static getRow(cells: Cell[]): string {
    return `<tr><th></th>${cells.map((cell) => `<td></td>`)}</tr>`;
  }
  static getHistoryLi(str: string) {
    const li = document.createElement('li');
    li.innerHTML = str;
    return li as Node;
  }
}