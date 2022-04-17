import ICell from "./Cell.interface";
import IRenderer from "./Renderer.interface";

export default interface IGameMap extends IRenderer{
  availableShips: {
    tiny: 1[],
    small: 2[],
    medium: 3[],
    big: 4[],
  };
  placedShips: ICell[];
  bufferShips: ICell[];

  getMap(): ICell[][];
  getCellsWithShips(): ICell[];
  getCell(col: number, row: number): number;
  
}