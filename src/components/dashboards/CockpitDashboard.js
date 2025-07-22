// 执行驾驶舱仪表板
import { extractNotionText, extractNotionNumber, extractNotionDate, extractNotionSelect, getStarRating } from '../../utils/notionHelpers';
import { formatDate, isToday } from '../../utils/dateHelpers';

export class CockpitDashboard {
    constructor(notionAPI) {
        this.notionAPI = notionAPI;
        this.actionsContainer = document.getElementById('actions-container');
        this.vitalsContainer = document.getElementById('vitals-container');
        this.quickEntryContainer = document.getElementById('quick-entry-container');
    }

    async render() {
        try {
            // 渲染今日行动
            await this.renderTodayActions();
            
            // 渲染生命体征
            await this.renderVitals();
            
            // 渲染快速入口和日志流
            await this.renderQuickEntry();
        } catch (error) {
            console.error('渲染执行驾驶舱失败:', error);
        }
    }

    async renderTodayActions() {
        const actions = await this.notionAPI.getTodayActions();
        
        this.actionsContainer.innerHTML = '<h3>今日行动</h3>';
        
        if (actions.length === 0) {
            this.actionsContainer.innerHTML += '<p class="empty-state">今日暂无待办事项</p>';
            return;
        }
        
        const actionsList = document.createElement('div');
        actionsList.className = 'actions-list';
        
        actions.forEach(action => {
            const actionItem = this.createActionItem(action);
            actionsList.appendChild(actionItem);
        });
        
        this.actionsContainer.appendChild(actionsList);
    }

    createActionItem(action) {
        const item = document.createElement('div');
        item.className = 'action-item';
        
        const title = extractNotionText(action.properties['行动描述']);
        const priority = action.properties['优先级']?.select?.name || '';
        const energyRequired = extractNotionSelect(action.properties['能量要求']);
        const deadline = extractNotionDate(action.properties['截止日期']);
        const estimatedTime = extractNotionNumber(action.properties['预估时长']);
        
        const priorityClass = this.getPriorityClass(priority);
        const energyIcon = this.getEnergyIcon(energyRequired);
        
        item.innerHTML = `
            <div class="action-header">
                <input type="checkbox" class="action-checkbox" data-id="${action.id}">
                <span class="action-title">${title}</span>
                <span class="action-priority ${priorityClass}">${priority}</span>
            </div>
            <div class="action-meta">
                <span class="action-energy">${energyIcon} ${energyRequired}</span>
                <span class="action-time">⏱ ${estimatedTime}h</span>
                <span class="action-deadline">📅 ${formatDate(deadline, 'MM-dd')}</span>
            </div>
        `;
        
        // 添加完成事件
        const checkbox = item.querySelector('.action-checkbox');
        checkbox.addEventListener('change', () => this.handleActionComplete(action.id));
        
        return item;
    }

    getPriorityClass(priority) {
        const priorityMap = {
            'P1必须完成': 'priority-urgent',
            'P2应该完成': 'priority-important',
            'P3可以完成': 'priority-normal',
            'P4有空再做': 'priority-optional'
        };
        return priorityMap[priority] || 'priority-normal';
    }

    getEnergyIcon(energy) {
        const energyMap = {
            '高能量(深度专注)': '🔥',
            '中能量(常规任务)': '⚡',
            '低能量(机械琐碎)': '🌱'
        };
        return energyMap[energy] || '⚡';
    }

    async handleActionComplete(actionId) {
        try {
            await this.notionAPI.updatePage(actionId, {
                '状态': {
                    select: {
                        name: '已完成'
                    }
                },
                '完成日期': {
                    date: {
                        start: new Date().toISOString()
                    }
                }
            });
            
            // 刷新显示
            await this.renderTodayActions();
        } catch (error) {
            console.error('更新行动状态失败:', error);
        }
    }

    async renderVitals() {
        // 获取今日的各项数据
        const todayLogs = await this.notionAPI.getTodayLogs();
        const recentEmotions = await this.notionAPI.getRecentEmotions(1);
        const recentHealth = await this.notionAPI.getRecentHealthRecords(1);
        
        this.vitalsContainer.innerHTML = '<h3>生命体征</h3>';
        
        const vitalsGrid = document.createElement('div');
        vitalsGrid.className = 'vitals-grid';
        
        // 今日心情
        const latestEmotion = recentEmotions[0];
        // 当前心情评分是Select类型，值为"1分/2分/3分/4分/5分"
        const moodScoreText = latestEmotion ? extractNotionSelect(latestEmotion.properties['当前心情评分']) : '0分';
        const moodScore = parseInt(moodScoreText.replace('分', '')) || 0;
        vitalsGrid.appendChild(this.createVitalCard('今日心情', getStarRating(moodScore, 5), this.getMoodEmoji(moodScore)));
        
        // 今日精力
        const latestHealth = recentHealth[0];
        // 精力水平是Rich Text类型
        const energyLevelText = latestHealth ? extractNotionText(latestHealth.properties['精力水平']) : '0';
        const energyLevel = parseFloat(energyLevelText) || 0;
        vitalsGrid.appendChild(this.createVitalCard('今日精力', getStarRating(energyLevel), '⚡'));
        
        // 睡眠质量
        // 睡眠质量评分字段是Rich Text类型
        const sleepQualityText = latestHealth ? extractNotionText(latestHealth.properties['睡眠评分']) : '0';
        const sleepQuality = `${sleepQualityText}分`;
        vitalsGrid.appendChild(this.createVitalCard('睡眠质量', sleepQuality, '😴'));
        
        // 今日专注时长
        const focusHours = this.calculateTodayFocusHours(todayLogs);
        vitalsGrid.appendChild(this.createVitalCard('专注时长', `${focusHours.toFixed(1)}h`, '🎯'));
        
        this.vitalsContainer.appendChild(vitalsGrid);
    }

