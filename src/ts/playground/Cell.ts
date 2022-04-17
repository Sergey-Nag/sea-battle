import IRenderer from "ts/interfaces/Renderer.interface";
import { PLAYGROUND } from "../constants/playground";
import ICell, { CellNeighbours, CellState } from "../interfaces/Cell.interface";

export default class Cell implements ICell, IRenderer {
  state: CellState;
  colName: string;
  col: number;
  row: number;
  html: HTMLTableCellElement;
  neighbours: CellNeighbours;
  shot: boolean;

  get totalNeighboursShips() {
    return Object
      .values(this.neighbours)
      .filter((cell) => cell)
      .filter((cell) => cell.state === 'ship').length;
  }

  static copy(cell: Cell): Cell {
    const neighbours = Object.values(cell.neighbours);
    const copyCell = new Cell(cell.html);
    copyCell.setNeighbours(neighbours as Cell[]);
    return copyCell;
  }

  constructor(cell: HTMLTableCellElement) {
    const { col, row } = cell.dataset;
    this.col = +col;
    this.row = +row;
    this.html = cell;
    this.state = this.getState(cell.classList);

    this.colName = PLAYGROUND.columns[this.col - 1];
  }
  
  render(): void {
    let classes = this.state === 'dead-ship' ? 'ship' : this.state ?? '';
    classes += this.shot ? ' shot' : '';
    this.html.className = 'cell ' + classes;
  }

  private getState(classList: DOMTokenList): CellState {
    if (classList.contains('ship')) return 'ship';
    else if (classList.contains('dot')) return 'dot';
    else if (classList.contains('cross')) return 'cross';

    return null;
  }

  setNeighbours(cells: Cell[]) {
    this.neighbours = cells.reduce((acc, cell) => {
      if (!cell) return acc;
      
      let neighbours = {
        topLeft: cell.row === this.row - 1 && cell.col === this.col - 1 ? cell : acc.topLeft,
        top: cell.row === this.row - 1 && cell.col === this.col ? cell : acc.top,
        topRight: cell.row === this.row - 1 && cell.col === this.col + 1 ? cell : acc.topRight,
        right: cell.row === this.row && cell.col === this.col + 1 ? cell : acc.right,
        bottomRight: cell.row === this.row + 1 && cell.col === this.col + 1 ? cell : acc.bottomRight,
        bottom: cell.row === this.row + 1 && cell.col === this.col ? cell : acc.bottom,
        bottomLeft: cell.row === this.row + 1 && cell.col === this.col - 1 ? cell : acc.bottomLeft,
        left: cell.row === this.row && cell.col === this.col - 1 ? cell : acc.left,
      };

      return neighbours;
    }, {topLeft: null, top: null, topRight:null, right: null, bottomRight: null, bottom: null, bottomLeft: null, left: null});
  }
  
  setNeighboursState(state: CellState, emptyOnly?: boolean) {
    Object.values(this.neighbours)
      .filter((cell) => cell && emptyOnly && cell.state === null)
      .forEach((cell) => cell.state = state);
  }

  getDecks(currCell: Cell = this, prevCell?: Cell): Cell[] {
    if (!this.state || this.state === 'dot') return [];

    const neighbours = Object
                        .values(currCell.neighbours)
                        .filter((cell: Cell) => cell && cell !== prevCell)
                        .filter((cell: Cell) =>
                          cell.state === currCell.state);

    const cells = (neighbours as Cell[]).map((nCell: Cell) => this.getDecks(nCell, currCell)).flat();

    if (neighbours.length) return [currCell, ...cells];
    return [currCell];
  }
}