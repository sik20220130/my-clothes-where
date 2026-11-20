# 我的衣服在哪（衣服在哪）

微信小程序原生实现的数字衣橱：拍照入库、分类检索、搭配一套。当前处于开发阶段，未发布。

## 技术栈

- 微信小程序原生（WXML / WXSS / JS），无构建步骤
- 微信云开发：云数据库 `wardrobe_data` + 云存储
- 组件化：5 个自定义组件，15 个页面

## 快速开始

1. 用微信开发者工具「导入项目」，目录选择本仓库根目录 `Magic_Wardrobe`（不要选上层目录）。
2. AppID 使用 `wx500501ecd29ba06d`（`project.config.json` 已配置）。
3. 在开发者工具「云开发」面板开通环境，环境 ID 填 `cloud1-d5ghmekgecd229e76`（与 `app.js` 中 `cloudEnv` 一致；如更换环境需同步修改）。
4. 在云开发控制台「数据库」中新建集合 `wardrobe_data`。
5. 集合权限设为「仅创建者可读写」：云开发控制台 → 数据库 → `wardrobe_data` → 权限设置 → 选择「仅创建者可读写」。

无需 `npm install`，原生版没有构建依赖。

### 云开发从零配置

1. 开通云开发环境，记录环境 ID，替换 `miniprogram/app.js` 的 `cloudEnv`。
2. 创建集合 `wardrobe_data`，权限选择「仅创建者可读写」。
3. 客户端首次写入时由云开发自动注入 `_openid`，代码中不手动写入。
4. `store.init()` 使用 `.where({ _openid: '{openid}' })` 只查询本人记录，保证每个微信号仅一条数据。
5. 云存储无需手动建目录，上传时自动创建。

### 隐私配置

1. 小程序后台 → 设置 → 服务内容声明 → 用户隐私保护指引，声明「相册（仅写入）」「摄像头」等信息用途。
2. `app.json` 已开启 `"__usePrivacyCheck__": true`，`app.js` 注册 `wx.onNeedPrivacyAuthorization`。
3. 首次选图会弹出 `components/privacy-popup`，用户拒绝后仍可手动填写并保存单品。
4. 协议入口位于「我的 → 设置 → 隐私保护指引」，调用 `wx.openPrivacyContract` 打开。

## 目录结构

```text
Magic_Wardrobe/
├── miniprogram/          # 唯一交付源码
│   ├── app.js            # 云开发初始化
│   ├── app.json          # 页面注册、tabBar
│   ├── pages/            # 15 个页面（含新手引导、图片裁切）
│   ├── components/       # 5 个组件（含隐私弹窗）
│   ├── utils/store.js    # 数据层（本地缓存 + 云端同步）
│   ├── data/             # 示例数据与配置
│   └── assets/           # 图标与图片
├── docs/                 # 原有功能文档
├── archive/
│   ├── taro/             # 已归档的 Taro 4 + React 版（不再维护）
│   └── legacy/           # 外层重复配置占位（实际备份见下方）
├── package.json          # 仅保留项目元信息，无依赖
└── project.config.json   # 开发者工具项目配置（appid、miniprogramRoot）
```

## 归档说明（2026-11-20）

产品确定当前只做微信小程序，不做 H5/抖音。Taro 版（原 `src/`、`dist/`、`dist-h5/`、`config/`、`types/`、构建配置）已移入 `archive/taro/`，仅作追溯，不再维护。

原外层目录（`魔法衣橱/` 根目录）的 `project.config.json` 与 `project.private.config.json` 与正式项目配置冲突（appid 为 `wx06bd83454f7bb273`），已删除，备份放在：

```text
Requirements_Decomposer/docs/product/magic-wardrobe/archive/
├── legacy-project.config.json
└── legacy-project.private.config.json
```

归档前状态已打 tag：`v1.0.0-dev`。

## 相关文档

产品评估、PRD、需求迭代表、问题清单统一放在：

```text
Requirements_Decomposer/docs/product/magic-wardrobe/
```

## 待清理

- `node_modules/`（约 746M）为 Taro 版遗留，原生小程序不需要；确认后可删除。
- `.swc/`（约 2.5M）为 Taro 编译缓存，可删除。
- `.pai/` 为本地预览服务日志，可删除。

## 已知问题

见 `Requirements_Decomposer/docs/product/magic-wardrobe/08-software-review.md`，其中 P0 共 4 项：数据冲突、示例数据污染、隐私合规、工程命名统一。
