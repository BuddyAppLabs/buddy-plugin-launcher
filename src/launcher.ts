import { exec } from 'child_process';
import { getApps } from './apps';
import { ActionResult, SuperAction, SuperContext } from '@coffic/buddy-it';

/**
 * 搜索匹配的应用程序
 * @param args 搜索参数
 * @returns 匹配的动作列表
 */
export async function searchApps(args: SuperContext): Promise<SuperAction[]> {
    const { keyword = '' } = args;

    if (!keyword.trim()) {
        return [];
    }

    const searchKeyword = keyword.toLowerCase().trim();
    const matchedApps: SuperAction[] = [];

    // 动态获取系统应用列表
    const apps = await getApps();

    // 搜索匹配的应用程序
    for (const app of apps) {
        const isMatch = app.keywords.some(k =>
            k.toLowerCase().includes(searchKeyword) ||
            searchKeyword.includes(k.toLowerCase())
        );

        if (isMatch) {
            matchedApps.push({
                id: `launch_${app.name}`,
                description: `打开 ${app.displayName}`,
            });
        }
    }

    matchedApps.push({
        id: 'total_count',
        description: `共找到 ${matchedApps.length} 个应用`,
    });

    return matchedApps;
}

/**
 * 启动应用程序
 * @param args 执行参数
 * @returns 执行结果
 */
export async function launchApp(args: SuperContext): Promise<ActionResult> {
    const { actionId } = args;

    if (!actionId.startsWith('launch_')) {
        return {
            success: false,
            message: `未知的动作: ${actionId}`
        };
    }

    const appName = actionId.replace('launch_', '');

    // 动态获取系统应用列表
    const apps = await getApps();
    const app = apps.find(a => a.name === appName);

    if (!app) {
        return {
            success: false,
            message: `未找到应用程序: ${appName}`
        };
    }

    return new Promise<ActionResult>((resolve) => {
        exec(app.command, (error) => {
            if (error) {
                resolve({
                    success: false,
                    message: `启动 ${app.displayName} 失败: ${error.message}`
                });
            } else {
                resolve({
                    success: true,
                    message: `成功启动 ${app.displayName}`
                });
            }
        });
    });
}