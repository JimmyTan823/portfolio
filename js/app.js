/**
 * 不同详情章节类型的 HTML 生成器。
 * @type {Object.<string, function(string): string>}
 */
const DetailSections = {
    title: (text) => `<h2 class="section-title">${text}</h2>`,
    subtitle: (text) => `<h3 class="section-subtitle">${text}</h3>`,
    subtitle2: (text) => `<h4 class="section-subtitle2">${text}</h4>`,
    text: (text) => `<p class="section-text">${text}</p>`,
    quote: (text) => `<blockquote class="section-quote">${text}</blockquote>`,
    // 如果传入的是 url 或者是相对路径，则渲染真实图片；否则作为占位文本
    image: (srcOrLabel) => {
        const isUrl = srcOrLabel.startsWith('http') || srcOrLabel.startsWith('/') || srcOrLabel.startsWith('assets') || srcOrLabel.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);
        if (isUrl) {
            return `<div class="section-image" style="background:transparent; border:none; height:auto; padding:0;"><img src="${srcOrLabel}" alt="Case Study Image" style="max-width: 100%; max-height: 600px; width: auto; height: auto; border-radius: 16px; box-shadow: 0 20px 40px rgba(0,0,0,0.06); display: block; margin: 0 auto;"></div>`;
        }
        return `<div class="section-image">${srcOrLabel}</div>`;
    },
    video: (src) => {
        return `<div class="section-video" style="background:transparent; border:none; height:auto; padding:0; margin-bottom: 40px; display: flex; justify-content: center;">
            <div style="position: relative; width: 100%;">
                <video src="${src}" playsinline controls preload="metadata" 
                    style="width: 100%; height: auto; border-radius: 16px; box-shadow: 0 20px 40px rgba(0,0,0,0.06); display: block; margin: 0 auto; background: #000;"
                    onplay="this.nextElementSibling.style.opacity=0; this.nextElementSibling.style.pointerEvents='none'; document.querySelectorAll('video').forEach(v => { if (v !== this && !v.paused) v.pause(); });"
                    onpause="this.nextElementSibling.style.opacity=1; this.nextElementSibling.style.pointerEvents='auto';"
                ></video>
                <div class="play-overlay" onclick="this.previousElementSibling.play();" style="position: absolute; inset: 0; background: rgba(0,0,0,0.15); border-radius: 16px; display: flex; justify-content: center; align-items: center; cursor: pointer; transition: opacity 0.3s ease; z-index: 10;">
                    <div style="width: 72px; height: 72px; background: rgba(255,255,255,0.95); border-radius: 50%; display: flex; justify-content: center; align-items: center; padding-left: 6px; box-shadow: 0 8px 30px rgba(0,0,0,0.12); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); transition: transform 0.2s ease;" onmouseenter="this.style.transform='scale(1.05)'" onmouseleave="this.style.transform='scale(1)'">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="#1D1D1F">
                            <polygon points="6 3 20 12 6 21 6 3"></polygon>
                        </svg>
                    </div>
                </div>
            </div>
        </div>`;
    }
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
        const contentSections = this.detailData.filter(s => s.type !== 'title');
        const detailHtml = contentSections.map(section => {
            return DetailSections[section.type](section.value);
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
                        <div class="detail-nav-bar">
                            <h4 class="small-nav-title">${this.title}</h4>
                            <button class="close-btn">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                        <div class="detail-content-wrapper">
                            <div class="detail-large-header">
                                <span class="card-tag">${this.tag}</span>
                                <h2 class="section-title">${this.title}</h2>
                                <p class="project-time">${this.time}</p>
                            </div>
                            ${detailHtml}
                        </div>
                    </div>
                </div>
            </div>
        `;

        const detailView = wrapper.querySelector('.detail-view');
        const stickyNav = wrapper.querySelector('.detail-nav-bar');
        detailView.addEventListener('scroll', () => {
            if (detailView.scrollTop > 50) {
                stickyNav.classList.add('is-stuck');
            } else {
                stickyNav.classList.remove('is-stuck');
            }
        });

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
            if (this.isDetail) {
                // 修复 Mac Safari 等浏览器在 3D 背面 overflow:auto 时触控板/滚轮事件穿透失效的 bug
                const detailView = document.querySelector('.card-anchor.is-open .detail-view');
                if (detailView && e.target.closest('.detail-view')) {
                    e.preventDefault();
                    // 根据设备的 deltaMode 进行倍率计算，保证触控板和普通鼠标滚轮都流畅
                    const multiplier = e.deltaMode === 1 ? 40 : (e.deltaMode === 2 ? 800 : 1);
                    detailView.scrollTop += e.deltaY * multiplier;
                }
                return;
            }
            e.preventDefault();
            if (Math.abs(e.deltaY) > 20) this.navigate(e.deltaY > 0 ? 1 : -1);
        }, { passive: false });

        // ===== 移动端触控逻辑封装 =====
        let touchY; // 画廊模式使用的 Y
        // 详情页手动滑动使用的变量
        let detailTouchStartY = 0;
        let detailScrollStartY = 0;
        let detailTouchLastY = 0;
        let detailTouchVelocity = 0;
        let detailTouchAnimationId = null;

        window.addEventListener('touchstart', e => {
            if (this.isDetail) {
                const detailView = document.querySelector('.card-anchor.is-open .detail-view');
                if (detailView && e.target.closest('.detail-view')) {
                    cancelAnimationFrame(detailTouchAnimationId);
                    detailTouchStartY = e.touches[0].clientY;
                    detailTouchLastY = detailTouchStartY;
                    detailScrollStartY = detailView.scrollTop;
                }
            }
            touchY = e.touches[0].clientY; 
            // 允许默认点击，不写 preventDefault
        }, { passive: false });

        window.addEventListener('touchmove', e => {
            if (this.isDetail) {
                const detailView = document.querySelector('.card-anchor.is-open .detail-view');
                if (detailView && e.target.closest('.detail-view')) {
                    const currentY = e.touches[0].clientY;
                    const walk = detailTouchStartY - currentY;
                    detailView.scrollTop = detailScrollStartY + walk;
                    
                    detailTouchVelocity = detailTouchLastY - currentY;
                    detailTouchLastY = currentY;
                    // 阻止浏览器的原生滑动（解决 3D 背面滑动穿透失效 bug）
                    e.preventDefault(); 
                }
            }
        }, { passive: false });

        window.addEventListener('touchend', e => {
            if (this.isDetail) {
                const detailView = document.querySelector('.card-anchor.is-open .detail-view');
                if (detailView && e.target.closest('.detail-view')) {
                    // 添加平滑的惯性滚动
                    const applyMomentum = () => {
                        if (Math.abs(detailTouchVelocity) > 0.5) {
                            detailView.scrollTop += detailTouchVelocity;
                            detailTouchVelocity *= 0.95; // 模拟阻力
                            detailTouchAnimationId = requestAnimationFrame(applyMomentum);
                        }
                    };
                    applyMomentum();
                }
                return;
            }
            
            // 画廊模式下的滑动翻页逻辑
            const te = e.changedTouches[0].clientY;
            if (Math.abs(touchY - te) > 50) {
                this.navigate(touchY - te > 0 ? 1 : -1);
            }
        }, { passive: false });

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
