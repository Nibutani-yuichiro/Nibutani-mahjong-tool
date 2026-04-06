export type Player = {
  id: number;
  name: string;
  score: number;
};

export type UmaOption = '5/10' | '10/20' | '10/30';

export const UMA_VALUES: Record<UmaOption, number[]> = {
  '5/10':  [10,  5,  -5, -10],
  '10/20': [20, 10, -10, -20],
  '10/30': [30, 10, -10, -30],
};
