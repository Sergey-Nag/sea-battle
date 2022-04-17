import GameMap from "./GameMap";
import Player from "./Player"
import { PLAYGROUND } from '../constants/playground';
import Cell from "./Cell";
import { random } from "lodash";
import { CellNeighbours, CellState } from "ts/interfaces/Cell.interface";
import EventEmmiter from "./EventEmitter";

export default class AIPlayer extends Player {
  protected event: EventEmmiter;
  private attackedCells: Cell[] = [];

  constructor(name: string, map: GameMap) {
    super(name, true, map);
    this.event = EventEmmiter.getInstance();
    this.generateShipsMap();
    const allShips = this.map.countAllShips();
    this.map.updateAvailableShips(allShips);
  }

  aim(cells: Cell[]): Cell {
    const [col, row] = this.getRandomColRow();
    let cell = cells.find((c) => c.col === col && c.row === row);

    if (!cell || this.attackedCells.some((c) => c.col === col && c.row === row)){
      return this.aim(cells);
    }

    cell = this.attack(cell);
    
    if (!cell){
      return this.aim(cells);
    }

    this.attackedCells.push(cell);
    return cell;
  }

  private getRandomColRow(): [number, number] {
    return [random(1, 10), random(1, 10)]
  }

  private getRandomCell(): Cell {
    const [col, row] = this.getRandomColRow();

    const cell = this.map.getCell(col, row);

    if (cell.state) {
      return this.getRandomCell();
    } else {
      return cell;
    }
  }

  private generateShipsMap() {
    const { tiny, small, medium, big } = this.map.availableShips;
    try {
      const fill = (size: number) => {
        const randCell = this.getRandomCell();
        this.growShip(randCell, size);
      }
      
      big.forEach(fill);
      medium.forEach(fill);
      small.forEach(fill);
      tiny.forEach(fill);

    } catch (e) {
      console.info(e);
      this.generateShipsMap();
    }
  }

  private growShip(cell: Cell, size: number) {
    const dir = random(1, 4);
    let dirKey: 'top' | 'right' | 'bottom' | 'left';
    switch (dir) {
      case 1:
        dirKey = 'top';
        break;
      case 2:
        dirKey = 'right';
        break;
      case 3:
        dirKey = 'bottom';
      case 4:
        dirKey = 'left';
        break;
    }

    const emptyCells = this.getEmptyCells(cell);
    
    if (emptyCells[dirKey].length >= size) {
      this.placeBiggerShip(emptyCells[dirKey].splice(0, size));
    } else {
      this.growShip(cell, size);
    }
  }

  private getEmptyCells(cell: Cell): {top: Cell[], right: Cell[], bottom: Cell[], left: Cell[]} {
    const getNeighbours = (cell: Cell, dir: keyof CellNeighbours): Cell[] => {
      if (!cell || cell.state !== null) return [];
      return [cell, ...getNeighbours(cell.neighbours[dir] as Cell, dir)];
    }

    const top = getNeighbours(cell, 'top');
    const right = getNeighbours(cell, 'right');
    const bottom = getNeighbours(cell, 'bottom');
    const left = getNeighbours(cell, 'left');

    return {top, right, bottom, left};
  }

}