    createVitalCard(label, value, icon) {
        const card = document.createElement('div');
        card.className = 'vital-card';
        
        card.innerHTML = `
            <div class="vital-icon">${icon}</div>
            <div class="vital-content">
                <div class="vital-label">${label}</div>
                <div class="vital-value">${value}</div>
            </div>
        `;
        
        return card;
    }

    getMoodEmoji(score) {
        if (score >= 8) return '😊';
        if (score >= 6) return '🙂';
        if (score >= 4) return '😐';
        if (score >= 2) return '😔';
        return '😞';
    }

    calculateTodayFocusHours(logs) {
        return logs.reduce((total, log) => {
            // 实际时长（分钟）是Rich Text类型
            const durationText = extractNotionText(log.properties['实际时长（分钟）']) || '0';
            const duration = parseFloat(durationText) / 60 || 0; // 转换为小时
            const focusQuality = extractNotionNumber(log.properties['专注质量']) || 0;
            // 只计算专注质量>=3的时间
            if (focusQuality >= 3) {
                return total + duration;
            }
            return total;
        }, 0);
    }

    async renderQuickEntry() {
        this.quickEntryContainer.innerHTML = '<h3>快速入口 & 日志流</h3>';
        
        // 快速入口按钮
        const quickButtons = document.createElement('div');
        quickButtons.className = 'quick-buttons';
        
        const buttons = [
            { icon: '➕', label: '新建行动', action: 'action' },
            { icon: '😊', label: '记录情绪', action: 'emotion' },
            { icon: '💪', label: '健康打卡', action: 'health' },
            { icon: '📝', label: '每日日志', action: 'log' },
            { icon: '💡', label: '添加知识', action: 'knowledge' },
            { icon: '🔄', label: '成长复盘', action: 'review' }
        ];
        
        buttons.forEach(btn => {
            const button = document.createElement('button');
            button.className = 'quick-button';
            button.innerHTML = `<span class="button-icon">${btn.icon}</span><span class="button-label">${btn.label}</span>`;
            button.addEventListener('click', () => this.handleQuickAction(btn.action));
            quickButtons.appendChild(button);
        });
        
        this.quickEntryContainer.appendChild(quickButtons);
        
        // 今日日志流
        await this.renderTodayLogs();
    }

    async renderTodayLogs() {
        const logs = await this.notionAPI.getTodayLogs();
        
        const logsSection = document.createElement('div');
        logsSection.className = 'today-logs';
        logsSection.innerHTML = '<h4>今日时间线</h4>';
        
        if (logs.length === 0) {
            logsSection.innerHTML += '<p class="empty-state">今日暂无日志记录</p>';
        } else {
            const timeline = document.createElement('div');
            timeline.className = 'logs-timeline';
            
            // 按时间排序
            logs.sort((a, b) => {
                const timeA = extractNotionDate(a.properties['开始时间']);
                const timeB = extractNotionDate(b.properties['开始时间']);
                return new Date(timeA) - new Date(timeB);
            });
            
            logs.forEach(log => {
                const logItem = this.createLogItem(log);
                timeline.appendChild(logItem);
            });
            
            logsSection.appendChild(timeline);
        }
        
        this.quickEntryContainer.appendChild(logsSection);
    }

    createLogItem(log) {
        const item = document.createElement('div');
        item.className = 'log-item';
        
        const activity = extractNotionText(log.properties['活动名称']);
        const startTime = extractNotionDate(log.properties['开始时间']);
        // 实际时长（分钟）是Rich Text类型
        const durationText = extractNotionText(log.properties['实际时长（分钟）']) || '0';
        const duration = parseFloat(durationText) / 60 || 0; // 转换为小时
        const category = extractNotionSelect(log.properties['活动类别']);
        const value = extractNotionNumber(log.properties['价值评分']);
        
        item.innerHTML = `
            <div class="log-time">${formatDate(startTime, 'HH:mm')}</div>
            <div class="log-content">
                <div class="log-activity">${activity}</div>
                <div class="log-meta">
                    <span class="log-category tag tag-${category}">${category}</span>
                    <span class="log-duration">${duration.toFixed(1)}h</span>
                    <span class="log-value">${getStarRating(value)}</span>
                </div>
            </div>
        `;
        
        return item;
    }

    handleQuickAction(action) {
        // 这里可以实现打开 Notion 相应页面或显示快速输入表单
        console.log(`Quick action: ${action}`);
        // 实际实现时可以使用 Notion API 创建新页面或显示模态框
    }
}
