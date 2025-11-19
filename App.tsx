import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal, Type, Monitor, Image, Code, 
  Settings, Folder, X, Minus, Square, 
  Battery, Wifi, Volume2, 
  Search, RefreshCw,
  Bot, Eraser, Pencil, Palette,
  FileText, Globe, ChevronLeft, ChevronRight, ArrowUp,
  MoreHorizontal, Trash2, ExternalLink, AlertCircle
} from 'lucide-react';
import { AppID, WindowState, Position, FileSystemState } from './types';

// --- Virtual File System Utils ---

const generateId = () => Math.random().toString(36).substr(2, 9);

const INITIAL_FS: FileSystemState = {
  'root': { id: 'root', parentId: null, name: 'C:', type: 'folder', children: ['docs', 'pics', 'code', 'sys'], createdAt: Date.now() },
  'docs': { id: 'docs', parentId: 'root', name: 'Documents', type: 'folder', children: ['resume', 'todo'], createdAt: Date.now() },
  'pics': { id: 'pics', parentId: 'root', name: 'Pictures', type: 'folder', children: [], createdAt: Date.now() },
  'code': { id: 'code', parentId: 'root', name: 'Projects', type: 'folder', children: ['hello_py', 'react_app'], createdAt: Date.now() },
  'sys':  { id: 'sys',  parentId: 'root', name: 'System', type: 'folder', children: ['sys_log'], createdAt: Date.now() },
  'resume': { id: 'resume', parentId: 'docs', name: 'Resume.txt', type: 'file', content: 'JOHN DOE\nSenior Frontend Engineer\n\nSkills:\n- React, TypeScript, Tailwind\n- Windows 98 to 11 Expert', createdAt: Date.now() },
  'todo': { id: 'todo', parentId: 'docs', name: 'todo.txt', type: 'file', content: '- Build WebOS\n- Integrate Gemini\n- Fix bugs', createdAt: Date.now() },
  'hello_py': { id: 'hello_py', parentId: 'code', name: 'hello.py', type: 'file', content: 'print("Hello from WebOS!")\nx = 10\ny = 20\nprint(f"Sum is {x+y}")', createdAt: Date.now() },
  'react_app': { id: 'react_app', parentId: 'code', name: 'App.tsx', type: 'file', content: 'import React from "react";\n\nexport default function App() {\n  return <div>Hello World</div>;\n}', createdAt: Date.now() },
  'sys_log': { id: 'sys_log', parentId: 'sys', name: 'boot.log', type: 'file', content: '[INFO] Kernel loaded.\n[INFO] UI mounted.\n[WARN] Low caffeine levels detected.', createdAt: Date.now() }
};

// --- Helper Components ---

const Clock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="flex flex-col items-end text-xs px-2 cursor-default hover:bg-white/10 rounded p-1 transition-colors group">
      <span className="group-hover:text-gray-900 text-gray-800 font-medium">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      <span className="group-hover:text-gray-700 text-gray-600">{time.toLocaleDateString()}</span>
    </div>
  );
};

// --- Applications ---

