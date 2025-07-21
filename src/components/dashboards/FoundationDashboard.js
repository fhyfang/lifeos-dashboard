// 基座分析仪表板
import { Chart } from 'chart.js/auto';
import { extractNotionNumber, extractNotionSelect, extractNotionMultiSelect, extractNotionText } from '../../utils/notionHelpers';
import { formatDate } from '../../utils/dateHelpers';

export class FoundationDashboard {
    constructor(notionAPI) {
        this.notionAPI = notionAPI;
        this.kpiContainer = document.getElementById('foundation-kpi');
        this.emotionContainer = document.getElementById('emotion-analysis');
        this.healthContainer = document.getElementById('health-correlation');
        this.charts = {};
    }

    async render() {
        try {
            // 获取数据
            const healthData = await this.notionAPI.getRecentHealthRecords(30);
            const emotionData = await this.notionAPI.getRecentEmotions(30);
            
            // 渲染 KPI 概览
            this.renderKPIOverview(healthData, emotionData);
            
            // 渲染情绪分析
            this.renderEmotionAnalysis(emotionData);
            
            // 渲染健康关联分析
            this.renderHealthCorrelation(healthData, emotionData);
        } catch (error) {
            console.error('渲染基座分析失败:', error);
        }
    }

    renderKPIOverview(healthData, emotionData) {
        this.kpiContainer.innerHTML = '<h3>核心指标概览</h3>';
        
        const kpiGrid = document.createElement('div');
        kpiGrid.className = 'kpi-grid';
        
        // 计算各项平均值
        const avgEnergy = this.calculateAverage(healthData, '精力水平');
        const avgSleepHours = this.calculateAverage(healthData, '睡眠时长');
        const avgSleepQuality = this.calculateSleepQualityScore(healthData);
        const exerciseFreq = this.calculateExerciseFrequency(healthData);
        const positiveEmotionRate = this.calculatePositiveEmotionRate(emotionData);
        
        // 创建 KPI 卡片
        kpiGrid.appendChild(this.createKPICard('平均精力水平', avgEnergy.toFixed(1), '⚡', '/5'));
        kpiGrid.appendChild(this.createKPICard('平均睡眠时长', avgSleepHours.toFixed(1), '😴', 'h'));
        kpiGrid.appendChild(this.createKPICard('睡眠质量评分', avgSleepQuality.toFixed(1), '🌙', '/5'));
        kpiGrid.appendChild(this.createKPICard('运动频率', `${exerciseFreq}%`, '🏃', ''));
        kpiGrid.appendChild(this.createKPICard('正面情绪占比', `${positiveEmotionRate}%`, '😊', ''));
        
        this.kpiContainer.appendChild(kpiGrid);
    }

    createKPICard(label, value, icon, unit = '') {
        const card = document.createElement('div');
        card.className = 'kpi-card';
        
        card.innerHTML = `
            <div class="kpi-icon">${icon}</div>
            <div class="kpi-content">
                <div class="kpi-value">${value}${unit}</div>
                <div class="kpi-label">${label}</div>
            </div>
        `;
        
        return card;
    }

    calculateAverage(data, propertyName) {
        if (data.length === 0) return 0;
        const sum = data.reduce((total, item) => {
            return total + (extractNotionNumber(item.properties[propertyName]) || 0);
        }, 0);
        return sum / data.length;
    }

    calculateSleepQualityScore(healthData) {
        const qualityMap = {
            '极佳': 5,
            '良好': 4,
            '一般': 3,
            '较差': 2,
            '糟糕': 1
        };
        
        if (healthData.length === 0) return 0;
        
        const sum = healthData.reduce((total, item) => {
            const quality = extractNotionSelect(item.properties['睡眠质量']);
            return total + (qualityMap[quality] || 0);
        }, 0);
        
        return sum / healthData.length;
    }

    calculateExerciseFrequency(healthData) {
        if (healthData.length === 0) return 0;
        const exerciseDays = healthData.filter(item => {
            const exerciseTime = extractNotionNumber(item.properties['运动时长']);
            return exerciseTime > 0;
        }).length;
        return Math.round((exerciseDays / healthData.length) * 100);
    }

