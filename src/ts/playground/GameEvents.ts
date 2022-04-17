import Cell from "./Cell"
import EventEmmiter from "./EventEmitter";
import Game from "./Game";

export type Callbacks = {
  onCells?: (cells: Cell[]) => Cell[];
  offCells?: (cells: Cell[]) => void;
}

export interface EventsCallbacks {
  edit?: Callbacks,
  move?: Callbacks,
  wait?: {
    onAttack: (cell: Cell) => void;
  },
}

export default class GameEvents {
  private cellsForPlace: Cell[] = [];
  private callbacks: EventsCallbacks;
  private selectedCells: Cell[] = [];
  private event: EventEmmiter;

  constructor(private gameWrapp: HTMLElement, private game: Game) {
    this.event = EventEmmiter.getInstance();
  }

  setCellsSellect() {
    this.gameWrapp.querySelector('tbody').addEventListener('mousedown', this.onCellsSelect.bind(this));
    this.gameWrapp.querySelector('tbody').addEventListener('mousemove', this.onCellsSelect.bind(this));
    this.gameWrapp.querySelector('tbody').addEventListener('mouseup', this.offCellsSelect.bind(this));
  }

  onCellsSelect(e: MouseEvent) {
    e.preventDefault();
    const target = e.target as HTMLElement;
    
    if (!target.closest('.cell') || e.buttons !== 1) return;
    
    const cell = this.getCellFromActiveUser(target);
    
    if (this.selectedCells.includes(cell)) {
      this.selectedCells = this.getCorrectedCells(this.selectedCells, cell);
      this.game.clear();
    } else {
      this.selectedCells.push(cell);
    }

    if (this.game.state === 'edit') {
      const cells = this.callbacks[this.game.state]?.onCells(this.selectedCells);

      if (cells) {
        this.game.preRender(cells);
        this.cellsForPlace = cells;
      } else this.game.clear();
    } else {
      const cell = this.getCellFromOpponent(target);
      this.callbacks.move?.onCells([cell]);
    }
  }


  offCellsSelect(e: MouseEvent) {
    if (this.game.state === 'edit') {
      this.callbacks.edit.offCells?.(this.cellsForPlace);
      if (this.cellsForPlace.length) this.event.emit('cells', this.cellsForPlace);
    } else if (this.game.state === 'move') {
      const cell = this.getCellFromOpponent(e.target as HTMLElement);
      this.callbacks.move.offCells?.([cell]);
      this.event.emit('attack', cell);
    }
    
    this.selectedCells = [];
    this.cellsForPlace = [];
    this.game.clear();
  }

  on(callbacks: EventsCallbacks) {
    this.callbacks = callbacks;
    this.setCellsSellect();
  }

  onOpponentAttack() {
    this.event.on('attack/opponent', (cell: Cell) => {
      this.callbacks.wait.onAttack(cell);
    });
  }

  private getCellFromActiveUser(target: HTMLElement) {
    const {map} = this.game.players[this.game.playerMove];
    const {col, row} = target.dataset;

    return map.getCell(+col, +row);
  }
  private getCellFromOpponent(target: HTMLElement) {
    const {map} = this.game.opponent;
    const {col, row} = target.dataset;
    map.applyMap('map');
    return map.getCell(+col, +row);
  }

  private getCorrectedCells(cells: Cell[], current: Cell) {
    const currIndex = cells.findIndex((c) => c.col === current.col && c.row === current.row);

    return cells.slice(0, currIndex + 1);
  } 
}