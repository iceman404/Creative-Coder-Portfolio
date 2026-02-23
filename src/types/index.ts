export interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  youtubeUrl?: string;
  githubUrl?: string;
  detailPage?: string;
}

export interface Skill {
  name: string;
  level: number;
  icon: string;
  description: string;
  category: 'language' | 'ai' | 'cloud' | 'tool';
}

export interface BioSection {
  title: string;
  content: string;
}

export interface Theme {
  name: 'light' | 'dark';
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
}
