import Cell from "./Cell";

export default class Renderer {
  private buffer: Cell[];
  constructor(gameElement: HTMLElement) {}

  renderCells(cells: Cell[], isAll?: boolean) {
    cells.forEach((cell, i) => {
      if (isAll) {
        cell.render();
      } else {
        const copyCell = this.buffer[i];
        if (copyCell.state === cell.state) return;
        cell.render();
        this.buffer[i] = Cell.copy(cell);
      }
    });

    this.buffer = cells;
  }
}