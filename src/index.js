// 主入口文件
import './styles/main.css';
import { NotionAPI } from './api/notion';
import { DashboardManager } from './components/DashboardManager';
import { CountdownTimer } from './components/CountdownTimer';
import { NavigationManager } from './components/NavigationManager';
import { calculateDaysRemaining } from './utils/dateHelpers';

// 初始化应用
class App {
    constructor() {
        this.notionAPI = new NotionAPI();
        this.dashboardManager = new DashboardManager(this.notionAPI);
        this.navigationManager = new NavigationManager();
        this.countdownTimer = new CountdownTimer();
    }

    async init() {
        try {
            // 显示加载提示
            this.showLoading(true);

            // 初始化倒计时
            this.initCountdown();

            // 初始化导航
            this.navigationManager.init();

            // 加载所有仪表板数据
            await this.dashboardManager.loadAllDashboards();

            // 隐藏加载提示
            this.showLoading(false);

            // 设置定时刷新（每5分钟）
            this.setupAutoRefresh();

        } catch (error) {
            console.error('应用初始化失败:', error);
            this.showError('初始化失败，请检查网络连接和配置');
        }
    }

    initCountdown() {
        // 设置未来10000天倒计时
        const targetDays = 10000;
        const daysRemaining = calculateDaysRemaining(targetDays);
        this.countdownTimer.updateCountdown(daysRemaining);
    }

    setupAutoRefresh() {
        // 每5分钟自动刷新数据
        setInterval(async () => {
            try {
                await this.dashboardManager.refreshCurrentDashboard();
            } catch (error) {
                console.error('自动刷新失败:', error);
            }
        }, 5 * 60 * 1000);
    }

    showLoading(show) {
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            loadingElement.style.display = show ? 'flex' : 'none';
        }
    }

    showError(message) {
        // 创建错误提示
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);

        // 3秒后自动移除
        setTimeout(() => {
            errorDiv.remove();
        }, 3000);
    }
}

// 当DOM加载完成后启动应用
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});
