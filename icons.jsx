// Carbon-style icons (16px) as React components
// All icons use currentColor; size via width/height props

const Icon = ({ d, size = 16, className, style, viewBox = "0 0 16 16" }) =>
  React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: size, height: size, viewBox, fill: "currentColor", className, style, "aria-hidden": true,
  }, React.createElement("path", { d }));

const IconMulti = ({ paths, size = 16, viewBox = "0 0 16 16", style, className }) =>
  React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: size, height: size, viewBox, fill: "currentColor", className, style, "aria-hidden": true,
  }, paths.map((p, i) => React.createElement("path", { key: i, ...p })));

const Icons = {
  Search:    (p) => React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: p?.size || 16, height: p?.size || 16, viewBox: "0 0 32 32",
    fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round",
    "aria-hidden": true,
  }, [
    React.createElement("circle", { key: "c", cx: 14, cy: 14, r: 8 }),
    React.createElement("line", { key: "l", x1: 20, y1: 20, x2: 27, y2: 27 }),
  ]),
  Close:     (p) => <Icon {...p} d="M12 4.7L11.3 4 8 7.3 4.7 4 4 4.7 7.3 8 4 11.3l.7.7L8 8.7l3.3 3.3.7-.7L8.7 8z" />,
  CloseLg:   (p) => <Icon {...p} size={20} viewBox="0 0 20 20" d="M15 5.7L14.3 5 10 9.3 5.7 5 5 5.7 9.3 10 5 14.3l.7.7L10 10.7 14.3 15l.7-.7L10.7 10z" />,
  ChevronDown: (p) => <Icon {...p} d="M8 11L3 6l.7-.7L8 9.6l4.3-4.3.7.7z" />,
  ChevronUp:   (p) => <Icon {...p} d="M8 5l5 5-.7.7L8 6.4l-4.3 4.3L3 10z" />,
  ChevronLeft: (p) => <Icon {...p} d="M5 8l5-5 .7.7L6.4 8l4.3 4.3-.7.7z" />,
  ChevronRight:(p) => <Icon {...p} d="M11 8l-5 5-.7-.7L9.6 8 5.3 3.7 6 3z" />,
  ArrowsVert:  (p) => <Icon {...p} d="M11 10.6V2H10v8.6L8.4 9 7.7 9.7 10.5 12.5 13.3 9.7 12.6 9zM5 5.4V14H6V5.4l1.6 1.6.7-.7L5.5 3.5 2.7 6.3l.7.7z" />,
  Caret:       (p) => <Icon {...p} d="M8 11L3 6h10z" />,
  Filter:      (p) => <Icon {...p} d="M9 14H7v-3.5L2 4V2h12v2l-5 6.5V14zM3.2 3l4.7 6.2.1.1V13H8V9.3l.1-.1L12.8 3H3.2z" />,
  Settings:    (p) => <Icon {...p} d="M13.4 9c.1-.3.1-.7.1-1s0-.7-.1-1l1.4-1.1-1.5-2.6-1.7.6c-.5-.4-1-.7-1.6-.9L9.7 1H6.3l-.3 1.9c-.6.2-1.1.5-1.6.9l-1.7-.6L1.2 5.9 2.6 7c-.1.3-.1.7-.1 1s0 .7.1 1L1.2 10.1l1.5 2.6 1.7-.6c.5.4 1 .7 1.6.9L6.3 15h3.4l.3-1.9c.6-.2 1.1-.5 1.6-.9l1.7.6 1.5-2.6L13.4 9zM8 11.5C6.1 11.5 4.5 9.9 4.5 8S6.1 4.5 8 4.5 11.5 6.1 11.5 8 9.9 11.5 8 11.5z" />,
  Add:         (p) => <Icon {...p} d="M9 7V3H7v4H3v2h4v4h2V9h4V7H9z" />,
  Edit:        (p) => <Icon {...p} d="M11.6 1.4l-9.2 9.2L1 15l4.4-1.4 9.2-9.2-3-3zM3 12l1.7-1.7L5.7 11.3 4 13l-1-1zm3-1.4l-1-1L11.6 3l1 1L6 10.6z" />,
  Save:        (p) => <Icon {...p} d="M13 2H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1zm-2 1v3H5V3h6zM3 13V3h1v4h8V3h1v10H3z" />,
  Check:       (p) => <Icon {...p} d="M6.5 12L2 7.5l1-1L6.5 10 13 3.5l1 1z" />,
  CheckmarkFilled: (p) => <Icon {...p} d="M8 1a7 7 0 1 0 7 7 7 7 0 0 0-7-7zM7 11.4L3.6 8 4.7 6.9 7 9.2l4.3-4.3 1.1 1.1z" />,
  WarningFilled:   (p) => <Icon {...p} d="M8 1a7 7 0 1 0 7 7 7 7 0 0 0-7-7zm-.5 3h1v5h-1V4zM8 12.2a.9.9 0 1 1 .9-.9.9.9 0 0 1-.9.9z" />,
  ErrorFilled:     (p) => <Icon {...p} d="M8 1a7 7 0 1 0 7 7 7 7 0 0 0-7-7zm3.5 9.4l-1 1L8 8.9l-2.5 2.5-1-1L7 8 4.5 5.5l1-1L8 7l2.5-2.5 1 1L9 8l2.5 2.4z" />,
  Information:     (p) => <Icon {...p} d="M8 1a7 7 0 1 0 7 7 7 7 0 0 0-7-7zm0 3a.9.9 0 1 1-.9.9.9.9 0 0 1 .9-.9zm1.5 8h-3v-1h1V7h-1V6h2v5h1v1z" />,
  Trash:        (p) => <Icon {...p} d="M6 6h1v6H6V6zM9 6h1v6H9V6z M11 3V1H5v2H1v1h1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V4h1V3h-3zM6 2h4v1H6V2zm6 12H4V4h8v10z" />,
  Reset:        (p) => <Icon {...p} d="M14 8a6 6 0 1 1-6-6V0L4 3l4 3V4a4 4 0 1 0 4 4h2z" />,
  Document:     (p) => <Icon {...p} d="M9.6 1H3v14h10V4.4L9.6 1zM9 2.4L11.6 5H9V2.4zM12 14H4V2h4v4h4v8z" />,
  Download:     (p) => <Icon {...p} d="M14 11v3H2v-3H1v3a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3h-1zM8 11.6l-3.3-3.3.7-.7L7.5 9.7V1h1v8.7l2.1-2.1.7.7L8 11.6z" />,
  User:         (p) => <Icon {...p} d="M8 8.5a3.5 3.5 0 1 0-3.5-3.5A3.5 3.5 0 0 0 8 8.5zm0-6a2.5 2.5 0 1 1-2.5 2.5A2.5 2.5 0 0 1 8 2.5zM14 16h-1v-2.5a2.5 2.5 0 0 0-2.5-2.5h-5A2.5 2.5 0 0 0 3 13.5V16H2v-2.5A3.5 3.5 0 0 1 5.5 10h5a3.5 3.5 0 0 1 3.5 3.5V16z" />,
  Bolt:         (p) => <Icon {...p} d="M9 1L3 9h4l-1 6 6-8H8z" />,
  Notification: (p) => <Icon {...p} d="M14 11.7L13 11V8a5 5 0 0 0-4-4.9V2a1 1 0 0 0-2 0v1.1A5 5 0 0 0 3 8v3l-1 .7V13h12v-1.3zM7 14a1 1 0 0 0 2 0H7z" />,
  Help:         (p) => <Icon {...p} d="M8 1a7 7 0 1 0 7 7 7 7 0 0 0-7-7zm0 13a6 6 0 1 1 6-6 6 6 0 0 1-6 6zM8 11a.5.5 0 1 0 .5.5A.5.5 0 0 0 8 11zm.5-7h-1A1.5 1.5 0 0 0 6 5.5V6h1v-.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5c0 1-1.5 1-1.5 2.5V9h1v-.5c0-1 1.5-1 1.5-2.5A1.5 1.5 0 0 0 8.5 4z" />,
  Switcher:     (p) => <Icon {...p} d="M2 2h4v4H2V2zm0 5h4v4H2V7zm0 5h4v4H2v-4zM7 2h4v4H7V2zm0 5h4v4H7V7zm0 5h4v4H7v-4zm5-10h4v4h-4V2zm0 5h4v4h-4V7zm0 5h4v4h-4v-4z" />,
  Hamburger:    (p) => <Icon {...p} d="M2 12h12v1H2zm0-3h12v1H2zm0-3h12v1H2zm0-3h12v1H2z" />,
  ZoomIn:       (p) => <Icon {...p} d="M8.5 6V8H10v1H8.5v2H7.5V9H6V8h1.5V6zM11.5 10.5l3.4 3.4-.7.7-3.4-3.4a5.5 5.5 0 1 1 .7-.7zM6.5 11a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9z" />,
  Send:         (p) => <Icon {...p} d="M2 2v5l9 1-9 1v5l13-6z" />,
  ChevronDoubleLeft: (p) => <Icon {...p} d="M9 8l4 4-.7.7L7.6 8l4.7-4.7.7.7zM4 8l4 4-.7.7L2.6 8l4.7-4.7.7.7z" />,
  ChevronDoubleRight:(p) => <Icon {...p} d="M7 8l-4-4 .7-.7L8.4 8 3.7 12.7 3 12zm5 0l-4-4 .7-.7L13.4 8 8.7 12.7 8 12z" />,
  Politician:   (p) => <Icon {...p} d="M8 8a3 3 0 1 0-3-3 3 3 0 0 0 3 3zm0-5a2 2 0 1 1-2 2 2 2 0 0 1 2-2zm6 12h-1v-1.5a3.5 3.5 0 0 0-3.5-3.5h-3A3.5 3.5 0 0 0 3 13.5V15H2v-1.5A4.5 4.5 0 0 1 6.5 9h3a4.5 4.5 0 0 1 4.5 4.5V15z" />,
  Building:     (p) => <Icon {...p} d="M14 7V1H2v14h12V7zm-1 7H8v-3H4v3H3V2h10v12zm-2-9h-2V3h2v2zM7 5H5V3h2v2zm4 3H9V6h2v2zM7 8H5V6h2v2zm4 3H9V9h2v2z" />,
  Calendar:     (p) => <Icon {...p} d="M11 1v2H5V1H4v2H1v12h14V3h-3V1h-1zM2 14V8h12v6H2zm12-7H2V4h2v1h1V4h6v1h1V4h2v3z" />,
  Renew:        (p) => <Icon {...p} d="M14 11l-2 2v-1.5A4.5 4.5 0 0 1 7.5 16H6v-1h1.5A3.5 3.5 0 0 0 11 11.5V11l-2-2 1-1 4 3zM2 5l2-2v1.5A4.5 4.5 0 0 1 8.5 0H10v1H8.5A3.5 3.5 0 0 0 5 4.5V5l2 2-1 1-4-3z" />,
  Note:         (p) => <Icon {...p} d="M14 4h-3V1H1v14h13V4zm-3-1.6L13.6 5H11V2.4zM2 14V2h8v4h3v8H2zM4 8h6v1H4V8zm0 2h8v1H4v-1zm0 2h8v1H4v-1zM4 6h4v1H4V6zM4 4h3v1H4V4z" />,
  Idea:         (p) => <Icon {...p} d="M8 1a5 5 0 0 0-3 9v2.5A1.5 1.5 0 0 0 6.5 14h3a1.5 1.5 0 0 0 1.5-1.5V10A5 5 0 0 0 8 1zm2 11.5a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5V12h4v.5zm-.5-1.5h-3v-1h3v1zm.4-2H6.1A4 4 0 1 1 12 6a4 4 0 0 1-2.1 3z" />,
  Image:        (p) => <Icon {...p} d="M14 1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 14V2h12v12H2zm9-9.5a1.5 1.5 0 1 1-1.5-1.5 1.5 1.5 0 0 1 1.5 1.5zM12 13H4v-2l2-2 2 2 3-3 1 1v4z" />,
  Globe:        (p) => <Icon {...p} d="M8 1a7 7 0 1 0 7 7 7 7 0 0 0-7-7zM2 8a6 6 0 0 1 .5-2.4A8.6 8.6 0 0 0 5 6.4a13 13 0 0 0-.4 3 6 6 0 0 1-2.6-1.4zm.9 2A7 7 0 0 0 5 11.4 8.4 8.4 0 0 0 6 13.3 6 6 0 0 1 2.9 10zm9.6 3.3A8.4 8.4 0 0 0 11 11.4a7 7 0 0 0 2.1-1.4 6 6 0 0 1-3.1 3.3zm-1.1-3.9A11 11 0 0 1 8 10a11 11 0 0 1-3.4-.6 11.4 11.4 0 0 1-.4-3 11.4 11.4 0 0 1 .4-3A11 11 0 0 1 8 3a11 11 0 0 1 3.4.6 11.4 11.4 0 0 1 .4 3 11.4 11.4 0 0 1-.4 2.8zm0-5.7A8.6 8.6 0 0 0 13.5 5.6 6 6 0 0 1 13.5 10.4a8.6 8.6 0 0 0-2.1-.8 13 13 0 0 0 .4-3 13 13 0 0 0-.4-3z" />,
  Subtract:     (p) => <Icon {...p} d="M3 7h10v2H3z" />,
};

window.Icons = Icons;