// 1. Advanced Text Editor
const Editor = ({ fileId, fs, onSave, mode = 'text' }: { fileId?: string, fs: FileSystemState, onSave: (id: string, content: string) => void, mode?: 'text' | 'code' }) => {
  const [content, setContent] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  
  useEffect(() => {
    if (fileId && fs[fileId]) {
      setContent(fs[fileId].content || '');
      setIsDirty(false);
    } else {
      setContent('');
      setIsDirty(false);
    }
  }, [fileId, fs]);

  const handleSave = () => {
    if (fileId) {
      onSave(fileId, content);
      setIsDirty(false);
    }
  };

  const highlightCode = (code: string) => {
    if (mode !== 'code') return code;
    return code
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/\b(const|let|var|function|return|import|export|from|if|else|for|while|print|def|class)\b/g, '<span class="text-pink-500 font-bold">$1</span>')
      .replace(/\b(true|false|null|undefined)\b/g, '<span class="text-purple-400 font-bold">$1</span>')
      .replace(/"([^"]*)"/g, '<span class="text-yellow-300">"$1"</span>')
      .replace(/'([^']*)'/g, "<span class='text-yellow-300'>'$1'</span>")
      .replace(/\b(\d+)\b/g, '<span class="text-green-300">$1</span>')
      .replace(/(\/\/.*)/g, '<span class="text-gray-500 italic">$1</span>');
  };

  return (
    <div className={`flex flex-col h-full ${mode === 'code' ? 'bg-[#1e1e1e] text-gray-200' : 'bg-white text-gray-900'}`}>
      <div className={`h-9 flex items-center px-2 gap-2 text-xs border-b shrink-0 ${mode === 'code' ? 'bg-[#2d2d2d] border-black text-gray-300' : 'bg-gray-50 border-gray-200'}`}>
        <button onClick={handleSave} className={`flex items-center gap-1 px-3 py-1.5 rounded transition-colors ${isDirty ? 'bg-blue-600 text-white hover:bg-blue-500' : 'hover:bg-gray-500/20'}`}>
          <SaveIcon size={14} /> Save
        </button>
        <span className="opacity-50 ml-2 border-l pl-2 border-gray-500/30">{fileId ? fs[fileId]?.name : 'Untitled'} {isDirty ? '*' : ''}</span>
      </div>
      
      <div className="flex-1 relative overflow-auto font-mono text-sm custom-scrollbar">
        {mode === 'code' ? (
          <div className="relative min-h-full">
             <pre 
              className="absolute top-0 left-0 w-full h-full p-4 pointer-events-none m-0 whitespace-pre-wrap break-words z-0"
              dangerouslySetInnerHTML={{ __html: highlightCode(content) }}
             />
             <textarea 
              value={content}
              onChange={(e) => { setContent(e.target.value); setIsDirty(true); }}
              className="absolute top-0 left-0 w-full h-full p-4 bg-transparent text-transparent caret-white resize-none outline-none z-10 selection:bg-blue-500/30"
              spellCheck={false}
             />
          </div>
        ) : (
           <textarea 
              value={content}
              onChange={(e) => { setContent(e.target.value); setIsDirty(true); }}
              className="w-full h-full p-4 resize-none outline-none bg-transparent text-lg"
              placeholder="Start typing..."
           />
        )}
      </div>
      <div className={`h-6 flex items-center justify-end px-4 text-[10px] shrink-0 ${mode === 'code' ? 'bg-[#007acc] text-white' : 'bg-gray-100 text-gray-500'}`}>
        Ln {content.split('\n').length}, Col {content.length}
      </div>
    </div>
  );
};

