import { ReactNode } from 'react';

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export enum AppID {
  DESKTOP = 'desktop',
  NOTEPAD = 'notepad',
  TERMINAL = 'terminal',
  BROWSER = 'browser',
  PAINT = 'paint',
  VIDEOPRO = 'videopro',
  CODE = 'code',
  GEMINI = 'gemini',
  FILES = 'files',
  SETTINGS = 'settings',
  MINESWEEPER = 'minesweeper',
  CALCULATOR = 'calculator'
}

export interface WindowState {
  id: string;
  appId: AppID;
  title: string;
  icon: any; // React Component
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  position: Position;
  size: Size;
  content?: ReactNode; // Optional, if rendered via switch
  fileId?: string; // If the window has a file open
}

export interface FileSystemNode {
  id: string;
  parentId: string | null;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: string[]; // Array of IDs
  createdAt: number;
}

export interface FileSystemState {
  [id: string]: FileSystemNode;
}

export interface Theme {
  mode: 'light' | 'dark';
  accentColor: string;
  bgImage: string;
}
