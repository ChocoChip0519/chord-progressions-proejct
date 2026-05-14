import React from 'react';

const Icon = ({ name, size = 16, color = "currentColor", strokeWidth = 2 }) => {
  const paths = {
    play: <polygon points="6 4 20 12 6 20 6 4" fill={color} stroke="none" />,
    stop: <rect x="6" y="6" width="12" height="12" rx="1.5" fill={color} stroke="none" />,
    undo: <><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-15-6.7L3 13"/></>,
    redo: <><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 15-6.7L21 13"/></>,
    sparkles: <><path d="M9.94 14.5L9 17l-.94-2.5L5.5 13.5l2.56-.94L9 10l.94 2.56L12.5 13.5z"/><path d="M18 6l-.94 2.56L14.5 9.5l2.56.94L18 13l.94-2.56L21.5 9.5l-2.56-.94z"/></>,
    trash: <><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8 1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></>,
    music: <><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></>,
    piano: <><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 6v8M10 6v8M14 6v8M18 6v8"/></>,
    bulb: <><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7c1 1 1.5 2.3 1.5 3.3h5c0-1 .5-2.3 1.5-3.3A7 7 0 0 0 12 2z"/></>,
    plus: <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    arrow: <polyline points="9 6 15 12 9 18"/>,
    star: <polygon points="12 2 15.1 8.6 22 9.5 17 14.4 18.2 21.5 12 18 5.8 21.5 7 14.4 2 9.5 8.9 8.6 12 2"/>,
    note: <><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></>,
    keyboard: <><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M6 14h12"/></>,
    check: <polyline points="20 6 9 17 4 12"/>,
  };
  const fill = (name === "play" || name === "stop" || name === "star") ? color : "none";
  const stroke = fill === "none" ? color : "none";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
      strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
      style={{ display: "block", flexShrink: 0 }}>
      {paths[name]}
    </svg>
  );
};

export default Icon;
