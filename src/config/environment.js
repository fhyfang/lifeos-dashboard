// 环境配置
export const config = {
    // API URL - 在生产环境中应该指向您部署的后端服务器
    API_URL: process.env.NODE_ENV === 'production' 
        ? 'https://your-backend-server.herokuapp.com/api/notion'  // 需要替换为实际的后端URL
        : 'http://localhost:3001/api/notion',
    
    // 是否使用模拟数据
    USE_MOCK_DATA: process.env.NODE_ENV === 'production' && !process.env.PRODUCTION_API_URL,
    
    // 是否显示调试信息
    DEBUG: process.env.NODE_ENV !== 'production'
};
