export function columnLabeler(col: number) {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  return letters[col % letters.length];
};

export function rowLabeler(row: number) {
  return (row + 1).toString();
};