// 2. Terminal - Now with Filesystem Integration
const TerminalApp = ({ fs, setFs }: { fs: FileSystemState, setFs: React.Dispatch<React.SetStateAction<FileSystemState>> }) => {
  const [history, setHistory] = useState<string[]>(['WebOS Kernel [Version 10.0.22000.1]', '(c) WebOS Corporation. All rights reserved.', '']);
  const [input, setInput] = useState('');
  const [currentPathIds, setCurrentPathIds] = useState<string[]>(['root']);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Get current path string (e.g. C:\Users\Admin)
  const getCurrentPathString = () => {
     let path = '';
     currentPathIds.forEach(id => {
        if (id === 'root') path += 'C:';
        else path += '\\' + fs[id].name;
     });
     return path || 'C:';
  };

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [history]);

  const handleFocus = () => {
    if (window.getSelection()?.toString()) return;
    inputRef.current?.focus();
  };

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmdRaw = input.trim();
    if (!cmdRaw) {
      setInput('');
      return;
    }
    
    const prompt = `${getCurrentPathString()}>`;
    const newHist = [...history, `${prompt} ${cmdRaw}`];
    
    const args = cmdRaw.split(' ');
    const cmd = args[0].toLowerCase();
    const currentDirId = currentPathIds[currentPathIds.length - 1];
    const currentDirNode = fs[currentDirId];

    // Commands
    if (cmd === 'cls' || cmd === 'clear') {
      setHistory([]);
      setInput('');
      return;
    } else if (cmd === 'help') {
      newHist.push('Available commands:\n  dir, ls    - List directory contents\n  cd <name>  - Change directory\n  mkdir <name> - Create directory\n  touch <name> - Create file\n  cat <name> - View file content\n  echo <txt> - Print text\n  cls        - Clear screen');
    } else if (cmd === 'echo') {
      newHist.push(args.slice(1).join(' '));
    } else if (cmd === 'time') {
      newHist.push(new Date().toString());
    } else if (cmd === 'dir' || cmd === 'ls') {
      if (currentDirNode.children) {
         const items = currentDirNode.children.map(childId => {
            const child = fs[childId];
            const date = new Date(child.createdAt).toLocaleDateString();
            const time = new Date(child.createdAt).toLocaleTimeString();
            const type = child.type === 'folder' ? '<DIR>' : '     ';
            return `${date}  ${time}    ${type}    ${child.name}`;
         });
         newHist.push(` Directory of ${getCurrentPathString()}\n`);
         if (items.length === 0) newHist.push('File Not Found');
         else newHist.push(items.join('\n'));
         newHist.push(`\n               ${currentDirNode.children.length} File(s)`);
      }
    } else if (cmd === 'cd') {
       const targetName = args[1];
       if (!targetName) {
          newHist.push(getCurrentPathString());
       } else if (targetName === '..') {
          if (currentPathIds.length > 1) {
             setCurrentPathIds(prev => prev.slice(0, -1));
          }
       } else if (targetName === '\\' || targetName === '/') {
          setCurrentPathIds(['root']);
       } else {
          // Find child folder
          const targetId = currentDirNode.children?.find(id => fs[id].name === targetName && fs[id].type === 'folder');
          if (targetId) {
             setCurrentPathIds(prev => [...prev, targetId]);
          } else {
             newHist.push(`The system cannot find the path specified.`);
          }
       }
    } else if (cmd === 'mkdir') {
        const name = args[1];
        if (name) {
           const newId = generateId();
           const newNode = { id: newId, parentId: currentDirId, name, type: 'folder' as const, children: [], createdAt: Date.now() };
           setFs(prev => ({
              ...prev,
              [newId]: newNode,
              [currentDirId]: { ...prev[currentDirId], children: [...(prev[currentDirId].children || []), newId] }
           }));
           newHist.push('Directory created.');
        } else {
           newHist.push('Usage: mkdir <directory_name>');
        }
    } else if (cmd === 'touch') {
        const name = args[1];
        if (name) {
           const newId = generateId();
           const newNode = { id: newId, parentId: currentDirId, name, type: 'file' as const, content: '', createdAt: Date.now() };
           setFs(prev => ({
              ...prev,
              [newId]: newNode,
              [currentDirId]: { ...prev[currentDirId], children: [...(prev[currentDirId].children || []), newId] }
           }));
           newHist.push('File created.');
        } else {
           newHist.push('Usage: touch <filename>');
        }
    } else if (cmd === 'cat' || cmd === 'type') {
        const name = args[1];
        if (name) {
           const targetId = currentDirNode.children?.find(id => fs[id].name === name && fs[id].type === 'file');
           if (targetId) {
              newHist.push(fs[targetId].content || '');
           } else {
              newHist.push('File not found.');
           }
        }
    } else {
      newHist.push(`'${cmd}' is not recognized as an internal or external command.`);
    }

    setHistory(newHist);
    setInput('');
  };

  return (
    <div 
      className="h-full flex flex-col bg-[#0c0c0c] text-gray-300 font-mono text-sm p-2 cursor-text"
      onClick={handleFocus}
    >
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1" ref={scrollContainerRef}>
        {history.map((line, i) => (
          <div key={i} className="whitespace-pre-wrap break-all leading-tight mb-0.5">{line}</div>
        ))}
        
        <div className="flex w-full items-start mt-0.5">
          <span className="mr-2 text-gray-400 shrink-0 select-none">
            {getCurrentPathString()}&gt;
          </span>
          <form onSubmit={handleCommand} className="flex-1 min-w-0">
            <input 
              ref={inputRef}
              className="w-full bg-transparent border-none outline-none text-white p-0 m-0 font-mono"
              value={input}
              onChange={e => setInput(e.target.value)}
              autoFocus
              autoComplete="off"
              spellCheck={false}
            />
          </form>
        </div>
      </div>
    </div>
  );
};

// 3. Paint App
const PaintApp = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState('#000000');
  const [size, setSize] = useState(5);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const startDrawing = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    ctx.lineWidth = size;
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  return (
    <div className="flex flex-col h-full bg-gray-100">
      {/* Toolbar */}
      <div className="flex items-center gap-4 p-2 bg-white border-b shadow-sm shrink-0">
        <div className="flex bg-gray-100 rounded p-1 gap-1">
           <button onClick={() => setTool('pen')} className={`p-1.5 rounded ${tool === 'pen' ? 'bg-white shadow' : 'hover:bg-gray-200'}`}><Pencil size={16}/></button>
           <button onClick={() => setTool('eraser')} className={`p-1.5 rounded ${tool === 'eraser' ? 'bg-white shadow' : 'hover:bg-gray-200'}`}><Eraser size={16}/></button>
        </div>
        <div className="w-px h-6 bg-gray-300"></div>
        <div className="flex items-center gap-2">
           <span className="text-xs font-medium">Size</span>
           <input type="range" min="1" max="50" value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
        </div>
        <div className="w-px h-6 bg-gray-300"></div>
        <div className="flex gap-1">
          {['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'].map(c => (
            <button 
              key={c} 
              onClick={() => setColor(c)}
              className={`w-6 h-6 rounded-full border border-gray-300 ${color === c ? 'ring-2 ring-offset-1 ring-blue-500' : ''}`}
              style={{ backgroundColor: c }}
            />
          ))}
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-6 h-6 p-0 border-0 rounded-full overflow-hidden" />
        </div>
      </div>
      <div className="flex-1 relative overflow-hidden cursor-crosshair">
        <canvas 
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="w-full h-full touch-none"
        />
      </div>
    </div>
  );
};

