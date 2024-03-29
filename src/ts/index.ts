import AIPlayer from "./playground/AIPlayer";
import Cell from "./playground/Cell";
import Game from "./playground/Game";
import GameEvents from "./playground/GameEvents";
import GameMap from "./playground/GameMap";
import Player from "./playground/Player";

const gameElement = document.querySelector<HTMLElement>('.game-container');
const table = document.querySelector<HTMLTableElement>('#playground');
const cells = table.querySelectorAll<HTMLTableCellElement>('.cell');

const map = new GameMap([...cells as any]);
const opponentMap = new GameMap([...cells as any]);
const player = new Player('You', true, map);
const opponent = new AIPlayer('AI', opponentMap);
const game = new Game([player, opponent], gameElement);

// -- auto generate map
// const generatedMap = new GameMap([...cells as any]);
// const generatetPlayer = new AIPlayer('map', generatedMap);
// player.map = generatetPlayer.map;
// player.map.setDefenceMap();

// -- show opponent map
// player.map.setAttackMap(opponent.map.map)

const gameEvents = new GameEvents(gameElement, game);
gameEvents.on({
  edit: {
    onCells: (cells) => {
      return player.prePlaceBiggerShip(cells.map((cell) => Cell.copy(cell)));
    },
    offCells: (cells) => {
      player.placeBiggerShip(cells);
      const placedShipsAmount = player.map.countAllShips();
      player.map.updateAvailableShips(placedShipsAmount);
    }
  },
  move: {
    offCells: ([cell]) => {
      player.attack(cell);
    }
  },
});

game.start();

document.querySelector('#reloadPage').addEventListener('click', (e) => {
  window.location.reload();
});