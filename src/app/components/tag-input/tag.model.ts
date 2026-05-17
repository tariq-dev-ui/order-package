export interface TagBasicModel {
  TagID?: number;
  Name?: string | null;
  Description?: string | null;
  Color?: string | null;
}

export const DEFAULT_TAG_COLORS = [
  '#0011ffff', 
  '#00fd0dff', 
  '#d3d600ff', 
  '#d10000ff', 
  '#9f00a5ff', 
  '#c20000ff', 
  '#009985ff', 
  '#49a300ff'  
];

export function getDefaultColor(tagId?: number): string {
  return tagId ? DEFAULT_TAG_COLORS[tagId % 8] : DEFAULT_TAG_COLORS[0];
}