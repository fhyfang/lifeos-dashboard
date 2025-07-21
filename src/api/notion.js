// Notion API 封装
import { DATABASE_IDS } from '../config/databases';

export class NotionAPI {
    constructor() {
        // 使用代理服务器
        this.apiUrl = window.location.hostname === 'localhost' 
            ? 'http://localhost:3001/api/notion'
            : 'https://lifeos-dashboard.vercel.app/api/notion';
    }

    // 获取数据库内容
    async queryDatabase(databaseId, filter = {}, sorts = []) {
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    method: 'queryDatabase',
                    databaseId,
                    filter,
                    sorts,
                }),
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data.results;
        } catch (error) {
            console.error(`查询数据库 ${databaseId} 失败:`, error);
            throw error;
        }
    }

    // 获取页面详情
    async getPage(pageId) {
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    method: 'getPage',
                    pageId,
                }),
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`获取页面 ${pageId} 失败:`, error);
            throw error;
        }
    }

    // 更新页面
    async updatePage(pageId, properties) {
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    method: 'updatePage',
                    pageId,
                    properties,
                }),
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`更新页面 ${pageId} 失败:`, error);
            throw error;
        }
    }

    // === 具体数据库查询方法 ===

    // 获取核心价值观
    async getCoreValues() {
        // 获取所有价值观数据，前端可以根据优先级筛选
        return await this.queryDatabase(DATABASE_IDS.VALUES);
    }

    // 获取进行中的目标
    async getActiveGoals() {
        // 注意：状态字段是 rollup 类型，不能直接过滤
        // 获取所有目标，在前端进行过滤
        return await this.queryDatabase(DATABASE_IDS.GOALS);
    }

    // 获取进行中的项目
    async getActiveProjects() {
        // 项目的状态字段是 select 类型
        const filter = {
            property: '状态',
            select: {
                equals: '进行中'
            }
        };
        const sorts = [{
            property: '截止日期',
            direction: 'ascending'
        }];
        return await this.queryDatabase(DATABASE_IDS.PROJECTS, filter, sorts);
    }

    // 获取今日待办行动
    async getTodayActions() {
        const today = new Date().toISOString().split('T')[0];
        const filter = {
            and: [
                {
                    property: '状态',
                    status: {
                        equals: '待办'  // 使用中文状态值
                    }
                },
                {
                    property: '截止日期',
                    date: {
                        on_or_before: today
                    }
                }
            ]
        };
        // 暂时不使用优先级排序，因为优先级可能是 select 类型
        const sorts = [{
            property: '截止日期',
            direction: 'ascending'
        }];
        return await this.queryDatabase(DATABASE_IDS.ACTIONS, filter, sorts);
    }

    // 获取今日日志
    async getTodayLogs() {
        const today = new Date().toISOString().split('T')[0];
        const filter = {
            property: '日期',
            date: {
                equals: today
            }
        };
        return await this.queryDatabase(DATABASE_IDS.DAILY_LOG, filter);
    }

    // 获取最近的健康记录
    async getRecentHealthRecords(days = 7) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        
        const filter = {
            property: '日期',
            date: {
                on_or_after: startDate.toISOString()
            }
        };
        return await this.queryDatabase(DATABASE_IDS.HEALTH, filter);
    }

    // 获取最近的情绪记录
    async getRecentEmotions(days = 7) {
        // 情绪记录数据库可能没有日期字段，暂时不使用过滤器
        // 获取所有记录后在前端进行过滤
        const sorts = [{
            property: 'created_time',
            direction: 'descending'
        }];
        const results = await this.queryDatabase(DATABASE_IDS.EMOTIONS, {}, sorts);
        
        // 在前端过滤最近7天的记录
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        
        return results.filter(record => {
            const createdTime = new Date(record.created_time);
            return createdTime >= startDate;
        });
    }

    // 获取最近的成长复盘
    async getRecentGrowthReviews(limit = 10) {
        // 使用 Notion 的系统属性 created_time 进行排序
        const sorts = [{
            property: 'created_time',
            direction: 'descending'
        }];
        const results = await this.queryDatabase(DATABASE_IDS.GROWTH_REVIEW, {}, sorts);
        return results.slice(0, limit);
    }

    // 获取本周数据汇总
    async getWeeklyData() {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        weekStart.setHours(0, 0, 0, 0);

        const weeklyData = {
            logs: await this.getLogsAfterDate(weekStart),
            completedActions: await this.getCompletedActionsAfterDate(weekStart),
            emotions: await this.getEmotionsAfterDate(weekStart),
            health: await this.getHealthAfterDate(weekStart),
            finance: await this.getFinanceAfterDate(weekStart),
        };

        return weeklyData;
    }

    // 辅助方法：获取指定日期后的日志
    async getLogsAfterDate(date) {
        const filter = {
            property: '日期',
            date: {
                on_or_after: date.toISOString()
            }
        };
        return await this.queryDatabase(DATABASE_IDS.DAILY_LOG, filter);
    }

    // 辅助方法：获取指定日期后完成的行动
    async getCompletedActionsAfterDate(date) {
        const filter = {
            and: [
                {
                    property: '状态',
                    status: {
                        equals: '已完成'  // 使用中文状态值
                    }
                },
                {
                    property: '完成日期',
                    date: {
                        on_or_after: date.toISOString()
                    }
                }
            ]
        };
        return await this.queryDatabase(DATABASE_IDS.ACTIONS, filter);
    }

    // 辅助方法：获取指定日期后的情绪记录
    async getEmotionsAfterDate(date) {
        // 获取所有情绪记录，然后在前端过滤
        const sorts = [{
            property: 'created_time',
            direction: 'descending'
        }];
        const results = await this.queryDatabase(DATABASE_IDS.EMOTIONS, {}, sorts);
        
        // 在前端过滤指定日期后的记录
        return results.filter(record => {
            const createdTime = new Date(record.created_time);
            return createdTime >= date;
        });
    }

    // 辅助方法：获取指定日期后的健康记录
    async getHealthAfterDate(date) {
        const filter = {
            property: '日期',
            date: {
                on_or_after: date.toISOString()
            }
        };
        return await this.queryDatabase(DATABASE_IDS.HEALTH, filter);
    }

    // 辅助方法：获取指定日期后的财务记录
    async getFinanceAfterDate(date) {
        const filter = {
            property: '日期',
            date: {
                on_or_after: date.toISOString()
            }
        };
        return await this.queryDatabase(DATABASE_IDS.FINANCE, filter);
    }
}
