import { random } from "lodash";
import { PLAYGROUND } from "../constants/playground";
import IRenderer from "ts/interfaces/Renderer.interface";
import AIPlayer from "./AIPlayer";
import Cell from "./Cell";
import EventEmmiter from "./EventEmitter";
import GameMap, { AvailableShips, ShipsKeys } from "./GameMap";
import Player from "./Player";
import Template from "./Template";
import { Modal } from 'bootstrap';
import { GameState } from "./Game.types";

export default class Game implements IRenderer {
  private event: EventEmmiter;
  state: GameState;
  players: [Player, Player?];
  playerMove: 0 | 1 = 0;
  html: HTMLElement;
  justStarted: boolean;

  get opponent(): AIPlayer {
    return this.players[1] as AIPlayer;
  }

  constructor(players: [Player, Player?], gameEl: HTMLElement) {
    this.players = players;
    this.html = gameEl;
    this.justStarted = true;

    this.event = EventEmmiter.getInstance();

    this.event.on('cells', (cells: Cell[]) => {
      const shipSize = GameMap.getNameOfShip(cells.length);
      const availableShips = this.players[this.playerMove].map.availableShips;
      const leftShips = availableShips[shipSize];
      
      const string = `Placed <b>${shipSize}</b> ship. Available ${leftShips.length}`;

      this.updateInfo(string);
      this.updateAvailableShips(this.html.querySelector('.ships'), availableShips);

      if (Object.values(availableShips).every((arr) => arr.length === 0)) {
        this.event.emit('ships/ready');
      }
    });

    this.event.on('attack', (cell) => {
      const totalShips = this.players[0].map.countAllDefeatedCellsWithShips();
      
      const {row, col, state} = cell;
      const status = state === 'ship' ? 'Hit!' : 'Miss';
      
      this.updateInfo(`<b>${row}:${PLAYGROUND.columns[col - 1]}</b> - ${status}`);
      
      if (totalShips === 20) this.event.emit('game-over');
      if (cell.state === 'ship') return;

      setTimeout(() => {
        this.wait();
      }, 500);
    });

    
    this.event.on('attack/opponent', () => {
      this.opponent.map.applyMap('attackMap');
      let delay = random(5, 15) * 100;
      
      const {col, row, state, shot} = this.opponent.aim(this.players[0].map.defenceMap);
      
      setTimeout(() => {
        this.players[0].map.applyMap('defenceMap');
        this.players[0].map.setCell(col, row, state, shot);

        this.event.emit('render');
        const status = state === 'ship' ? 'Hit!' : 'Miss';
  
        this.updateInfo(`<b>${row}:${PLAYGROUND.columns[col - 1]}</b> - ${status}`, this.opponent.name);
        if (state === 'ship') {
          this.event.emit('attack/opponent');
          return;
        }
         setTimeout(() => {
          this.move();
        }, 500);
      }, delay);
    });

    this.event.on('ships/ready', () => {
      this.players[0].map.setDefenceMap();
      this.updateInfo('All ships are placed');

      setTimeout(() => {
        this.move();
      }, 500);
    });

    this.event.on('render', () => {
      this.render();
    });

    this.players.forEach((pl, i) => {
      this.event.on('ship/kill:'+pl.name, (deadShip: Cell[]) => {
        const size = GameMap.getNameOfShip(deadShip.length)
        this.updateInfo(`Killed <b>${size}</b> ship`, i === 1 && pl.name);
      });
    });

    this.event.on('game-over', () => {
      this.players.forEach((pl) => pl.map.applyMap('attackMap'));

      const [player, opponent] = this.players;
      const playerKills = player.map.countAllDefeatedCellsWithShips();
      const opponentKills = opponent.map.countAllDefeatedCellsWithShips();

      if (playerKills > opponentKills) this.end(player);
      else this.end(opponent);
    });
  }

  start(): void {
    if (this.justStarted) {
      this.edit();
    } else {
      this.move();
    }
  }

  edit(): void {
    this.state = 'edit';
    this.players[0].map.applyMap('map');

    this.render();
  }

  wait(): void {
    this.state = 'wait';
    this.players[0].map.applyMap('defenceMap');
    this.event.emit('attack/opponent');
    this.render();
  }

  move(): void {
    this.state = 'move';
    this.players[0].map.applyMap('attackMap');
  
    this.render();
  }

  clear() {
    this.render();
  }

  end(winner: Player) {
    this.state = 'end';
    const message = `<h3>${winner.name} win!</h3><h4>To restart the game reload the page</h4>`;
    this.showWinnerMessage(message);
  }

  private showWinnerMessage(message: string) {
    const gameOverModal = document.querySelector('#gameOverModal');
    const modalMsg = gameOverModal.querySelector('.modal-body');
    modalMsg.innerHTML = message;
    const modal = new Modal(gameOverModal, { backdrop: 'static', keyboard: false });
    modal.show();
  }

  render(): void {
    this.players[0].map.render();
    this.updateTable(this.html.querySelector('table'));
    this.updateInfo();
    this.updateAvailableShips(this.html.querySelector('.ships'), this.players[0].map.availableShips);
  }

  preRender(cells: Cell[]) {
    this.players[this.playerMove].map.preRender(cells);
  }

  switchPlayer() {
    this.playerMove = this.playerMove === 1 ? 0 : 1;

    this.render();
  }

  private updateTable(table: HTMLTableElement) {
    if (this.state === 'edit' || this.state === 'move') {
      table.classList.add('aim');
    } else {
      table.classList.remove('aim');
    }
  }

  private updateInfo(message?: string, opponent?: string) {
    const stateTitle = this.html.querySelector('.info h3.state')
    let titleText = '';
    switch (this.state) {
      case 'edit':
        titleText = 'Place your ships';
        break;
      case 'move':
        titleText = 'Attack!';
        break;
      case 'wait':
        titleText = 'Opponent attaks';
        break;
    }

    stateTitle.textContent = titleText;

    if (!message) return;

    const history = this.html.querySelector('.info .history');
    history.appendChild(Template.getHistoryLi('<i>' + (opponent || 'You') + '</i>: ' + message));

    history.scrollIntoView(false);
  }

  private updateAvailableShips(shipsInfo: HTMLElement, ships: AvailableShips) {
    if (this.state !== 'edit') {
      shipsInfo.style.display = 'none';
      return;
    }

    shipsInfo.style.display = 'block';
    let str = Object.keys(ships).reduce((acc, key: ShipsKeys) => {
      const name = `<b>${key}</b>:`;
      const amount = ships[key].length;
      const info = `<small>(${GameMap.AVAILABLE_SHIPS[key][0]} decks)</small>`;
      acc += [name, amount, info, '<br>'].join(' ');
      return acc;
    }, '');

    shipsInfo.querySelector('p').innerHTML = str;
  }
}