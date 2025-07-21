// Notion 数据提取辅助函数

// 提取文本属性
export function extractNotionText(property) {
    if (!property) return '';
    
    if (property.title && property.title.length > 0) {
        return property.title.map(t => t.plain_text).join('');
    }
    
    if (property.rich_text && property.rich_text.length > 0) {
        return property.rich_text.map(t => t.plain_text).join('');
    }
    
    if (property.plain_text) {
        return property.plain_text;
    }
    
    return '';
}

// 提取数字属性
export function extractNotionNumber(property) {
    if (!property) return 0;
    
    if (property.number !== undefined) {
        return property.number;
    }
    
    if (property.formula && property.formula.number !== undefined) {
        return property.formula.number;
    }
    
    if (property.rollup && property.rollup.number !== undefined) {
        return property.rollup.number;
    }
    
    return 0;
}

// 提取日期属性
export function extractNotionDate(property) {
    if (!property || !property.date) return null;
    
    return property.date.start;
}

// 提取选择属性
export function extractNotionSelect(property) {
    if (!property || !property.select) return '';
    
    return property.select.name;
}

// 提取多选属性
export function extractNotionMultiSelect(property) {
    if (!property || !property.multi_select) return [];
    
    return property.multi_select.map(item => item.name);
}

// 提取关联属性
export function extractNotionRelation(property) {
    if (!property || !property.relation) return [];
    
    return property.relation;
}

// 提取复选框属性
export function extractNotionCheckbox(property) {
    if (!property) return false;
    
    return property.checkbox === true;
}

// 提取 URL 属性
export function extractNotionUrl(property) {
    if (!property || !property.url) return '';
    
    return property.url;
}

// 提取创建时间
export function extractNotionCreatedTime(property) {
    if (!property || !property.created_time) return null;
    
    return property.created_time;
}

// 提取最后编辑时间
export function extractNotionLastEditedTime(property) {
    if (!property || !property.last_edited_time) return null;
    
    return property.last_edited_time;
}

// 计算星级评分
export function getStarRating(score, maxScore = 5) {
    const filled = '★'.repeat(Math.round(score));
    const empty = '☆'.repeat(maxScore - Math.round(score));
    return filled + empty;
}

// 格式化数字
export function formatNumber(num, decimals = 0) {
    return Number(num).toFixed(decimals);
}

// 格式化货币
export function formatCurrency(amount) {
    return new Intl.NumberFormat('zh-CN', {
        style: 'currency',
        currency: 'CNY'
    }).format(amount);
}
