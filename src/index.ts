import { SuperContext, SuperPlugin } from '@coffic/buddy-it';
import { searchApps, launchApp } from './launcher';

// 应用启动器插件
const plugin: SuperPlugin = {
    name: '应用启动器',
    description: '快速启动系统应用程序',
    version: '1.0.0',
    author: 'Coffic',
    id: '',
    path: '',
    type: 'user',

    async getActions(args: SuperContext) {
        return searchApps(args);
    },

    async executeAction(args: SuperContext) {
        return launchApp(args);
    },
};

// 导出插件
export = plugin; 