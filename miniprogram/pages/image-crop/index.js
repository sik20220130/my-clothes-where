// ============================================
// 图片裁切页（R15）
// 取景框固定，图片可拖动 / 双指缩放，导出 JPEG 质量 80
// 单品 3:4（1200 × 1600）、衣橱封面 15:8（1600 × 853）
// ============================================

const PRE_SCALE_LIMIT = 2400;
const BOTTOM_BAR_HEIGHT = 96;

const OUTPUT_SIZE = {
  item: { width: 1200, height: 1600 },
  cover: { width: 1600, height: 853 }
};

Page({
  data: {
    mode: 'item',
    statusBarHeight: 20,
    navRight: 54,
    stageWidth: 0,
    stageHeight: 0,
    frameWidth: 0,
    frameHeight: 0,
    frameLeft: 0,
    frameTop: 0,
    loaded: false,
    error: ''
  },

  onLoad(options) {
    const mode = options && options.mode === 'cover' ? 'cover' : 'item';
    const src = decodeURIComponent((options && options.src) || '');
    this.mode = mode;
    this.src = src;
    this.scale = 1;
    this.minScale = 1;
    this.maxScale = 3;
    this.offsetX = 0;
    this.offsetY = 0;
    this.touchMode = '';
    this.exporting = false;

    if (!src) {
      this.setData({ error: '图片加载失败，请返回重试' });
      return;
    }

    const info = this.getWindowInfo();
    const statusBarHeight = info.statusBarHeight || 20;
    const stageWidth = info.windowWidth;
    const stageHeight = Math.max(
      info.windowHeight - statusBarHeight - 44 - BOTTOM_BAR_HEIGHT,
      160
    );

    // 取景框宽度 = 屏宽 − 48；高度超出时按可用高度反算
    const ratio = mode === 'cover' ? 15 / 8 : 3 / 4;
    let frameWidth = Math.max(stageWidth - 48, 80);
    let frameHeight = frameWidth / ratio;
    const maxFrameHeight = stageHeight - 32;
    if (frameHeight > maxFrameHeight) {
      frameHeight = maxFrameHeight;
      frameWidth = frameHeight * ratio;
    }

    let navRight = 54;
    try {
      const menu = wx.getMenuButtonBoundingClientRect();
      if (menu && menu.left) {
        navRight = Math.max(stageWidth - menu.left + 8, 40);
      }
    } catch (error) {
      console.error('[ImageCrop] 获取胶囊位置失败:', error);
    }

    this.setData(
      {
        mode,
        statusBarHeight,
        navRight,
        stageWidth,
        stageHeight,
        frameWidth,
        frameHeight,
        frameLeft: (stageWidth - frameWidth) / 2,
        frameTop: (stageHeight - frameHeight) / 2
      },
      () => this.initCanvas()
    );
  },

  getWindowInfo() {
    if (wx.getWindowInfo) {
      return wx.getWindowInfo();
    }
    return wx.getSystemInfoSync();
  },

  initCanvas() {
    const query = wx.createSelectorQuery();
    query
      .select('#cropCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        const info = res && res[0];
        if (!info || !info.node) {
          this.setData({ error: '画布初始化失败，请返回重试' });
          wx.showModal({
            title: '裁切页加载失败',
            content: '请返回重新选择图片',
            showCancel: false,
            success: () => wx.navigateBack()
          });
          return;
        }
        const canvas = info.node;
        const dpr = this.getWindowInfo().pixelRatio || 2;
        canvas.width = Math.round(info.width * dpr);
        canvas.height = Math.round(info.height * dpr);
        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
        this.canvas = canvas;
        this.ctx = ctx;
        this.dpr = dpr;
        this.loadImage(this.src, false);
      });
  },

  // 加载图片；长边超过 2400 时先预缩放，避免 canvas 内存溢出
  loadImage(src, preScaled) {
    const img = this.canvas.createImage();
    img.onload = () => {
      const maxSide = Math.max(img.width, img.height);
      if (!preScaled && maxSide > PRE_SCALE_LIMIT) {
        this.preScale(src, img.width, img.height);
        return;
      }
      this.image = img;
      this.imageWidth = img.width;
      this.imageHeight = img.height;
      this.resetView();
      this.setData({ loaded: true, error: '' });
    };
    img.onerror = () => {
      this.setData({ error: '图片加载失败，请返回重试' });
      wx.showModal({
        title: '图片加载失败',
        content: '请返回重新选择图片',
        showCancel: false,
        success: () => wx.navigateBack()
      });
    };
    img.src = src;
  },

  preScale(src, width, height) {
    const targetWidth = Math.max(
      1,
      Math.round((width * PRE_SCALE_LIMIT) / Math.max(width, height))
    );
    if (!wx.compressImage || targetWidth >= width) {
      this.loadImage(src, true);
      return;
    }
    wx.compressImage({
      src,
      quality: 100,
      compressedWidth: targetWidth,
      success: (res) => this.loadImage(res.tempFilePath, true),
      fail: () => this.loadImage(src, true)
    });
  },

  // 初始：短边填满取景框并居中
  resetView() {
    const { frameWidth, frameHeight } = this.data;
    const coverScale = Math.max(
      frameWidth / this.imageWidth,
      frameHeight / this.imageHeight
    );
    this.scale = coverScale;
    this.minScale = coverScale;
    this.maxScale = coverScale * 3;
    this.offsetX = 0;
    this.offsetY = 0;
    this.draw();
  },

  clampOffset() {
    const { frameWidth, frameHeight } = this.data;
    const drawWidth = this.imageWidth * this.scale;
    const drawHeight = this.imageHeight * this.scale;
    const maxOffsetX = (drawWidth - frameWidth) / 2;
    const maxOffsetY = (drawHeight - frameHeight) / 2;
    if (maxOffsetX <= 0) {
      this.offsetX = 0;
    } else {
      this.offsetX = Math.min(Math.max(this.offsetX, -maxOffsetX), maxOffsetX);
    }
    if (maxOffsetY <= 0) {
      this.offsetY = 0;
    } else {
      this.offsetY = Math.min(Math.max(this.offsetY, -maxOffsetY), maxOffsetY);
    }
  },

  draw() {
    this.drawImageLayer();
    this.drawMask(this.ctx, this.data.stageWidth, this.data.stageHeight);
  },

  // 仅绘制图片层（导出时使用，避免把遮罩一起导出）
  drawImageLayer() {
    if (!this.ctx || !this.image) return;
    const { stageWidth, stageHeight, frameWidth, frameHeight, frameLeft, frameTop } =
      this.data;
    this.clampOffset();
    const drawWidth = this.imageWidth * this.scale;
    const drawHeight = this.imageHeight * this.scale;
    const centerX = frameLeft + frameWidth / 2 + this.offsetX;
    const centerY = frameTop + frameHeight / 2 + this.offsetY;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, stageWidth, stageHeight);
    ctx.drawImage(
      this.image,
      centerX - drawWidth / 2,
      centerY - drawHeight / 2,
      drawWidth,
      drawHeight
    );
  },

  // canvas 为原生组件，遮罩与取景框直接绘制在画布内，避免层级被覆盖
  drawMask(ctx, stageWidth, stageHeight) {
    const { frameWidth, frameHeight, frameLeft, frameTop } = this.data;
    const frameRight = frameLeft + frameWidth;
    const frameBottom = frameTop + frameHeight;
    ctx.save();
    ctx.fillStyle = 'rgba(10, 6, 20, 0.56)';
    ctx.fillRect(0, 0, stageWidth, frameTop);
    ctx.fillRect(0, frameBottom, stageWidth, Math.max(stageHeight - frameBottom, 0));
    ctx.fillRect(0, frameTop, frameLeft, frameHeight);
    ctx.fillRect(frameRight, frameTop, Math.max(stageWidth - frameRight, 0), frameHeight);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.lineWidth = 2;
    ctx.strokeRect(frameLeft, frameTop, frameWidth, frameHeight);
    ctx.restore();
  },

  getTouchDistance(touchA, touchB) {
    const dx = touchA.clientX - touchB.clientX;
    const dy = touchA.clientY - touchB.clientY;
    return Math.sqrt(dx * dx + dy * dy) || 1;
  },

  handleTouchStart(event) {
    if (!this.image) return;
    const touches = event.touches || [];
    if (touches.length >= 2) {
      this.touchMode = 'pinch';
      this.pinchStartDistance = this.getTouchDistance(touches[0], touches[1]);
      this.pinchStartScale = this.scale;
      return;
    }
    if (touches.length === 1) {
      this.touchMode = 'drag';
      this.dragStartX = touches[0].clientX;
      this.dragStartY = touches[0].clientY;
      this.dragStartOffsetX = this.offsetX;
      this.dragStartOffsetY = this.offsetY;
    }
  },

  handleTouchMove(event) {
    if (!this.image) return;
    const touches = event.touches || [];
    if (touches.length >= 2) {
      if (this.touchMode !== 'pinch' || !this.pinchStartDistance) {
        this.touchMode = 'pinch';
        this.pinchStartDistance = this.getTouchDistance(touches[0], touches[1]);
        this.pinchStartScale = this.scale;
        return;
      }
      const distance = this.getTouchDistance(touches[0], touches[1]);
      const nextScale = this.pinchStartScale * (distance / this.pinchStartDistance);
      this.scale = Math.min(Math.max(nextScale, this.minScale), this.maxScale);
      this.draw();
      return;
    }
    if (touches.length === 1) {
      if (this.touchMode !== 'drag') {
        this.touchMode = 'drag';
        this.dragStartX = touches[0].clientX;
        this.dragStartY = touches[0].clientY;
        this.dragStartOffsetX = this.offsetX;
        this.dragStartOffsetY = this.offsetY;
        return;
      }
      this.offsetX = this.dragStartOffsetX + (touches[0].clientX - this.dragStartX);
      this.offsetY = this.dragStartOffsetY + (touches[0].clientY - this.dragStartY);
      this.draw();
    }
  },

  handleTouchEnd() {
    this.touchMode = '';
    this.pinchStartDistance = 0;
  },

  handleReset() {
    if (!this.image) return;
    this.resetView();
  },

  // 取消：直接返回，不产生图片；编辑场景由上一页保留原图
  handleCancel() {
    wx.navigateBack();
  },

  // 确认：仅导出取景框内画面
  handleConfirm() {
    if (!this.image || this.exporting) return;
    this.exporting = true;
    const { frameLeft, frameTop, frameWidth, frameHeight } = this.data;
    const size = OUTPUT_SIZE[this.mode] || OUTPUT_SIZE.item;
    const dpr = this.dpr || 1;
    // 导出前只保留图片层，导出完成后恢复遮罩
    this.drawImageLayer();
    wx.showLoading({ title: '处理中', mask: true });
    wx.canvasToTempFilePath(
      {
        canvas: this.canvas,
        x: frameLeft * dpr,
        y: frameTop * dpr,
        width: frameWidth * dpr,
        height: frameHeight * dpr,
        destWidth: size.width,
        destHeight: size.height,
        fileType: 'jpg',
        quality: 0.8,
        success: (res) => {
          wx.hideLoading();
          this.exporting = false;
          this.draw();
          const channel = this.getOpenerEventChannel && this.getOpenerEventChannel();
          if (channel && channel.emit) {
            channel.emit('cropResult', { path: res.tempFilePath });
          }
          wx.navigateBack();
        },
        fail: (error) => {
          console.error('[ImageCrop] 导出失败:', error);
          wx.hideLoading();
          this.exporting = false;
          this.draw();
          wx.showToast({ title: '裁切失败，请重试', icon: 'none' });
        }
      },
      this
    );
  }
});
