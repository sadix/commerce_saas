export interface ThemeMetadata {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  version: string;
  author: string;
}

export interface ThemeComponent {
  type: string;
  component: React.ComponentType<any>;
}