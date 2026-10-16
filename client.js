/**
 * dsh-maximize — 会话页右上角的「全屏」按钮。
 *
 * 点击后隐藏：顶部标题栏（对话/轨迹 tabs 所在的 header[data-window-drag]）、
 * 底部输入框（[data-composer-seat] 与轨迹页的 [data-conversation-composer-overlay]）、
 * 左侧边栏（走 ctx.layout.toggleSidebar()，并记住进入前的展开状态，退出时还原）。
 * 右侧边栏不动——按钮挂在 shell.overlay（覆盖整帧的浮层）里，右栏开着时
 * 自然显示在整个页面的最右上方。
 *
 * 再点一次按钮或按 ESC 退出全屏，恢复原样。
 * 全屏态存模块级变量：同一页生命周期内切换会话（overlay 槽重挂载）保持全屏。
 *
 * 按钮为毛玻璃风，仅保留图标（无文字），title 提示保留「全屏 / 退出全屏」。
 * 文案走 ctx.locale.register/bind('dsh-maximize')，zh: enter=全屏/exit=退出全屏。
 *
 * React 从 factory 的 require 拿（client.js 走 ModuleLoader 工厂垫片执行，
 * 顶层 ESM import 解析不到裸说明符）。
 */
window.__ModuleLoader__.load({
  id: 'dsh-maximize',
  factory(require) {
    const React = require('react');
    const { useState, useEffect, useRef, useCallback } = React;
    const h = React.createElement;

    const HIDE_CSS = `
header[data-window-drag]:has(> div[data-conversation-header-leading]) { display: none !important; }
[data-composer-seat], [data-conversation-composer-overlay] { display: none !important; }
`;

    // Survive overlay-slot remounts (session switches) within one page lifetime.
    const surfaceState = { active: false, restoreSidebar: false };

    function MaximizeButton({ ctx, t }) {
      const [active, setActive] = useState(surfaceState.active);
      const restoreSidebarRef = useRef(surfaceState.restoreSidebar);
      const rootRef = useRef(null);

      const getFrame = () =>
        rootRef.current ? rootRef.current.closest('[data-shell-overlay]')?.parentElement ?? null : null;

      const enter = useCallback(() => {
        const frame = getFrame();
        const sidebarCollapsed = frame ? frame.hasAttribute('data-sidebar-collapsed') : true;
        restoreSidebarRef.current = false;
        if (!sidebarCollapsed) {
          try { ctx.layout.toggleSidebar(); restoreSidebarRef.current = true; } catch {}
        }
        surfaceState.active = true;
        surfaceState.restoreSidebar = restoreSidebarRef.current;
        setActive(true);
      }, [ctx]);

      const exit = useCallback(() => {
        if (restoreSidebarRef.current) {
          try { ctx.layout.toggleSidebar(); } catch {}
          restoreSidebarRef.current = false;
        }
        surfaceState.active = false;
        surfaceState.restoreSidebar = false;
        setActive(false);
      }, [ctx]);

      useEffect(() => {
        if (!active) return undefined;
        const onKey = (e) => {
          if (e.key === 'Escape') { e.preventDefault(); exit(); }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
      }, [active, exit]);

      return h(
        'div',
        {
          ref: rootRef,
          style: { position: 'absolute', top: 52, right: 12, pointerEvents: 'auto', zIndex: 30 },
        },
        active && h('style', null, HIDE_CSS),
        h(
          'button',
          {
            type: 'button',
            onClick: () => (active ? exit() : enter()),
            title: active ? t('exit') : t('enter'),
            'aria-label': active ? t('exit') : t('enter'),
            style: {
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 34,
              height: 34,
              padding: 0,
              color: 'var(--dsw-alias-label-primary, #e8e8ea)',
              background: 'rgba(20, 20, 23, 0.55)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: 10,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.30)',
            },
          },
          h(
            'svg',
            { viewBox: '0 0 16 16', width: 16, height: 16, 'aria-hidden': true, style: { display: 'block' } },
            active
              ? h('path', {
                  d: 'M2 6h5V1M14 10H9v5M14 6V1H9M2 10v5h5',
                  fill: 'none',
                  stroke: 'currentColor',
                  strokeWidth: 1.6,
                  strokeLinecap: 'round',
                })
              : h('path', {
                  d: 'M6 1v5H1M10 15v-5h5M10 1v5h5M6 15v-5H1',
                  fill: 'none',
                  stroke: 'currentColor',
                  strokeWidth: 1.6,
                  strokeLinecap: 'round',
                }),
          ),
        ),
      );
    }

    return {
      inject: ['slots', 'layout', 'locale'],
      apply(ctx) {
        ctx.locale.register('dsh-maximize', 'zh', { enter: '全屏', exit: '退出全屏' });
        ctx.locale.register('dsh-maximize', 'en', { enter: 'Fullscreen', exit: 'Exit fullscreen' });
        const t = ctx.locale.bind('dsh-maximize');
        ctx.slots.inject('shell.overlay', () =>
          ctx.slots.register(
            { name: 'shell.overlay', id: 'dsh-maximize', order: 10 },
            () => h(MaximizeButton, { ctx, t }),
          ),
        );
      },
    };
  },
});
