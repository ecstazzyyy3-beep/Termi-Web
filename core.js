class CommandSystem {
    constructor() {
        this.commands = new Map();
        this.registerCoreCommands();
    }
    
    registerCoreCommands() {
        this.register('help', this.help.bind(this));
        this.register('ls', this.ls.bind(this));
        this.register('cd', this.cd.bind(this));
        this.register('pwd', this.pwd.bind(this));
        this.register('cat', this.cat.bind(this));
        this.register('echo', this.echo.bind(this));
        this.register('clear', this.clear.bind(this));
        this.register('mkdir', this.mkdir.bind(this));
        this.register('touch', this.touch.bind(this));
        this.register('rm', this.rm.bind(this));
        this.register('neofetch', this.neofetch.bind(this));
    }
    
    register(name, handler) {
        this.commands.set(name, handler);
    }
    
    async execute(input, terminal, fs) {
        const parts = input.split(' ');
        const cmd = parts[0];
        const args = parts.slice(1);
        
        if (this.commands.has(cmd)) {
            await this.commands.get(cmd)(args, terminal, fs);
        } else {
            terminal.write(`\x1b[31mCommand not found: ${cmd}\x1b[0m\r\n`);
            terminal.write(`Type 'help' for available commands\r\n`);
        }
    }
    
    help(args, terminal, fs) {
        terminal.write(`
\x1b[32mAvailable Commands:\x1b[0m

\x1b[33mFile Operations:\x1b[0m
  ls, dir          List directory contents
  cd <dir>         Change directory
  pwd              Print working directory
  cat <file>       Display file contents
  mkdir <dir>      Create directory
  touch <file>     Create empty file
  rm <file>        Remove file/directory

\x1b[33mSystem:\x1b[0m
  neofetch         Display system information
  clear            Clear terminal
  echo <text>      Display text

\x1b[33mPackage Management:\x1b[0m
  pkg install <pkg>  Install package
  pkg list          List installed packages
  pkg search <term> Search packages

\x1b[33mProgramming:\x1b[0m
  python           Python interpreter
  node             Node.js REPL
  bash             Bash shell

\x1b[33mNetwork:\x1b[0m
  curl <url>       Fetch URL
  ping <host>      Ping host
  wget <url>       Download file

Type \x1b[36m<command> --help\x1b[0m for more info
        `);
    }
    
    async ls(args, terminal, fs) {
        const path = args[0] || '.';
        const files = await fs.listDirectory(path);
        
        if (files.length === 0) {
            terminal.write('(empty directory)\r\n');
            return;
        }
        
        files.forEach(file => {
            const color = file.type === 'directory' ? '\x1b[34m' : '\x1b[32m';
            const suffix = file.type === 'directory' ? '/' : '';
            terminal.write(`${color}${file.name}${suffix}\x1b[0m    `);
        });
        terminal.write('\r\n');
    }
    
    async cd(args, terminal, fs) {
        if (args.length === 0) {
            fs.setCurrentDirectory('~');
        } else {
            const newDir = args[0];
            const success = await fs.changeDirectory(newDir);
            
            if (!success) {
                terminal.write(`\x1b[31mcd: ${newDir}: No such directory\x1b[0m\r\n`);
            }
        }
        
        terminal.write(`\x1b[33mCurrent directory: ${fs.getCurrentDirectory()}\x1b[0m\r\n`);
    }
    
    pwd(args, terminal, fs) {
        terminal.write(`${fs.getCurrentDirectory()}\r\n`);
    }
    
    async cat(args, terminal, fs) {
        if (args.length === 0) {
            terminal.write('\x1b[31mUsage: cat <filename>\x1b[0m\r\n');
            return;
        }
        
        const content = await fs.readFile(args[0]);
        if (content !== null) {
            terminal.write(`${content}\r\n`);
        } else {
            terminal.write(`\x1b[31mcat: ${args[0]}: No such file\x1b[0m\r\n`);
        }
    }
    
    echo(args, terminal, fs) {
        terminal.write(`${args.join(' ')}\r\n`);
    }
    
    clear(args, terminal, fs) {
        terminal.clear();
    }
    
    neofetch(args, terminal, fs) {
        const art = `
\x1b[32m        .          \x1b[0m    \x1b[36muser@termi-web\x1b[0m
\x1b[32m       .:.         \x1b[0m    \x1b[36m-------------\x1b[0m
\x1b[32m      .:::.        \x1b[0m    \x1b[33mOS\x1b[0m: Termi-Web Linux
\x1b[32m  .....:::::.....  \x1b[0m    \x1b[33mHost\x1b[0m: Browser VM
\x1b[32m ::::::::::::::::: \x1b[0m    \x1b[33mKernel\x1b[0m: WebAssembly 5.4
\x1b[32m ::::::::::::::::: \x1b[0m    \x1b[33mUptime\x1b[0m: 0 days
\x1b[32m  ':::::::::::::'  \x1b[0m    \x1b[33mPackages\x1b[0m: 12
\x1b[32m    ':::::::'      \x1b[0m    \x1b[33mShell\x1b[0m: termi-sh 1.0
\x1b[32m       ':'         \x1b[0m    \x1b[33mTerminal\x1b[0m: xterm.js
        `;
        terminal.write(art + '\r\n');
    }
    
    async mkdir(args, terminal, fs) {
        if (args.length === 0) {
            terminal.write('\x1b[31mUsage: mkdir <directory>\x1b[0m\r\n');
            return;
        }
        
        const success = await fs.createDirectory(args[0]);
        if (!success) {
            terminal.write(`\x1b[31mmkdir: cannot create directory '${args[0]}'\x1b[0m\r\n`);
        }
    }
    
    async touch(args, terminal, fs) {
        if (args.length === 0) {
            terminal.write('\x1b[31mUsage: touch <filename>\x1b[0m\r\n');
            return;
        }
        
        const success = await fs.createFile(args[0], '');
        if (!success) {
            terminal.write(`\x1b[31mtouch: cannot create file '${args[0]}'\x1b[0m\r\n`);
        }
    }
    
    async rm(args, terminal, fs) {
        if (args.length === 0) {
            terminal.write('\x1b[31mUsage: rm <file/directory>\x1b[0m\r\n');
            return;
        }
        
        const success = await fs.delete(args[0]);
        if (!success) {
            terminal.write(`\x1b[31mrm: cannot remove '${args[0]}'\x1b[0m\r\n`);
        }
    }
}