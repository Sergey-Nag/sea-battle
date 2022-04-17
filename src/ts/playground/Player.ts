import Cell from "./Cell";
import EventEmmiter from "./EventEmitter";
import GameMap from "./GameMap";

export default class Player {
  name: string;
  isLocal: boolean;
  map: GameMap;
  protected event: EventEmmiter;

  constructor(name: string, isLocal: boolean, map: GameMap) {
    this.name = name;
    this.isLocal = isLocal;
    this.map = map;

    this.event = EventEmmiter.getInstance();
  }

  prePlaceBiggerShip(cells: Cell[]): Cell[] {
    const approvedCells: Cell[] = [];

    for (let cell of cells) {
      if (
        this.map.getCell(cell.col, cell.row).state !== null ||
        !this.areAllCellsOnSameLine(cells)
      ) {
        return [];
      }
      
      const name = GameMap.getNameOfShip(cells.length);

      if (name && this.map.shipsLeft(name) > 0) {
        cell.state = 'ship';
        approvedCells.push(cell);
      }
    }
    
    return approvedCells;
  }

  placeBiggerShip(cells: Cell[]) {
    cells.forEach((cell) => {
      this.map.setCell(cell.col, cell.row, 'ship');
    });
    
    cells.forEach((cell) => {
      cell.setNeighboursState('dot', true);
    });
  }

  attack(cell: Cell) {
    const myCell = this.map.getCell(cell.col, cell.row);
    myCell.shot = true;
    
    switch (cell.state) {
      case 'dot':
        if (myCell.state !== null) return;
        myCell.state = 'dot';
        break;
      case 'ship':
        myCell.state = 'ship';
        break;
      default:
        myCell.state = 'dot';
    }

    if (myCell.state === 'ship' && myCell.shot) this.analizeShip(cell, myCell);

    return myCell;
  }
  
  private areAllCellsOnSameLine(cells: Cell[]) {
    const first = cells[0];
    return cells.every(({col, row}) => col === first.col || row === first.row);
  }

  private analizeShip(opCell: Cell, myCell: Cell) {
    if (opCell.totalNeighboursShips > 0) {
      const fullDeadCells = this.isShipFullDead(opCell, myCell);
      fullDeadCells.forEach((cell) => cell.setNeighboursState('dot', true));
      if (fullDeadCells.length) this.event.emit('ship/kill:'+this.name, fullDeadCells);
      return;
    }

    myCell.setNeighboursState('dot', true);
  }

  isShipFullDead(opCell: Cell, deadCell: Cell): Cell[] {
    const opDecks = opCell.getDecks();
    const deadDecks = deadCell.getDecks();
    
    return opDecks.length === deadDecks.length ? deadDecks : [];
  }

}