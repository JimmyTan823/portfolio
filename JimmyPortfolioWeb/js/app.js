/**
 * 不同详情章节类型的 HTML 生成器。
 * @type {Object.<string, function(string): string>}
 */
const DetailSections = {
    title: (text) => `<h2 class="section-title">${text}</h2>`,
    text: (text) => `<p class="section-text">${text}</p>`,
    image: (label) => `<div class="section-image">${label}</div>`
};

/**
 * 代表 3D 世界中的单个项目卡片类。
 */
class Project {
    /**
     * @param {number} id - 项目的唯一索引。
     * @param {string} title - 项目标题。
     * @param {string} tag - 项目分类标签。
     * @param {string} time - 项目时间跨度。
     * @param {string} previewImg - 预览图片的 URL。
     * @param {Array<Object>} detailData - 详情章节数据对象数组。
     */
    constructor(id, title, tag, time, previewImg, detailData) {
        this.id = id; this.title = title; this.tag = tag; this.time = time;
        this.previewImg = previewImg; this.detailData = detailData;
        this.dom = null;
    }

    /**
     * 创建并返回项目卡片的 DOM 元素。
     * @returns {HTMLElement} 构建好的卡片元素。
     */
    renderCard() {
        const wrapper = document.createElement('div');
        wrapper.className = 'card-anchor';
        const detailHtml = this.detailData.map((section, idx) => {
            let html = DetailSections[section.type](section.value);
            if (idx === 0) {
                html += `<p class="project-time" style="color: #86868B; font-size: 0.9rem; margin-bottom: 40px; margin-top: -20px;">${this.time}</p>`;
            }
            return html;
        }).join('');

        wrapper.innerHTML = `
            <div class="card-flipper">
                <div class="card-face face-front">
                    <div class="preview-img-box"><img src="${this.previewImg}" alt="${this.title}"></div>
                    <!-- 修复后的层级结构 -->
                    <div class="melt-zone"></div>
                    <div class="front-info-overlay">
                        <span class="card-tag">${this.tag}</span>
                        <h3>${this.title}</h3>
                        <p style="color:#86868B; margin-top:10px; font-size:0.85rem; font-weight:500;">View Case Study →</p>
                    </div>
                </div>
                <div class="card-face face-back">
                    <div class="detail-view">
                        <div class="close-btn-container">
                            <button class="close-btn">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                        <div class="detail-content-wrapper">
                            <div class="detail-header-info">
                                <span class="card-tag">${this.tag}</span>
                            </div>
                            ${detailHtml}
                        </div>
                    </div>
                </div>
            </div>
        `;

        wrapper.querySelector('.close-btn').onclick = (e) => portfolioApp.closeDetail(e);
        wrapper.onclick = () => { if (portfolioApp.index === this.id && !portfolioApp.isDetail) portfolioApp.openDetail(wrapper); };
        this.dom = wrapper;
        return wrapper;
    }
}

/**
 * 管理 3D 作品集体验的主应用程序控制器。
 */
class PortfolioApp {
    /**
     * @param {Array<ProjectData>} projectData - 项目数据对象数组。
     */
    constructor(projectData) {
        this.projects = projectData.map((data, i) => new Project(i, data.title, data.tag, data.time, data.previewImg, data.sections));
        this.index = 0; this.isMoving = false; this.isDetail = false;
        this.stepZ = 1100;
        this.world = document.getElementById('world');
        this.indicator = document.getElementById('indicator');
        this.init();
    }

    /**
     * 初始化场景，创建项目卡片和指示器。
     */
    init() {
        this.projects.forEach((project) => {
            const dot = document.createElement('div');
            dot.className = 'dot';
            dot.onclick = () => { if (!this.isDetail && this.index !== project.id) { this.index = project.id; this.updateView(); } };
            this.indicator.appendChild(dot);
            this.world.appendChild(project.renderCard());
        });
        this.bindEvents();
        this.updateView();
    }