// 4. File Explorer
const FileExplorer = ({ fs, openFile }: { fs: FileSystemState, openFile: (fileId: string) => void }) => {
  const [currentPath, setCurrentPath] = useState<string[]>(['root']);
  const currentFolderId = currentPath[currentPath.length - 1];
  const currentFolder = fs[currentFolderId];
  
  const navigateUp = () => {
    if (currentPath.length > 1) {
      setCurrentPath(prev => prev.slice(0, -1));
    }
  };

  const navigateTo = (folderId: string) => {
    setCurrentPath(prev => [...prev, folderId]);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center gap-2 p-2 border-b bg-gray-50">
         <button onClick={navigateUp} disabled={currentPath.length <= 1} className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"><ArrowUp size={16}/></button>
         <div className="flex-1 flex items-center bg-white border px-2 py-1 rounded text-sm text-gray-600">
            <Monitor size={14} className="mr-2 text-blue-500"/>
            {currentPath.map((id, i) => (
               <span key={id} className="flex items-center">
                 {i > 0 && <ChevronRight size={12} className="mx-1"/>}
                 <span className="hover:underline cursor-pointer" onClick={() => setCurrentPath(currentPath.slice(0, i+1))}>
                   {fs[id]?.name || 'Unknown'}
                 </span>
               </span>
            ))}
         </div>
         <div className="relative">
            <Search size={16} className="absolute left-2 top-1.5 text-gray-400"/>
            <input className="pl-8 pr-2 py-1 border rounded text-sm w-48" placeholder="Search" />
         </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-48 border-r bg-gray-50 p-2 hidden md:block overflow-y-auto">
           <div className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Favorites</div>
           <div className="space-y-1">
             <button onClick={() => setCurrentPath(['root'])} className="flex items-center gap-2 w-full px-2 py-1.5 rounded hover:bg-gray-200 text-sm text-gray-700"><Monitor size={16}/> This PC</button>
             <button onClick={() => setCurrentPath(['root', 'docs'])} className="flex items-center gap-2 w-full px-2 py-1.5 rounded hover:bg-gray-200 text-sm text-gray-700"><FileText size={16}/> Documents</button>
             <button onClick={() => setCurrentPath(['root', 'pics'])} className="flex items-center gap-2 w-full px-2 py-1.5 rounded hover:bg-gray-200 text-sm text-gray-700"><Image size={16}/> Pictures</button>
           </div>
        </div>

        <div className="flex-1 p-4 overflow-y-auto">
           {currentFolder?.children?.length === 0 && (
             <div className="flex flex-col items-center justify-center h-full text-gray-400">
               <Folder size={48} className="mb-2 opacity-20"/>
               <span className="text-sm">This folder is empty</span>
             </div>
           )}
           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {currentFolder?.children?.map(childId => {
                const child = fs[childId];
                if (!child) return null;
                return (
                  <div 
                    key={childId}
                    onDoubleClick={() => child.type === 'folder' ? navigateTo(childId) : openFile(childId)}
                    className="group flex flex-col items-center p-2 rounded hover:bg-blue-50 border border-transparent hover:border-blue-100 cursor-pointer transition-colors"
                  >
                    <div className="mb-2 text-blue-500">
                      {child.type === 'folder' ? <Folder size={40} className="fill-blue-500/20"/> : <FileText size={40} className="text-gray-500 fill-gray-100"/>}
                    </div>
                    <span className="text-xs text-center text-gray-700 truncate w-full px-1 group-hover:text-blue-700">{child.name}</span>
                  </div>
                );
              })}
           </div>
        </div>
      </div>
      
      <div className="bg-white border-t px-2 py-1 text-xs text-gray-500">
         {currentFolder?.children?.length} items
      </div>
    </div>
  );
};

