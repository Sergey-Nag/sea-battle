import { cloneDeep } from "lodash";
import { CellState } from "ts/interfaces/Cell.interface";
import Cell from "./Cell";

const SHIPS_AMOUNT = {
  tiny: 4,
  small: 3,
  medium: 2,
  big: 1,
}

export type AvailableShips = {
  tiny: 1[]; small: 2[]; medium: 3[]; big: 4[];
}
export type ShipsKeys = keyof AvailableShips;

export default class GameMap {
  static readonly AVAILABLE_SHIPS: AvailableShips = {
    tiny: [1, 1, 1, 1],
    small: [2, 2, 2],
    medium: [3, 3],
    big: [4],
  }
  
  static createMap(cells: HTMLTableCellElement[]): Cell[] {
    return cells.map((cell) => new Cell(cell));
  }

  static createBuffer(cells: Cell[]): Cell[] {
    return [...cells].map((cell)=> Cell.copy(cell));
  }

  static getNameOfShip(size: number) {
    return (Object.keys(this.AVAILABLE_SHIPS) as ShipsKeys[]).filter((key: ShipsKeys) => {
      return this.AVAILABLE_SHIPS[key][0] === size;
    })[0];
  }

  private currentMap: 'map' | 'attackMap' | 'defenceMap' = 'map';
  availableShips: AvailableShips;
  map: Cell[];
  attackMap: Cell[];
  defenceMap: Cell[];

  get renderMap() {
    return this[this.currentMap];
  }

  constructor(cells?: HTMLTableCellElement[]) {
    this.availableShips = cloneDeep(GameMap.AVAILABLE_SHIPS);
    
    this.map = GameMap.createMap(cells);

    this.setAttackMap(GameMap.createMap(cells));
    this.setNeighbours();
  }

  applyMap(map: 'map' | 'attackMap' | 'defenceMap') {
    this.currentMap = map;
  }

  setAttackMap(cells: Cell[]) {
    this.attackMap = cells;
  }

  setDefenceMap() {
    this.defenceMap = [...this.map].map((cell) => {
      const newCell = Cell.copy(cell);
      newCell.shot = false;

      if (cell.state === 'ship') newCell.state = 'ship';
      
      return newCell;
    });
  }

  shipsLeft(size: keyof typeof this.availableShips) {
    return Object
      .values(this.availableShips[size])
      .reduce((acc, val) => acc + val, 0);
  }

  updateAvailableShips(usedShips: any) {
    Object.keys(usedShips).forEach((key: ShipsKeys) => {
      const shipsLeft = SHIPS_AMOUNT[key] - usedShips[key];
      this.availableShips[key] = [...new Array(shipsLeft)].fill(GameMap.AVAILABLE_SHIPS[key][0]);
    });
 }

  getCell(col: number, row: number): Cell {
    return this.renderMap.find((cell) => cell.col === col && cell.row === row);
  }

  setCell(col: number, row: number, state: CellState, shot?: boolean, neighboursState?: CellState) {
    const cell = this.getCell(col, row);
    cell.state = state;
    cell.shot = shot ?? cell.shot;
  
    if (neighboursState) cell.setNeighboursState(neighboursState, true);
    return cell;
  }

  countAllShips(isDead?: boolean) {
    const ships = this.renderMap.filter((cell) => cell.state === 'ship');
    
    let readCells: Cell[] = [];
    return ships.reduce((acc: any, cell) => {
      if (cell && cell.state !== 'ship' && (isDead ? cell.shot === true : true) || readCells.includes(cell)) return acc;
      const count = cell.getDecks();
      const key = GameMap.getNameOfShip(count.length);
      acc[key] += 1;
      readCells = [...readCells, ...count];
      return acc;
    }, {tiny: 0, small: 0, medium: 0, big: 0});
  }

  countAllDefeatedCellsWithShips() {
    return this.attackMap.filter((cell) => cell.state === 'ship' && cell.shot).length;
  }

  render() {
    this.renderMap.forEach((cell, i) => {
      cell.render();
    });
  }

  preRender(cells: Cell[]) {
    cells.forEach((cell) => {
      cell.render();
    });
  }
  
  private setNeighbours() {
    this.map.forEach((cell, i, cellsArr) => {
      cell.setNeighbours(cellsArr);
    });
    this.attackMap.forEach((cell, i, cellsArr) => {
      cell.setNeighbours(cellsArr);
    });
    this.defenceMap?.forEach((cell, i, cellsArr) => {
      cell.setNeighbours(cellsArr);
    });
  }
}