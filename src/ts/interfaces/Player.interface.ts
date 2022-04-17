import IGameMap from "./GameMap.interface";

export default interface IPlayer {
  name: string;
  isLocal: boolean;
  map: IGameMap;
}