export interface User {
  _id: string;
  email: string;
  name: string;
}

export interface Template {
  _id: string;
  userId?: string;
  title: string;
  content: string;
  config: {
    header?: string;
    footer?: string;
    style?: {
      fontFamily?: string;
      fontSize?: string;
      color?: string;
    }
  };
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
}