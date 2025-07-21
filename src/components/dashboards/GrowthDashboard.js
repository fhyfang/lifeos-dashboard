// 成长引擎仪表板
import { extractNotionNumber, extractNotionText, extractNotionMultiSelect } from '../../utils/notionHelpers';
import { Chart } from 'chart.js/auto';

export class GrowthDashboard {
    constructor(notionAPI) {
        this.notionAPI = notionAPI;
        this.growthEventsContainer = document.getElementById('growth-events');
        this.skillRadarContainer = document.getElementById('skill-radar');
        this.lessonsGalleryContainer = document.getElementById('lessons-gallery');
        this.charts = {};
    }

    async render() {
        try {
            // 获取数据
            const growthReviews = await this.notionAPI.getRecentGrowthReviews();
            
            // 渲染成长事件
            this.renderGrowthEvents(growthReviews);
            
            // 渲染能力提升雷达图
            this.renderSkillRadar(growthReviews);
            
            // 渲染教训名人堂
            this.renderLessonsGallery(growthReviews);
        } catch (error) {
            console.error('渲染成长引擎失败:', error);
        }
    }

    renderGrowthEvents(growthReviews) {
        this.growthEventsContainer.innerHTML = '<h3>成长事件类型分析</h3>';
        
        const eventTypes = {};
        growthReviews.forEach(review => {
            const type = extractNotionText(review.properties['事件类型']);
            if (type) {
                eventTypes[type] = (eventTypes[type] || 0) + 1;
            }
        });

        this.renderEventTypesPieChart(eventTypes);
    }

    renderEventTypesPieChart(eventTypes) {
        const chartContainer = document.createElement('div');
        chartContainer.className = 'chart-container';
        chartContainer.innerHTML = '<h4>事件类型分布</h4><canvas id="event-types-chart"></canvas>';
        this.growthEventsContainer.appendChild(chartContainer);
        
        const ctx = chartContainer.querySelector('#event-types-chart').getContext('2d');

        this.charts.eventTypesChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(eventTypes),
                datasets: [{
                    data: Object.values(eventTypes),
                    backgroundColor: [
                        '#FF6384',
                        '#36A2EB',
                        '#FFCE56',
                        '#4BC0C0',
                        '#9966FF',
                        '#FF9F40'
                    ],
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'right'
                    }
                }
            }
        });
    }

    renderSkillRadar(growthReviews) {
        this.skillRadarContainer.innerHTML = '<h3>能力提升雷达图</h3>';
        
        const skills = {};
        growthReviews.forEach(review => {
            const skillList = extractNotionMultiSelect(review.properties['能力提升']);
            skillList.forEach(skill => {
                skills[skill] = (skills[skill] || 0) + 1;
            });
        });

        this.renderSkillsRadarChart(skills);
    }

    renderSkillsRadarChart(skills) {
        const chartContainer = document.createElement('div');
        chartContainer.className = 'chart-container';
        chartContainer.innerHTML = '<canvas id="skills-radar-chart"></canvas>';
        this.skillRadarContainer.appendChild(chartContainer);
        
        const ctx = chartContainer.querySelector('#skills-radar-chart').getContext('2d');

        this.charts.skillsRadarChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: Object.keys(skills),
                datasets: [{
                    label: '能力提升次数',
                    data: Object.values(skills),
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scale: {
                    angleLines: {
                        display: false
                    },
                    ticks: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    renderLessonsGallery(growthReviews) {
        this.lessonsGalleryContainer.innerHTML = '<h3>教训名人堂</h3>';
        
        const lessons = growthReviews.slice(0, 5).map(review => {
            return {
                title: extractNotionText(review.properties['复盘事件']),
                insights: extractNotionText(review.properties['核心教训']),
                score: extractNotionNumber(review.properties['成长价值'])
            };
        });

        const gallery = document.createElement('div');
        gallery.className = 'lessons-gallery';

        lessons.forEach(lesson => {
            const card = this.createLessonCard(lesson);
            gallery.appendChild(card);
        });

        this.lessonsGalleryContainer.appendChild(gallery);
    }

    createLessonCard(lesson) {
        const card = document.createElement('div');
        card.className = 'lesson-card';

        card.innerHTML = `
            <div class="lesson-title">${lesson.title}</div>
            <div class="lesson-insights">${lesson.insights}</div>
            <div class="lesson-score">成长价值: ${lesson.score} 星级: ${'★'.repeat(lesson.score / 2)}</div>
        `;

        return card;
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
