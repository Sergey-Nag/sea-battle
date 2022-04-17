import IPlayer from "./Player.interface";

export type GameState = 'edit' | 'move' | 'wait' | 'end';

export default interface IGame {
  state: GameState;
  players: [IPlayer, IPlayer];
  playerMove: 0 | 1;

  start(): void;
  edit(): void;
  wait(): void;
  move(): void;
}