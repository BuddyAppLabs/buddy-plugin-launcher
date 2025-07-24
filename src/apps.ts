import { AppConfig } from './types';

// 预定义的应用程序列表
export const apps: AppConfig[] = [
    {
        name: 'vscode',
        displayName: 'Visual Studio Code',
        icon: '💻',
        command: process.platform === 'darwin' ? 'open -a "Visual Studio Code"' : 'code',
        keywords: ['vscode', 'vs', 'code', 'editor', '编辑器']
    },
    {
        name: 'chrome',
        displayName: 'Google Chrome',
        icon: '🌐',
        command: process.platform === 'darwin' ? 'open -a "Google Chrome"' : 'google-chrome',
        keywords: ['chrome', 'browser', '浏览器', '谷歌']
    },
    {
        name: 'finder',
        displayName: 'Finder',
        icon: '📁',
        command: process.platform === 'darwin' ? 'open -a Finder' : 'nautilus',
        keywords: ['finder', 'file', 'folder', '文件', '文件夹', '访达']
    },
    {
        name: 'terminal',
        displayName: 'Terminal',
        icon: '⚡',
        command: process.platform === 'darwin' ? 'open -a Terminal' : 'gnome-terminal',
        keywords: ['terminal', 'shell', 'cmd', '终端', '命令行']
    },
    {
        name: 'calculator',
        displayName: 'Calculator',
        icon: '🧮',
        command: process.platform === 'darwin' ? 'open -a Calculator' : 'gnome-calculator',
        keywords: ['calculator', 'calc', '计算器', '计算']
    },
    {
        name: 'notes',
        displayName: 'Notes',
        icon: '📝',
        command: process.platform === 'darwin' ? 'open -a Notes' : 'gedit',
        keywords: ['notes', 'note', 'memo', '笔记', '备忘录']
    },
    {
        name: 'safari',
        displayName: 'Safari',
        icon: '🧭',
        command: process.platform === 'darwin' ? 'open -a Safari' : 'firefox',
        keywords: ['safari', 'browser', '浏览器', 'web']
    },
    {
        name: 'music',
        displayName: 'Music',
        icon: '🎵',
        command: process.platform === 'darwin' ? 'open -a Music' : 'rhythmbox',
        keywords: ['music', 'audio', 'song', '音乐', '歌曲']
    }
];