    calculatePositiveEmotionRate(emotionData) {
        if (emotionData.length === 0) return 0;
        const positiveCount = emotionData.filter(item => {
            const score = extractNotionNumber(item.properties['当前心情评分']);
            return score >= 6;
        }).length;
        return Math.round((positiveCount / emotionData.length) * 100);
    }

    renderEmotionAnalysis(emotionData) {
        this.emotionContainer.innerHTML = '<h3>情绪深度分析</h3>';
        
        // 情绪触发源分析
        const triggerAnalysis = this.analyzeEmotionTriggers(emotionData);
        this.renderTriggerChart(triggerAnalysis);
        
        // 高效恢复行动排行
        const recoveryActions = this.analyzeRecoveryActions(emotionData);
        this.renderRecoveryRanking(recoveryActions);
    }

    analyzeEmotionTriggers(emotionData) {
        const triggers = {};
        emotionData.forEach(item => {
            const trigger = extractNotionSelect(item.properties['触发类型']);
            if (trigger) {
                triggers[trigger] = (triggers[trigger] || 0) + 1;
            }
        });
        return triggers;
    }

    renderTriggerChart(triggers) {
        const chartContainer = document.createElement('div');
        chartContainer.className = 'chart-container';
        chartContainer.innerHTML = '<h4>情绪触发源分布</h4><canvas id="trigger-chart"></canvas>';
        this.emotionContainer.appendChild(chartContainer);
        
        const ctx = chartContainer.querySelector('#trigger-chart').getContext('2d');
        
        this.charts.triggerChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(triggers),
                datasets: [{
                    data: Object.values(triggers),
                    backgroundColor: [
                        '#FF6384',
                        '#36A2EB',
                        '#FFCE56',
                        '#4BC0C0',
                        '#9966FF',
                        '#FF9F40'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right'
                    }
                }
            }
        });
    }

    analyzeRecoveryActions(emotionData) {
        const actions = {};
        emotionData.forEach(item => {
            const action = extractNotionText(item.properties['恢复行动']);
            const effectiveness = extractNotionNumber(item.properties['行动效果评分']);
            
            if (action && effectiveness) {
                if (!actions[action]) {
                    actions[action] = { count: 0, totalScore: 0 };
                }
                actions[action].count++;
                actions[action].totalScore += effectiveness;
            }
        });
        
        // 计算平均效果
        const actionList = Object.entries(actions).map(([action, data]) => ({
            action,
            avgScore: data.totalScore / data.count,
            count: data.count
        }));
        
        // 按平均效果排序
        return actionList.sort((a, b) => b.avgScore - a.avgScore);
    }

    renderRecoveryRanking(recoveryActions) {
        const rankingContainer = document.createElement('div');
        rankingContainer.className = 'recovery-ranking';
        rankingContainer.innerHTML = '<h4>高效恢复行动排行榜</h4>';
        
        const table = document.createElement('table');
        table.innerHTML = `
            <thead>
                <tr>
                    <th>恢复行动</th>
                    <th>平均效果</th>
                    <th>使用次数</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;
        
        const tbody = table.querySelector('tbody');
        recoveryActions.slice(0, 10).forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.action}</td>
                <td>${item.avgScore.toFixed(1)} ⭐</td>
                <td>${item.count}次</td>
            `;
            tbody.appendChild(row);
        });
        
        rankingContainer.appendChild(table);
        this.emotionContainer.appendChild(rankingContainer);
    }

    renderHealthCorrelation(healthData, emotionData) {
        this.healthContainer.innerHTML = '<h3>健康与精力关联分析</h3>';
        
        // 准备数据
        const correlationData = this.prepareCorrelationData(healthData, emotionData);
        
        // 渲染关联图表
        this.renderCorrelationChart(correlationData);
        
        // 运动效果分析
        this.renderExerciseAnalysis(healthData);
    }

    prepareCorrelationData(healthData, emotionData) {
        // 按日期匹配数据
        const dataByDate = {};
        
        healthData.forEach(item => {
            const date = extractNotionDate(item.properties['日期']);
            if (date) {
                const dateStr = formatDate(date, 'yyyy-MM-dd');
                dataByDate[dateStr] = {
                    ...dataByDate[dateStr],
                    sleepQuality: this.getSleepQualityScore(extractNotionSelect(item.properties['睡眠质量'])),
                    energy: extractNotionNumber(item.properties['精力水平']),
                    sleepHours: extractNotionNumber(item.properties['睡眠时长'])
                };
            }
        });
        
        emotionData.forEach(item => {
            const date = extractNotionDate(item.properties['记录时间']);
            if (date) {
                const dateStr = formatDate(date, 'yyyy-MM-dd');
                const score = extractNotionNumber(item.properties['当前心情评分']);
                if (dataByDate[dateStr]) {
                    if (!dataByDate[dateStr].moods) {
                        dataByDate[dateStr].moods = [];
                    }
                    dataByDate[dateStr].moods.push(score);
                }
            }
        });
        
        // 计算每日平均心情
        Object.values(dataByDate).forEach(data => {
            if (data.moods && data.moods.length > 0) {
                data.avgMood = data.moods.reduce((a, b) => a + b) / data.moods.length;
            }
        });
        
        return Object.entries(dataByDate)
            .filter(([_, data]) => data.sleepQuality && data.energy && data.avgMood)
            .sort(([a], [b]) => a.localeCompare(b));
    }

    getSleepQualityScore(quality) {
        const qualityMap = {
            '极佳': 5,
            '良好': 4,
            '一般': 3,
            '较差': 2,
            '糟糕': 1
        };
        return qualityMap[quality] || 0;
    }

    renderCorrelationChart(correlationData) {
        const chartContainer = document.createElement('div');
        chartContainer.className = 'correlation-chart-container';
        chartContainer.innerHTML = '<h4>睡眠-精力-情绪关联图</h4><canvas id="correlation-chart"></canvas>';
        this.healthContainer.appendChild(chartContainer);
        
        const ctx = chartContainer.querySelector('#correlation-chart').getContext('2d');
        
        const labels = correlationData.map(([date]) => formatDate(date, 'MM-dd'));
        const sleepData = correlationData.map(([_, data]) => data.sleepQuality);
        const energyData = correlationData.map(([_, data]) => data.energy);
        const moodData = correlationData.map(([_, data]) => data.avgMood / 2); // 缩放到5分制
        
        this.charts.correlationChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: '睡眠质量',
                        data: sleepData,
                        borderColor: '#36A2EB',
                        backgroundColor: 'rgba(54, 162, 235, 0.1)',
                        yAxisID: 'y'
                    },
                    {
                        label: '精力水平',
                        data: energyData,
                        borderColor: '#FF6384',
                        backgroundColor: 'rgba(255, 99, 132, 0.1)',
                        yAxisID: 'y'
                    },
                    {
                        label: '平均心情',
                        data: moodData,
                        borderColor: '#FFCE56',
                        backgroundColor: 'rgba(255, 206, 86, 0.1)',
                        yAxisID: 'y'
                    }
                ]
            },
            options: {
                responsive: true,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        min: 0,
                        max: 5
                    }
                }
            }
        });
    }

    renderExerciseAnalysis(healthData) {
        const exerciseContainer = document.createElement('div');
        exerciseContainer.className = 'exercise-analysis';
        exerciseContainer.innerHTML = '<h4>运动-精力-情绪关联分析</h4>';
        
        // 分析运动对精力和情绪的影响
        const exerciseData = healthData.filter(item => {
            const exerciseTime = extractNotionNumber(item.properties['运动时长']);
            return exerciseTime > 0;
        });
        
        const table = document.createElement('table');
        table.innerHTML = `
            <thead>
                <tr>
                    <th>运动类型</th>
                    <th>运动强度</th>
                    <th>运动后感受</th>
                    <th>当日精力</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;
        
        const tbody = table.querySelector('tbody');
        exerciseData.slice(0, 10).forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${extractNotionSelect(item.properties['运动类型'])}</td>
                <td>${extractNotionSelect(item.properties['运动强度'])}</td>
                <td>${extractNotionSelect(item.properties['运动后感受'])}</td>
                <td>${extractNotionNumber(item.properties['精力水平'])} ⭐</td>
            `;
            tbody.appendChild(row);
        });
        
        exerciseContainer.appendChild(table);
        this.healthContainer.appendChild(exerciseContainer);
    }

    destroy() {
        // 销毁所有图表实例
        Object.values(this.charts).forEach(chart => {
            if (chart) {
                chart.destroy();
            }
        });
        this.charts = {};
    }
}
