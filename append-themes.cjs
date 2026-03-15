const fs = require('fs');

const THEMES_CSS = `
/* ========================================================= */
/* ======================= THEMES ========================== */
/* ========================================================= */

[data-theme="terminal-orange"] {
  --red: #111111;
  --white: #ff9d00;
  --black: #000000;
  --green: #ffb100;
  --border: 1px solid var(--white);
  --shadow: 0 0 10px rgba(255, 157, 0, 0.4);
}
[data-theme="terminal-orange"] .card:hover { border-color: #ffb100; color: var(--white); background: #2a1a00; box-shadow: 0 0 15px rgba(255, 157, 0, 0.6); }
[data-theme="terminal-orange"] .card:active { box-shadow: 0 0 5px rgba(255, 157, 0, 0.8); }
[data-theme="terminal-orange"] .btn { box-shadow: inset 0 0 4px rgba(255,157,0,0.5); }
[data-theme="terminal-orange"] .btn:hover { box-shadow: inset 0 0 8px rgba(255,157,0,0.8); }
[data-theme="terminal-orange"] .btn:active { box-shadow: inset 0 0 12px rgba(255,157,0,1); }
[data-theme="terminal-orange"] input:focus, [data-theme="terminal-orange"] select:focus { outline: 1px solid #ffb100; }
[data-theme="terminal-orange"] .modal { box-shadow: 0 0 20px rgba(255, 157, 0, 0.4); }
[data-theme="terminal-orange"] .panelDone { background: #2a1a00; color: #ffb100; }
[data-theme="terminal-orange"] .panelDone .pill { background: #ff9d00; color: #0d0d0d; }

[data-theme="terminal-green"] {
  --red: #111111;
  --white: #00ff00;
  --black: #000000;
  --green: #00ffaa;
  --border: 1px solid var(--white);
  --shadow: 0 0 10px rgba(0, 255, 0, 0.4);
}
[data-theme="terminal-green"] .card:hover { border-color: #00ffaa; color: var(--white); background: #002200; box-shadow: 0 0 15px rgba(0, 255, 0, 0.6); }
[data-theme="terminal-green"] .card:active { box-shadow: 0 0 5px rgba(0, 255, 0, 0.8); }
[data-theme="terminal-green"] .btn { box-shadow: inset 0 0 4px rgba(0,255,0,0.5); }
[data-theme="terminal-green"] .btn:hover { box-shadow: inset 0 0 8px rgba(0,255,0,0.8); }
[data-theme="terminal-green"] .btn:active { box-shadow: inset 0 0 12px rgba(0,255,0,1); }
[data-theme="terminal-green"] input:focus, [data-theme="terminal-green"] select:focus { outline: 1px solid #00ffaa; }
[data-theme="terminal-green"] .modal { box-shadow: 0 0 20px rgba(0, 255, 0, 0.4); }
[data-theme="terminal-green"] .panelDone { background: #002200; color: #00ffaa; }
[data-theme="terminal-green"] .panelDone .pill { background: #00ff00; color: #0d0d0d; }

[data-theme="neumorphism"] {
  --red: #e0e5ec;
  --white: #e0e5ec;
  --black: #4a5568;
  --green: #bed2bc;
  --border: none;
  --shadow: 9px 9px 16px rgba(163,177,198,0.6), -9px -9px 16px rgba(255,255,255,0.8);
}
[data-theme="neumorphism"] .card { background: #e0e5ec; color: #4a5568; }
[data-theme="neumorphism"] .card:hover { background: #e0e5ec; border-color: transparent; color: #2d3748; box-shadow: 5px 5px 10px rgba(163,177,198,0.6), -5px -5px 10px rgba(255,255,255,0.8); }
[data-theme="neumorphism"] .card:active { box-shadow: inset 6px 6px 10px 0 rgba(163,177,198,0.5), inset -6px -6px 10px 0 rgba(255,255,255,0.9); }
[data-theme="neumorphism"] .btn { box-shadow: 6px 6px 10px 0 rgba(163, 177, 198, 0.5), -6px -6px 10px 0 rgba(255, 255, 255, 0.8); }
[data-theme="neumorphism"] .btn:hover { box-shadow: 2px 2px 5px 0 rgba(163, 177, 198, 0.5), -2px -2px 5px 0 rgba(255, 255, 255, 0.8); }
[data-theme="neumorphism"] .btn:active { box-shadow: inset 4px 4px 6px 0 rgba(163, 177, 198, 0.5), inset -4px -4px 6px 0 rgba(255, 255, 255, 0.8); }
[data-theme="neumorphism"] .modal, [data-theme="neumorphism"] .panel { box-shadow: 9px 9px 16px rgba(163,177,198,0.6), -9px -9px 16px rgba(255,255,255,0.8); background: #e0e5ec; border: none; }
[data-theme="neumorphism"] input, [data-theme="neumorphism"] select { border: none; box-shadow: inset 4px 4px 6px 0 rgba(163, 177, 198, 0.5), inset -4px -4px 6px 0 rgba(255, 255, 255, 0.8); }
[data-theme="neumorphism"] input:focus, [data-theme="neumorphism"] select:focus { outline: none; box-shadow: inset 6px 6px 10px 0 rgba(163, 177, 198, 0.6), inset -6px -6px 10px 0 rgba(255, 255, 255, 0.9); }
[data-theme="neumorphism"] .appHeader { border-bottom: none; box-shadow: 0 4px 10px rgba(163,177,198,0.3); background: #e0e5ec; color: #4a5568; }
[data-theme="neumorphism"] .quoteBar { border-top: none; box-shadow: 0 -4px 10px rgba(163,177,198,0.3); background: #e0e5ec; color: #4a5568; }
[data-theme="neumorphism"] .hoverProgress { background: #e0e5ec; color: #4a5568; box-shadow: 0 -4px 10px rgba(163,177,198,0.3); }
[data-theme="neumorphism"] .pill { background: #e0e5ec; border: none; color: #4a5568; box-shadow: inset 2px 2px 5px rgba(163, 177, 198, 0.5), inset -2px -2px 5px rgba(255, 255, 255, 0.8); }
[data-theme="neumorphism"] .bar { border: none; box-shadow: inset 4px 4px 6px rgba(163,177,198,0.5), inset -4px -4px 6px rgba(255,255,255,0.8); }
[data-theme="neumorphism"] .barFill { background: #4a5568; }
[data-theme="neumorphism"] .iconBtn, [data-theme="neumorphism"] .pinBtn { border: none; }
[data-theme="neumorphism"] .modalHeader { background: #e0e5ec; color: #4a5568; border-bottom: 1px solid rgba(163,177,198,0.3); }
[data-theme="neumorphism"] .panelDone { background: #f0f4f8; }
[data-theme="neumorphism"] .quoteManageRow { border: none; background: #e0e5ec; box-shadow: inset 4px 4px 6px rgba(163,177,198,0.5), inset -4px -4px 6px rgba(255,255,255,0.8); color: #4a5568; }
`;

fs.appendFileSync('src/styles.css', THEMES_CSS);
console.log("Themes added to styles.css");
