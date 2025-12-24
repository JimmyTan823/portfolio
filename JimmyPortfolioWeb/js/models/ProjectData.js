/**
 * 统一的项目数据模型，用于规范化项目信息结构。
 */
class ProjectData {
    /**
     * @param {Object} config - 项目配置对象。
     * @param {string} config.title - 项目标题。
     * @param {string} config.tag - 项目类别标签。
     * @param {string} config.time - 项目时间周期。
     * @param {string} config.previewImg - 预览图片链接。
     * @param {Array<{type: 'title'|'text'|'image', value: string}>} config.sections - 详情页内容片段。
     */
    constructor({ title, tag, time, previewImg, sections }) {
        this.title = title;
        this.tag = tag;
        this.time = time;
        this.previewImg = previewImg;
        this.sections = sections;
    }
}

// 初始化全局项目数组（如果不存在）
if (!window.myProjectsData) {
    window.myProjectsData = [];
}