// 5. Browser
const Browser = () => {
  const [url, setUrl] = useState('https://en.wikipedia.org/wiki/Main_Page');
  const [inputUrl, setInputUrl] = useState(url);
  const [iframeUrl, setIframeUrl] = useState(url);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleNavigate = (e?: React.FormEvent) => {
    e?.preventDefault();
    let target = inputUrl;
    if (!target.startsWith('http')) target = 'https://' + target;
    setUrl(target);
    setInputUrl(target);
    setLoading(true);
    setError(false);
    
    // Allow UI update before reload
    setTimeout(() => {
       setIframeUrl(target);
       setLoading(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center gap-2 p-2 border-b bg-gray-100 shadow-sm">
        <div className="flex gap-1">
          <button className="p-1.5 hover:bg-gray-200 rounded-full text-gray-600"><ChevronLeft size={16}/></button>
          <button className="p-1.5 hover:bg-gray-200 rounded-full text-gray-600"><ChevronRight size={16}/></button>
          <button onClick={() => handleNavigate()} className="p-1.5 hover:bg-gray-200 rounded-full text-gray-600"><RefreshCw size={14} className={loading ? "animate-spin" : ""}/></button>
        </div>
        <form onSubmit={handleNavigate} className="flex-1">
           <div className="relative flex items-center w-full group">
             <Globe size={14} className="absolute left-3 text-gray-400 group-focus-within:text-blue-500"/>
             <input 
               className="w-full pl-9 pr-3 py-1.5 bg-white border rounded-full text-sm focus:ring-2 ring-blue-200 outline-none shadow-sm transition-all"
               value={inputUrl}
               onChange={e => setInputUrl(e.target.value)}
             />
           </div>
        </form>
        <a href={url} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-gray-200 rounded-full text-gray-600" title="Open in new tab"><ExternalLink size={16}/></a>
        <button className="p-1.5 hover:bg-gray-200 rounded-full text-gray-600"><MoreHorizontal size={16}/></button>
      </div>
      <div className="flex-1 bg-white relative">
        {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                <span className="text-sm text-gray-500">Loading...</span>
            </div>
        )}
        
        {/* Info Banner for CORS */}
        <div className="absolute top-0 w-full bg-yellow-50 border-b border-yellow-100 text-yellow-800 text-xs px-4 py-2 flex items-center justify-between z-20">
           <span className="flex items-center gap-2"><AlertCircle size={14}/> Most websites block being shown in simulated browsers due to security (CORS).</span>
           <span className="font-semibold opacity-70">Try Wikipedia or Bing</span>
        </div>

        <iframe 
          src={iframeUrl} 
          title="browser" 
          className="w-full h-full border-none pt-8"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          onError={() => setError(true)}
        />
      </div>
    </div>
  );
};

const SaveIcon = ({size}: {size: number}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
);

// --- Desktop Components ---

const WindowFrame = ({ 
  window, 
  isActive, 
  onClose, 
  onMinimize, 
  onMaximize, 
  onFocus, 
  onDragStart,
  children 
}: { 
  window: WindowState, 
  isActive: boolean,
  onClose: () => void, 
  onMinimize: () => void, 
  onMaximize: () => void,
  onFocus: () => void,
  onDragStart: (e: React.MouseEvent) => void,
  children: React.ReactNode 
}) => {
  return (
    <div 
      className={`absolute flex flex-col bg-white rounded-lg overflow-hidden transition-shadow duration-200 ${isActive ? 'shadow-2xl ring-1 ring-black/5' : 'shadow-md opacity-95'}`}
      style={{ 
        left: window.position.x, 
        top: window.position.y, 
        width: window.size.width, 
        height: window.size.height,
        zIndex: window.zIndex,
        display: window.isMinimized ? 'none' : 'flex'
      }}
      onMouseDown={onFocus}
    >
      {/* Title Bar - Draggable Area */}
      <div 
        className={`h-9 flex items-center justify-between px-3 select-none shrink-0 border-b cursor-default ${isActive ? 'bg-white' : 'bg-gray-50'}`}
        onMouseDown={(e) => {
           // Only drag if not clicking buttons
           if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.title-text')) {
             onDragStart(e);
           }
        }}
      >
        <div className="flex items-center gap-3 text-sm font-medium text-gray-700 title-text pointer-events-none">
          <div className="text-gray-500">{window.icon}</div>
          <span>{window.title}</span>
        </div>
        <div className="flex items-center gap-1 z-10">
           <button onClick={(e) => { e.stopPropagation(); onMinimize(); }} className="p-1.5 hover:bg-gray-200 rounded transition-colors text-gray-600"><Minus size={14}/></button>
           <button onClick={(e) => { e.stopPropagation(); onMaximize(); }} className="p-1.5 hover:bg-gray-200 rounded transition-colors text-gray-600"><Square size={12}/></button>
           <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="p-1.5 hover:bg-red-500 hover:text-white rounded transition-colors text-gray-600"><X size={14}/></button>
        </div>
      </div>
      {/* Content */}
      <div className="flex-1 relative overflow-hidden">
        {children}
      </div>
    </div>
  );
};

const StartMenu = ({ isOpen, onClose, launchApp }: { isOpen: boolean, onClose: () => void, launchApp: (id: AppID) => void }) => {
  if (!isOpen) return null;
  return (
    <div className="absolute bottom-14 left-1/2 -translate-x-1/2 w-[600px] h-[650px] bg-win-glass backdrop-blur-xl rounded-lg shadow-2xl border border-white/20 flex flex-col p-6 z-[9999] animate-in slide-in-from-bottom-10 fade-in duration-200" onClick={(e) => e.stopPropagation()}>
      <div className="mb-4 relative">
         <Search className="absolute left-3 top-2.5 text-gray-500" size={18}/>
         <input className="w-full bg-white/50 border border-gray-300/50 rounded py-2 pl-10 pr-4 placeholder-gray-600 focus:bg-white focus:ring-2 ring-blue-400 outline-none transition-all" placeholder="Type here to search" autoFocus />
      </div>
      
      <div className="flex-1 overflow-y-auto pr-2">
         <div className="flex justify-between items-center mb-4">
           <span className="font-semibold text-gray-800">Pinned</span>
           <button className="text-xs bg-white/50 px-2 py-1 rounded border shadow-sm">All apps &gt;</button>
         </div>
         
         <div className="grid grid-cols-6 gap-4 mb-8">
            {[
              { id: AppID.BROWSER, name: 'Edge', icon: <Globe className="text-blue-500" size={28}/> },
              { id: AppID.FILES, name: 'Files', icon: <Folder className="text-yellow-500" size={28}/> },
              { id: AppID.NOTEPAD, name: 'Notepad', icon: <FileText className="text-blue-400" size={28}/> },
              { id: AppID.TERMINAL, name: 'Terminal', icon: <Terminal className="text-gray-800" size={28}/> },
              { id: AppID.CODE, name: 'VS Code', icon: <Code className="text-blue-600" size={28}/> },
              { id: AppID.PAINT, name: 'Paint', icon: <Palette className="text-purple-500" size={28}/> },
              { id: AppID.SETTINGS, name: 'Settings', icon: <Settings className="text-gray-600" size={28}/> },
              { id: AppID.GEMINI, name: 'Gemini', icon: <Bot className="text-blue-600" size={28}/> },
            ].map(app => (
              <button key={app.id} onClick={() => { launchApp(app.id); onClose(); }} className="flex flex-col items-center gap-2 p-2 hover:bg-white/50 rounded transition-colors group">
                 <div className="p-2 bg-white rounded shadow-sm group-hover:scale-110 transition-transform duration-200">{app.icon}</div>
                 <span className="text-xs text-gray-700 font-medium">{app.name}</span>
              </button>
            ))}
         </div>

         <div className="flex justify-between items-center mb-4">
           <span className="font-semibold text-gray-800">Recommended</span>
           <button className="text-xs bg-white/50 px-2 py-1 rounded border shadow-sm">More &gt;</button>
         </div>
         <div className="space-y-2">
            <div className="flex items-center gap-3 p-2 hover:bg-white/50 rounded cursor-pointer">
               <FileText size={20} className="text-blue-500"/>
               <div className="flex flex-col">
                 <span className="text-xs font-medium text-gray-800">Resume.txt</span>
                 <span className="text-[10px] text-gray-500">Recently opened</span>
               </div>
            </div>
         </div>
      </div>

      <div className="pt-4 border-t border-gray-300/30 flex justify-between items-center">
         <div className="flex items-center gap-3 hover:bg-white/40 p-2 rounded cursor-pointer transition-colors">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs">AD</div>
            <span className="text-sm font-medium text-gray-800">Admin User</span>
         </div>
         <button className="p-2 hover:bg-red-500 hover:text-white rounded transition-colors text-gray-600"><PowerButton/></button>
      </div>
    </div>
  );
};

const PowerButton = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>
);

