export type CellState = "ship" | "dead-ship" | "dot" | "cross";

export type CellNeighbours = {
  topLeft: ICell | null;
  top: ICell | null;
  topRight: ICell | null;
  right: ICell | null;
  bottomRight: ICell | null;
  bottom: ICell | null;
  bottomLeft: ICell | null;
  left: ICell | null;
};

export default interface ICell {
  state: CellState;
  col: number;
  row: number;
  neighbours: CellNeighbours
}
