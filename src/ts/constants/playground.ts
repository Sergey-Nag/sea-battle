const PLAYGROUND = {
  columns: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H' , 'I', 'J'],
  rows: [...Array(10)].map((_, i) => i + 1),
}

type Columns = typeof PLAYGROUND.columns;
type Rows = typeof PLAYGROUND.rows;

export {
  PLAYGROUND,
  Columns,
  Rows
}