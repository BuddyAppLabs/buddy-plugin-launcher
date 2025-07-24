import { exec } from 'child_process';
import { promisify } from 'util';
import { AppConfig } from './types';

const execAsync = promisify(exec);

// 应用程序模板配置，用于匹配和生成关键词
const appTemplates: Record<string, Partial<AppConfig>> = {
    'Visual Studio Code': {
        icon: '💻',
        keywords: ['vscode', 'vs', 'code', 'editor', '编辑器']
    },
    'Google Chrome': {
        icon: '🌐',
        keywords: ['chrome', 'browser', '浏览器', '谷歌']
    },
    'Finder': {
        icon: '📁',
        keywords: ['finder', 'file', 'folder', '文件', '文件夹', '访达']
    },
    'Terminal': {
        icon: '⚡',
        keywords: ['terminal', 'shell', 'cmd', '终端', '命令行']
    },
    'Calculator': {
        icon: '🧮',
        keywords: ['calculator', 'calc', '计算器', '计算']
    },
    'Notes': {
        icon: '📝',
        keywords: ['notes', 'note', 'memo', '笔记', '备忘录']
    },
    'Safari': {
        icon: '🧭',
        keywords: ['safari', 'browser', '浏览器', 'web']
    },
    'Music': {
        icon: '🎵',
        keywords: ['music', 'audio', 'song', '音乐', '歌曲']
    },
    'Firefox': {
        icon: '🦊',
        keywords: ['firefox', 'browser', '浏览器', 'web']
    },
    'Slack': {
        icon: '💬',
        keywords: ['slack', 'chat', '聊天', '团队']
    },
    'Discord': {
        icon: '🎮',
        keywords: ['discord', 'chat', '聊天', '游戏']
    },
    'Spotify': {
        icon: '🎶',
        keywords: ['spotify', 'music', '音乐', '播放器']
    },
    'Photoshop': {
        icon: '🎨',
        keywords: ['photoshop', 'ps', '图片', '设计']
    },
    'Figma': {
        icon: '🎯',
        keywords: ['figma', 'design', '设计', 'ui']
    }
};

// 缓存扫描结果
let cachedApps: AppConfig[] | null = null;
let lastScanTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

/**
 * 扫描macOS系统中的应用程序
 */
async function scanMacOSApps(): Promise<AppConfig[]> {
    try {
        const { stdout } = await execAsync('find /Applications -name "*.app" -maxdepth 2 | head -500');
        const appPaths = stdout.trim().split('\n').filter(path => path);

        const apps: AppConfig[] = [];

        for (const appPath of appPaths) {
            const appName = appPath.split('/').pop()?.replace('.app', '') || '';
            if (!appName) continue;

            // 检查应用是否真实存在
            try {
                await execAsync(`test -d "${appPath}"`);
            } catch {
                continue; // 应用不存在，跳过
            }

            const template = appTemplates[appName] || {};
            const config: AppConfig = {
                name: appName.toLowerCase().replace(/\s+/g, '_'),
                displayName: appName,
                icon: template.icon || '📱',
                command: `open -a "${appName}"`,
                keywords: template.keywords || [appName.toLowerCase(), ...appName.toLowerCase().split(' ')]
            };

            apps.push(config);
        }

        return apps;
    } catch (error) {
        console.error('扫描macOS应用失败:', error);
        return [];
    }
}

/**
 * 扫描Linux系统中的应用程序
 */
async function scanLinuxApps(): Promise<AppConfig[]> {
    try {
        const { stdout } = await execAsync('find /usr/share/applications -name "*.desktop" | head -50');
        const desktopFiles = stdout.trim().split('\n').filter(file => file);

        const apps: AppConfig[] = [];

        for (const desktopFile of desktopFiles) {
            try {
                const { stdout: content } = await execAsync(`cat "${desktopFile}"`);
                const nameMatch = content.match(/^Name=(.+)$/m);
                const execMatch = content.match(/^Exec=(.+)$/m);

                if (!nameMatch || !execMatch) continue;

                const appName = nameMatch[1];
                const execCommand = execMatch[1].split(' ')[0]; // 取第一个命令

                // 检查命令是否存在
                try {
                    await execAsync(`which ${execCommand}`);
                } catch {
                    continue; // 命令不存在，跳过
                }

                const template = appTemplates[appName] || {};
                const config: AppConfig = {
                    name: appName.toLowerCase().replace(/\s+/g, '_'),
                    displayName: appName,
                    icon: template.icon || '📱',
                    command: execCommand,
                    keywords: template.keywords || [appName.toLowerCase(), ...appName.toLowerCase().split(' ')]
                };

                apps.push(config);
            } catch (error) {
                continue; // 处理单个应用失败，继续处理下一个
            }
        }

        return apps;
    } catch (error) {
        console.error('扫描Linux应用失败:', error);
        return [];
    }
}

/**
 * 扫描Windows系统中的应用程序
 */
async function scanWindowsApps(): Promise<AppConfig[]> {
    try {
        // 扫描开始菜单中的应用
        const { stdout } = await execAsync('powershell "Get-StartApps | Select-Object Name, AppID | ConvertTo-Json"');
        const startApps = JSON.parse(stdout);

        const apps: AppConfig[] = [];
        const appsArray = Array.isArray(startApps) ? startApps : [startApps];

        for (const app of appsArray.slice(0, 50)) {
            if (!app.Name || !app.AppID) continue;

            const template = appTemplates[app.Name] || {};
            const config: AppConfig = {
                name: app.Name.toLowerCase().replace(/\s+/g, '_'),
                displayName: app.Name,
                icon: template.icon || '📱',
                command: `start "" "${app.AppID}"`,
                keywords: template.keywords || [app.Name.toLowerCase(), ...app.Name.toLowerCase().split(' ')]
            };

            apps.push(config);
        }

        return apps;
    } catch (error) {
        console.error('扫描Windows应用失败:', error);
        return [];
    }
}

/**
 * 动态扫描系统应用程序
 */
export async function scanSystemApps(): Promise<AppConfig[]> {
    const now = Date.now();

    // 如果缓存有效，直接返回缓存结果
    if (cachedApps && (now - lastScanTime) < CACHE_DURATION) {
        return cachedApps;
    }

    let apps: AppConfig[] = [];

    switch (process.platform) {
        case 'darwin':
            apps = await scanMacOSApps();
            break;
        case 'linux':
            apps = await scanLinuxApps();
            break;
        case 'win32':
            apps = await scanWindowsApps();
            break;
        default:
            console.warn(`不支持的操作系统: ${process.platform}`);
            return [];
    }

    // 更新缓存
    cachedApps = apps;
    lastScanTime = now;

    return apps;
}

/**
 * 获取应用程序列表（兼容旧接口）
 */
export async function getApps(): Promise<AppConfig[]> {
    return await scanSystemApps();
}