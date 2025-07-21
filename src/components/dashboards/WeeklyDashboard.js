// 周报仪表板
import { extractNotionNumber, extractNotionSelect, extractNotionText } from '../../utils/notionHelpers';

export class WeeklyDashboard {
    constructor(notionAPI) {
        this.notionAPI = notionAPI;
        this.snapshotContainer = document.getElementById('week-snapshot');
        this.insightsContainer = document.getElementById('week-insights');
        this.planContainer = document.getElementById('next-week-plan');
    }

    async render() {
        try {
            // 获取本周数据
            const weeklyData = await this.notionAPI.getWeeklyData();

            // 渲染上周数据快照
            this.renderSnapshot(weeklyData);

            // 渲染洞察与反思
            this.renderInsights();

            // 渲染下周规划
            this.renderNextWeekPlan();
        } catch (error) {
            console.error('渲染周报失败:', error);
        }
    }

    renderSnapshot(weeklyData) {
        this.snapshotContainer.innerHTML = '<h3>上周数据快照</h3>';

        const snapshotGrid = document.createElement('div');
        snapshotGrid.className = 'snapshot-grid';

        // 展示各项统计数据
        snapshotGrid.appendChild(this.createSnapshotCard('完成行动数', weeklyData.completedActions.length, '✓'));
        snapshotGrid.appendChild(this.createSnapshotCard('本周心情波动', this.calculateMoodVolatility(weeklyData.emotions).toFixed(1), '🔄'));
        snapshotGrid.appendChild(this.createSnapshotCard('平均睡眠时长', this.calculateAverage(weeklyData.health, '睡眠时长').toFixed(1), '🛌', 'h'));

        this.snapshotContainer.appendChild(snapshotGrid);
    }

    createSnapshotCard(label, value, icon, unit = '') {
        const card = document.createElement('div');
        card.className = 'snapshot-card';

        card.innerHTML = `
            <div class="snapshot-icon">${icon}</div>
            <div class="snapshot-content">
                <div class="snapshot-value">${value}${unit}</div>
                <div class="snapshot-label">${label}</div>
            </div>
        `;

        return card;
    }

    calculateMoodVolatility(emotions) {
        if (emotions.length === 0) return 0;

        const scores = emotions.map(e => extractNotionNumber(e.properties['当前心情评分']));
        const maxScore = Math.max(...scores);
        const minScore = Math.min(...scores);
        return maxScore - minScore;
    }

    calculateAverage(data, property) {
        if (data.length === 0) return 0;

        const sum = data.reduce((total, item) => {
            return total + (extractNotionNumber(item.properties[property]) || 0);
        }, 0);
        return sum / data.length;
    }

    renderInsights() {
        this.insightsContainer.innerHTML = '<h3>洞察与反思</h3>';

        const insightsContent = document.createElement('div');
        insightsContent.className = 'insights-content';

        // 示例内容，可以在此处添加更详细的洞察信息
        insightsContent.innerHTML = `
            <div class="insight">
                <h4>本周最大的成就</h4>
                <p>...</p>
            </div>
            <div class="insight">
                <h4>面临的挑战</h4>
                <p>...</p>
            </div>
        `;

        this.insightsContainer.appendChild(insightsContent);
    }

    renderNextWeekPlan() {
        this.planContainer.innerHTML = '<h3>下周规划</h3>';

        const planContent = document.createElement('div');
        planContent.className = 'plan-content';

        // 示例内容，可以在此处添加具体的下周计划
        planContent.innerHTML = `
            <div class="next-week-focus">
                <h4>下周焦点</h4>
                <ul>
                    <li>...</li>
                    <li>...</li>
                </ul>
            </div>
        `;

        this.planContainer.appendChild(planContent);
    }
}
