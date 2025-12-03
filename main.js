class TermiWeb {
    constructor() {
        this.terminal = null;
        this.currentPath = '~';
        this.fs = new VirtualFileSystem();
        this.commands = new CommandSystem();
        this.isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
        
        this.init();
    }
    
    async init() {
        await this.initFileSystem();
        this.initTerminal();
        this.initEvents();
        this.showWelcome();
    }
    
    initTerminal() {
        this.terminal = new Terminal({
            theme: {
                background: '#000000',
                foreground: '#00ff00',
                cursor: '#00ff00',
                black: '#000000',
                red: '#ff5555',
                green: '#00ff00',
                yellow: '#ffff55',
                blue: '#5555ff',
                magenta: '#ff55ff',
                cyan: '#55ffff',
                white: '#ffffff'
            },
            fontSize: this.isMobile ? 14 : 16,
            fontFamily: "'Courier New', monospace",
            cursorBlink: true,
            convertEol: true,
            scrollback: 1000
        });
        
        const fitAddon = new FitAddon.FitAddon();
        this.terminal.loadAddon(fitAddon);
        
        this.terminal.open(document.getElementById('terminal'));
        fitAddon.fit();
        
        this.terminal.onKey(({ key, domEvent }) => {
            this.handleKey(key, domEvent);
        });
        
        this.terminal.onData(data => {
            this.handleInput(data);
        });
    }
    
    async initFileSystem() {
        await this.fs.init();
        this.fs.createDefaultStructure();
    }
    
    initEvents() {
        // Кнопки навигации
        document.getElementById('clear-btn').addEventListener('click', () => {
            this.terminal.clear();
            this.showPrompt();
        });
        
        document.getElementById('help-btn').addEventListener('click', () => {
            this.showHelp();
        });
        
        // Мобильная клавиатура
        document.querySelectorAll('.term-key').forEach(button => {
            button.addEventListener('click', (e) => {
                const key = e.target.dataset.key;
                this.handleSpecialKey(key);
            });
        });
        
        // Адаптация под размер экрана
        window.addEventListener('resize', () => {
            this.terminal.fit();
        });
    }
    
    showWelcome() {
        const welcomeText = `
╔══════════════════════════════════════╗
║      🚀 Welcome to Termi-Web!        ║
║      Termux in your browser          ║
╚══════════════════════════════════════╝

Version: 1.0.0
Type 'help' for available commands
Type 'start' for interactive tutorial

${this.isMobile ? '📱 Mobile mode activated' : '💻 Desktop mode'}
        `;
        
        this.terminal.write(welcomeText);
        this.showPrompt();
    }
    
    showPrompt() {
        const user = 'user';
        const host = 'termi-web';
        this.terminal.write(`\r\n\x1b[32m${user}@${host}\x1b[0m:\x1b[34m${this.currentPath}\x1b[0m$ `);
    }
    
    async handleInput(data) {
        // Обработка ввода команд
        const input = data.trim();
        
        if (input) {
            this.terminal.write('\r\n');
            await this.commands.execute(input, this.terminal, this.fs);
            this.showPrompt();
        }
    }
    
    handleSpecialKey(key) {
        // Обработка специальных клавиш
        const keyMap = {
            'Tab': '\t',
            'Ctrl': '\x03',
            'Alt': '\x1b',
            '↑': '\x1b[A',
            '↓': '\x1b[B',
            'Esc': '\x1b',
            '|': '|',
            '&': '&',
            '>': '>',
            '<': '<'
        };
        
        if (keyMap[key]) {
            this.terminal.write(keyMap[key]);
        }
    }
    
    showHelp() {
        const help = `
Available commands:
• help - Show this message
• ls, dir - List directory contents
• cd <dir> - Change directory
• pwd - Print working directory
• cat <file> - Display file contents
• echo <text> - Display text
• clear - Clear terminal
• pkg install <package> - Install package
• python - Start Python interpreter
• node - Start Node.js
• exit - Exit shell

Filesystem: ${this.fs.storageQuota}MB available
        `;
        
        this.terminal.write(help);
    }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    window.termiWeb = new TermiWeb();
});