    /**
     * 绑定输入事件（滚轮、触摸、窗口大小调整）到导航逻辑。
     */
    bindEvents() {
        window.addEventListener('wheel', e => {
            if (this.isDetail) return;
            e.preventDefault();
            if (Math.abs(e.deltaY) > 20) this.navigate(e.deltaY > 0 ? 1 : -1);
        }, { passive: false });

        let touchY;
        window.addEventListener('touchstart', e => { touchY = e.touches[0].clientY; }, { passive: true });
        window.addEventListener('touchend', e => {
            if (this.isDetail) return;
            const te = e.changedTouches[0].clientY;
            if (Math.abs(touchY - te) > 50) this.navigate(touchY - te > 0 ? 1 : -1);
        }, { passive: true });

        window.addEventListener('resize', () => { if (!this.isDetail) this.updateView(); });
        // 确保资源完全加载后再次更新视图，防止布局偏移
        window.addEventListener('load', () => this.updateView());
    }

    /**
     * 导航到不同的项目卡片。
     * @param {number} dir - 导航方向（1 为下一个，-1 为上一个）。
     */
    navigate(dir) {
        if (this.isMoving || this.isDetail) return;
        const target = this.index + dir;
        if (target >= 0 && target < this.projects.length) {
            this.index = target; this.isMoving = true;
            this.updateView();
            setTimeout(() => this.isMoving = false, 1000);
        }
    }

    /**
     * 基于当前索引更新所有项目卡片的 3D 变换。
     */
    updateView() {
        const vw = window.innerWidth;
        const isMobile = vw <= 768;
        const sideX = isMobile ? vw * 0.45 : vw * 0.38;
        const focusX = isMobile ? vw * 0.05 : vw * 0.03;
        const dots = document.querySelectorAll('.dot');

        this.projects.forEach((project, i) => {
            const el = project.dom;
            const diff = i - this.index;
            const dir = (i % 2 === 0 ? -1 : 1);
            dots[i].classList.toggle('active', i === this.index);
            el.classList.remove('is-active', 'is-open');

            if (diff === 0) {
                el.classList.add('is-active');
                el.style.opacity = "1"; el.style.filter = "none";
                el.style.transform = `translate3d(calc(-50% + ${dir * focusX}px), -50%, 0)`;
            } else if (diff > 0) {
                const tz = -diff * this.stepZ;
                el.style.opacity = Math.max(0, 1 - diff * 0.35);
                el.style.filter = `blur(${diff * 10}px)`;
                el.style.transform = `translate3d(calc(-50% + ${dir * sideX}px), -50%, ${tz}px) rotateY(${dir * (isMobile ? 22 : 12)}deg) scale(0.92)`;
            } else {
                /* 修复 BUG：之前卡片（diff < 0）移动到 850px (镜头前) 会导致在移动端卡在屏幕边缘。
                   改为移动到 2000px (镜头后，因为 perspective 是 1200px)，彻底移出视野。 */
                el.style.opacity = "0"; el.style.filter = `blur(25px)`;
                el.style.transform = `translate3d(calc(-50% + ${dir * sideX * 1.5}px), -50%, 2000px) scale(0.5)`;
            }
        });
    }

    /**
     * 打开特定卡片的详情视图。
     * @param {HTMLElement} el - 要打开的卡片元素。
     */
    openDetail(el) {
        this.isDetail = true;
        document.body.classList.add('mode-detail');
        el.classList.add('is-open');
    }

    /**
     * 关闭详情视图并返回 3D 画廊。
     * @param {Event} e - 点击事件对象。
     */
    closeDetail(e) {
        e.stopPropagation(); this.isDetail = false;
        document.body.classList.remove('mode-detail');
        const openCard = document.querySelector('.card-anchor.is-open');
        if (openCard) openCard.classList.remove('is-open');
        requestAnimationFrame(() => this.updateView());
    }
}

// 使用全局数据初始化应用
const portfolioApp = new PortfolioApp(window.myProjectsData || []);
