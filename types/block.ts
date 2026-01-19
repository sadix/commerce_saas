export interface Block {
  id: string;
  type: string;
  props: Record<string, any>;
}

export interface BlockType {
  type: string;
  label: string;
  defaultProps: Record<string, any>;
  icon?: string;
}

export interface PageLayout {
  blocks: Block[];
}