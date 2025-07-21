// 战略罗盘仪表板
import { extractNotionText, extractNotionNumber } from '../../utils/notionHelpers';

export class CompassDashboard {
    constructor(notionAPI) {
        this.notionAPI = notionAPI;
        this.valuesContainer = document.getElementById('values-container');
        this.goalsContainer = document.getElementById('goals-container');
        this.investmentContainer = document.getElementById('investment-container');
    }

    async render() {
        try {
            // 加载并渲染价值观
            await this.renderValues();
            
            // 加载并渲染目标
            await this.renderGoals();
            
            // 加载并渲染投入分析
            await this.renderInvestment();
        } catch (error) {
            console.error('渲染战略罗盘失败:', error);
        }
    }

    async renderValues() {
        const values = await this.notionAPI.getCoreValues();
        
        this.valuesContainer.innerHTML = '<h3>我的核心价值观</h3>';
        
        const valuesGrid = document.createElement('div');
        valuesGrid.className = 'values-grid';
        
        values.forEach(value => {
            const card = this.createValueCard(value);
            valuesGrid.appendChild(card);
        });
        
        this.valuesContainer.appendChild(valuesGrid);
    }

    createValueCard(value) {
        const card = document.createElement('div');
        card.className = 'value-card';
        
        const title = extractNotionText(value.properties['价值观名称']);
        const description = extractNotionText(value.properties['核心描述']);
        const priority = extractNotionNumber(value.properties['优先级']);
        
        card.innerHTML = `
            <div class="value-priority">优先级 ${priority}</div>
            <h4 class="value-title">${title}</h4>
            <p class="value-description">${description}</p>
        `;
        
        return card;
    }

    async renderGoals() {
        const goals = await this.notionAPI.getActiveGoals();
        const projects = await this.notionAPI.getActiveProjects();
        
        this.goalsContainer.innerHTML = '<h3>本季/本年核心目标</h3>';
        
        const table = document.createElement('table');
        table.className = 'goals-table';
        
        // 表头
        table.innerHTML = `
            <thead>
                <tr>
                    <th>目标名称</th>
                    <th>领域</th>
                    <th>关联项目</th>
                    <th>进度</th>
                </tr>
            </thead>
            <tbody id="goals-tbody"></tbody>
        `;
        
        const tbody = table.querySelector('#goals-tbody');
        
        goals.forEach(goal => {
            const row = this.createGoalRow(goal, projects);
            tbody.appendChild(row);
        });
        
        this.goalsContainer.appendChild(table);
    }

    createGoalRow(goal, projects) {
        const row = document.createElement('tr');
        
        const name = extractNotionText(goal.properties['目标名称']);
        const domain = goal.properties['领域']?.select?.name || '';
        const relatedProjects = this.getRelatedProjects(goal.id, projects);
        const progress = this.calculateGoalProgress(relatedProjects);
        
        row.innerHTML = `
            <td>${name}</td>
            <td><span class="tag tag-${domain}">${domain}</span></td>
            <td>${relatedProjects.map(p => extractNotionText(p.properties['项目名称'])).join(', ')}</td>
            <td>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                    <span class="progress-text">${progress}%</span>
                </div>
            </td>
        `;
        
        return row;
    }

    getRelatedProjects(goalId, projects) {
        return projects.filter(project => {
            const relatedGoals = project.properties['关联目标']?.relation || [];
            return relatedGoals.some(rel => rel.id === goalId);
        });
    }

    calculateGoalProgress(projects) {
        if (projects.length === 0) return 0;
        
        const totalProgress = projects.reduce((sum, project) => {
            const progress = extractNotionNumber(project.properties['项目进度']) || 0;
            return sum + progress;
        }, 0);
        
        return Math.round(totalProgress / projects.length);
    }

    async renderInvestment() {
        const projects = await this.notionAPI.getActiveProjects();
        const weeklyLogs = await this.notionAPI.getWeeklyData();
        
        this.investmentContainer.innerHTML = '<h3>目标投入仪表盘</h3>';
        
        const investmentGrid = document.createElement('div');
        investmentGrid.className = 'investment-grid';
        
        projects.forEach(project => {
            const card = this.createInvestmentCard(project, weeklyLogs.logs);
            investmentGrid.appendChild(card);
        });
        
        this.investmentContainer.appendChild(investmentGrid);
    }

    createInvestmentCard(project, logs) {
        const card = document.createElement('div');
        card.className = 'investment-card';
        
        const projectName = extractNotionText(project.properties['项目名称']);
        const weeklyHours = this.calculateWeeklyHours(project.id, logs);
        const progress = extractNotionNumber(project.properties['项目进度']) || 0;
        
        card.innerHTML = `
            <h4>${projectName}</h4>
            <div class="investment-stats">
                <div class="stat">
                    <span class="stat-label">本周投入</span>
                    <span class="stat-value">${weeklyHours.toFixed(1)}h</span>
                </div>
                <div class="stat">
                    <span class="stat-label">项目进度</span>
                    <span class="stat-value">${progress}%</span>
                </div>
            </div>
        `;
        
        return card;
    }

    calculateWeeklyHours(projectId, logs) {
        return logs.reduce((total, log) => {
            const relatedProjects = log.properties['关联目标/任务']?.relation || [];
            if (relatedProjects.some(rel => rel.id === projectId)) {
                const duration = extractNotionNumber(log.properties['实际时长']) || 0;
                return total + duration;
            }
            return total;
        }, 0);
    }
}
