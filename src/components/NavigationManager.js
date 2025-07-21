// 导航管理组件
export class NavigationManager {
    constructor() {
        this.navLinks = document.querySelectorAll('.nav-link');
    }

    init() {
        // 为每个导航链接添加事件监听
        this.navLinks.forEach(link => {
            link.addEventListener('click', this.handleNavClick.bind(this));
        });
    }

    handleNavClick(event) {
        // 阻止默认行为
        event.preventDefault();

        // 获取点击的链接
        const targetId = event.currentTarget.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetId);

        if (targetSection) {
            // 滚动到目标章节
            targetSection.scrollIntoView({ behavior: 'smooth' });

            // 激活对应的导航链接
            this.activateLink(event.currentTarget);
        }
    }

    activateLink(selectedLink) {
        this.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link === selectedLink) {
                link.classList.add('active');
            }
        });
    }
}