// --- Main App ---

export default function App() {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [nextZIndex, setNextZIndex] = useState(10);
  const [fs, setFs] = useState<FileSystemState>(INITIAL_FS);
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  
  // Drag State
  const [dragState, setDragState] = useState<{ id: string, offsetX: number, offsetY: number } | null>(null);

  // Handle Global Mouse Events for Dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (dragState) {
         setWindows(prev => prev.map(w => {
           if (w.id === dragState.id && !w.isMaximized) {
             return {
               ...w,
               position: {
                 x: e.clientX - dragState.offsetX,
                 y: e.clientY - dragState.offsetY
               }
             };
           }
           return w;
         }));
      }
    };

    const handleMouseUp = () => {
      setDragState(null);
    };

    if (dragState) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState]);

  const handleDragStart = (e: React.MouseEvent, id: string, currentPos: Position) => {
    setDragState({
      id,
      offsetX: e.clientX - currentPos.x,
      offsetY: e.clientY - currentPos.y
    });
    bringToFront(id);
  };

  // Launch App Logic
  const launchApp = (appId: AppID, fileId?: string) => {
    const id = generateId();
    let title = 'Application';
    let icon = <Square size={16}/>;
    let size = { width: 800, height: 600 };
    
    // Define App Properties
    switch (appId) {
      case AppID.NOTEPAD:
        title = fileId ? fs[fileId].name : 'Notepad';
        icon = <FileText size={16} className="text-blue-400"/>;
        size = { width: 600, height: 400 };
        break;
      case AppID.CODE:
        title = fileId ? fs[fileId].name : 'VS Code';
        icon = <Code size={16} className="text-blue-600"/>;
        size = { width: 900, height: 600 };
        break;
      case AppID.TERMINAL:
        title = 'Terminal';
        icon = <Terminal size={16} className="text-gray-800"/>;
        size = { width: 700, height: 450 };
        break;
      case AppID.BROWSER:
        title = 'Edge Browser';
        icon = <Globe size={16} className="text-blue-500"/>;
        size = { width: 1000, height: 700 };
        break;
      case AppID.FILES:
        title = 'File Explorer';
        icon = <Folder size={16} className="text-yellow-500"/>;
        size = { width: 800, height: 500 };
        break;
      case AppID.PAINT:
        title = 'Paint';
        icon = <Palette size={16} className="text-purple-500"/>;
        size = { width: 800, height: 600 };
        break;
      case AppID.GEMINI:
        title = 'Gemini Assistant';
        icon = <Bot size={16} className="text-blue-500"/>;
        size = { width: 400, height: 600 };
        break;
      default:
        break;
    }

    const newWindow: WindowState = {
      id,
      appId,
      title,
      icon,
      isOpen: true,
      isMinimized: false,
      isMaximized: false,
      zIndex: nextZIndex,
      position: { x: 50 + (windows.length % 10) * 30, y: 50 + (windows.length % 10) * 30 },
      size,
      fileId
    };

    setWindows([...windows, newWindow]);
    setActiveId(id);
    setNextZIndex(prev => prev + 1);
    setStartMenuOpen(false);
  };

  const closeWindow = (id: string) => {
    setWindows(windows.filter(w => w.id !== id));
    if (activeId === id) setActiveId(null);
  };

  const minimizeWindow = (id: string) => {
    setWindows(windows.map(w => w.id === id ? { ...w, isMinimized: true } : w));
    if (activeId === id) setActiveId(null);
  };

  const maximizeWindow = (id: string) => {
    setWindows(windows.map(w => w.id === id ? { 
      ...w, 
      isMaximized: !w.isMaximized,
      position: !w.isMaximized ? { x: 0, y: 0 } : { x: 100, y: 100 },
      size: !w.isMaximized ? { width: window.innerWidth, height: window.innerHeight - 48 } : { width: 800, height: 600 }
    } : w));
    bringToFront(id);
  };

  const bringToFront = (id: string) => {
    setWindows(windows.map(w => w.id === id ? { ...w, zIndex: nextZIndex } : w));
    setNextZIndex(prev => prev + 1);
    setActiveId(id);
  };

  const saveFile = (id: string, content: string) => {
    setFs(prev => ({
      ...prev,
      [id]: { ...prev[id], content }
    }));
  };

  // Render content inside window based on AppID
  const renderWindowContent = (win: WindowState) => {
    switch (win.appId) {
      case AppID.TERMINAL: return <TerminalApp fs={fs} setFs={setFs} />;
      case AppID.NOTEPAD: return <Editor fileId={win.fileId} fs={fs} onSave={saveFile} mode="text" />;
      case AppID.CODE: return <Editor fileId={win.fileId} fs={fs} onSave={saveFile} mode="code" />;
      case AppID.PAINT: return <PaintApp />;
      case AppID.FILES: return <FileExplorer fs={fs} openFile={(fid) => launchApp(AppID.NOTEPAD, fid)} />;
      case AppID.BROWSER: return <Browser />;
      case AppID.GEMINI: return <div className="p-4 text-center">Gemini Integration Coming Soon...</div>;
      default: return <div className="p-4">App content not found</div>;
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col select-none relative text-sm">
      {/* Desktop Area */}
      <div className="flex-1 relative" onClick={() => setStartMenuOpen(false)}>
         
         {/* Desktop Icons - Fixed z-index and interaction */}
         <div className="absolute top-0 left-0 p-4 h-[calc(100%-48px)] flex flex-col flex-wrap gap-2 content-start z-0 pointer-events-none">
            {[
              { id: 'recycle', name: 'Recycle Bin', icon: <Trash2 size={32} className="text-gray-200 drop-shadow-md"/> },
              { id: 'pc', name: 'This PC', icon: <Monitor size={32} className="text-blue-200 drop-shadow-md"/> },
              { id: 'edge', name: 'Microsoft Edge', icon: <Globe size={32} className="text-blue-400 drop-shadow-md"/>, action: () => launchApp(AppID.BROWSER) },
              { id: 'code', name: 'VS Code', icon: <Code size={32} className="text-blue-500 drop-shadow-md"/>, action: () => launchApp(AppID.CODE) },
            ].map(icon => (
              <div 
                key={icon.id} 
                onDoubleClick={icon.action}
                className="pointer-events-auto w-20 flex flex-col items-center gap-1 p-2 rounded hover:bg-white/10 border border-transparent hover:border-white/20 cursor-pointer transition-all group"
              >
                <div className="transform group-hover:scale-105 transition-transform">{icon.icon}</div>
                <span className="text-white text-xs text-center drop-shadow-md line-clamp-2 text-shadow-sm" style={{textShadow: '0 1px 2px rgba(0,0,0,0.8)'}}>{icon.name}</span>
              </div>
            ))}
         </div>

         {/* Windows */}
         {windows.map(win => (
           <WindowFrame
             key={win.id}
             window={win}
             isActive={activeId === win.id}
             onClose={() => closeWindow(win.id)}
             onMinimize={() => minimizeWindow(win.id)}
             onMaximize={() => maximizeWindow(win.id)}
             onFocus={() => bringToFront(win.id)}
             onDragStart={(e) => handleDragStart(e, win.id, win.position)}
           >
             {renderWindowContent(win)}
           </WindowFrame>
         ))}
         
         <StartMenu isOpen={startMenuOpen} onClose={() => setStartMenuOpen(false)} launchApp={launchApp} />
      </div>

      {/* Taskbar */}
      <div className="h-12 bg-[#f3f3f3]/85 backdrop-blur-xl border-t border-white/40 flex items-center justify-between px-2 relative z-[10000] shadow-lg">
         <div className="flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
            <button onClick={(e) => { e.stopPropagation(); setStartMenuOpen(prev => !prev); }} className="p-2 hover:bg-white/50 rounded transition-colors group relative active:scale-95">
               <div className="w-6 h-6 grid grid-cols-2 gap-0.5 group-hover:gap-[3px] transition-all duration-300">
                 <div className="bg-blue-500 rounded-[1px]"></div><div className="bg-blue-500 rounded-[1px]"></div>
                 <div className="bg-blue-500 rounded-[1px]"></div><div className="bg-blue-500 rounded-[1px]"></div>
               </div>
            </button>
            
            {/* Pinned / Open Apps */}
            {[
               { id: AppID.FILES, icon: <Folder className="text-yellow-500"/> },
               { id: AppID.BROWSER, icon: <Globe className="text-blue-500"/> },
               { id: AppID.TERMINAL, icon: <Terminal className="text-gray-700"/> },
               { id: AppID.CODE, icon: <Code className="text-blue-600"/> }
            ].map(app => (
               <button key={app.id} onClick={() => launchApp(app.id)} className="p-2 hover:bg-white/50 rounded transition-colors relative group active:scale-95">
                 {app.icon}
                 {windows.some(w => w.appId === app.id && !w.isMinimized) && <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"></div>}
                 {windows.some(w => w.appId === app.id && w.isMinimized) && <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-0.5 bg-gray-400 rounded-full"></div>}
               </button>
            ))}
         </div>

         {/* System Tray */}
         <div className="ml-auto flex items-center gap-2 h-full">
           <div className="flex items-center gap-1 px-2 hover:bg-white/50 rounded h-[80%] cursor-default transition-colors text-gray-700">
              <ChevronLeft size={12} className="rotate-90"/>
           </div>
           <div className="flex items-center gap-2 px-2 hover:bg-white/50 rounded h-[80%] cursor-default transition-colors text-gray-700">
              <Wifi size={16}/>
              <Volume2 size={16}/>
              <Battery size={16}/>
           </div>
           <Clock />
           <div className="w-1.5 h-full border-l border-gray-300 ml-2 flex items-end justify-center group hover:bg-white/50 cursor-pointer" onClick={() => {
             setWindows(windows.map(w => ({...w, isMinimized: true})));
           }}>
             <span className="text-[10px] opacity-0 group-hover:opacity-100 text-gray-500 mb-2 mr-1">Desktop</span>
           </div>
         </div>
      </div>
    </div>
  );
}