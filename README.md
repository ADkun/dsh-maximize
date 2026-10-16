# dsh-maximize

DSH 插件：会话页右上角「全屏」按钮。点击后隐藏顶部标题栏（对话/轨迹 tabs）、底部输入框、左侧边栏；右侧边栏保持可打开，按钮自然落在整页最右上。再点一次或按 `ESC` 恢复原样。

按钮采用毛玻璃风（半透明白底 + 模糊背景 + 细边框），仅保留全屏/退出图标，悬停时显示「全屏 / 退出全屏」提示。中英文文案自动跟随 DSH 语言。

## 功能

| 项 | 说明 |
|---|---|
| 全屏开关 | 点击右上角按钮进入/退出全屏 |
| 隐藏顶栏 | 隐藏 `header[data-window-drag]`（含对话/轨迹 tabs） |
| 隐藏输入框 | 隐藏 `[data-composer-seat]` 与轨迹页的 `[data-conversation-composer-overlay]` |
| 折叠左栏 | 走 `ctx.layout.toggleSidebar()`，退出时还原进入前状态 |
| 右栏不动 | 右侧边栏开着时按钮仍在整页最右上角 |
| ESC 退出 | 按 `ESC` 或再次点击按钮恢复原样 |
| 状态持久 | 同一页切换会话（overlay 槽重挂载）保持全屏态 |

## 安装

本地安装（推荐用于自建 DSH 环境）：

```bash
# 克隆仓库
git clone https://github.com/ADkun/dsh-maximize.git
cd dsh-maximize

# 在 DSH profile 目录下以 bundle 形式安装（以 web profile 为例）
dsh plugin add ./dsh-maximize
# 或通过插件管理器加载 bundle
```

安装后**刷新页面**一次，客户端模块才会注册到 `shell.overlay` 插槽并显示按钮。

## 文件结构

```
dsh-maximize/
├── client.js        # 客户端半边：React 组件注入 shell.overlay 插槽
├── index.js         # 宿主半边：空实现（纯客户端插件）
├── cordis.patch.yml # Loader patch：注册 bundle id/name
├── package.json     # 包元数据，声明 dsh.client 平台 web
└── README.md
```

## 开发注意

`client.js` 运行在 DSH ModuleLoader 工厂垫片中，**不能**使用顶层 `import ... from 'react'`（裸说明符在工厂作用域外无法解析）。必须用工厂模式获取 React：

```js
window.__ModuleLoader__.load({
  id: 'dsh-maximize',
  factory(require) {
    const React = require('react');
    const { useState, useEffect, useRef, useCallback } = React;
    const h = React.createElement;
    // ...
  },
});
```

文案通过 `ctx.locale.register('dsh-maximize', 'zh', {...})` / `bind('dsh-maximize')` 注册，遵循 DSH 本地化规范。

## License

MIT
