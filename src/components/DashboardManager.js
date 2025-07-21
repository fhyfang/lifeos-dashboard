// 仪表板管理器
import { CompassDashboard } from './dashboards/CompassDashboard';
import { CockpitDashboard } from './dashboards/CockpitDashboard';
import { FoundationDashboard } from './dashboards/FoundationDashboard';
import { GrowthDashboard } from './dashboards/GrowthDashboard';
import { WeeklyDashboard } from './dashboards/WeeklyDashboard';

export class DashboardManager {
    constructor(notionAPI) {
        this.notionAPI = notionAPI;
        this.dashboards = {
            compass: new CompassDashboard(notionAPI),
            cockpit: new CockpitDashboard(notionAPI),
            foundation: new FoundationDashboard(notionAPI),
            growth: new GrowthDashboard(notionAPI),
            weekly: new WeeklyDashboard(notionAPI)
        };
        this.currentDashboard = 'compass';
    }

    async loadAllDashboards() {
        try {
            // 依次加载各个仪表板
            await this.dashboards.compass.render();
            await this.dashboards.cockpit.render();
            await this.dashboards.foundation.render();
            await this.dashboards.growth.render();
            await this.dashboards.weekly.render();
        } catch (error) {
            console.error('加载仪表板失败:', error);
            throw error;
        }
    }

    async refreshCurrentDashboard() {
        const dashboard = this.dashboards[this.currentDashboard];
        if (dashboard) {
            await dashboard.render();
        }
    }

    setCurrentDashboard(dashboardName) {
        if (this.dashboards[dashboardName]) {
            this.currentDashboard = dashboardName;
        }
    }
}
