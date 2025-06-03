import Compiler from './compiler.js'
import Interpreter from './interpreter.js'
import { createInterface } from 'readline'
import { stdin, stdout, exit } from 'process'

const compiler = new Compiler()
const interpreter = new Interpreter()

// const rl = createInterface({
//     input: stdin,
//     output: stdout
// })

// function repl(fn) {
//     rl.question('t3pc> ', (...args) => {
//         fn(...args)
//         return repl(fn)
//     })
// }

// repl((code) => {
//     code = code.trim()
//     if (code.startsWith('[')) {
//         const asm = compiler.compile(code)
//         console.log(asm.join(' | '))
//         interpreter.load(asm)
//     }
//     else {
//         if (interpreter.asm) {
//             const args = code.split(' ').map(i => parseInt(i)).filter(i => !isNaN(i))
//             console.log(interpreter.interpret(args))
//         }
//     }
// })

class REPL {
    constructor() {
        this.compiler = new Compiler();
        this.interpreter = new Interpreter();
        this.rl = createInterface({
            input: stdin,
            output: stdout
        });
    }

    start() {
        console.log("Tiny-Three-Pass-Compiler (t3pc)");
        console.log("Enter assembly in [ ] or arguments separated by space");
        console.log("Type 'exit' to quit\n");

        this.prompt();
    }

    prompt() {
        this.rl.question('t3pc> ', (input) => {
            input = input.trim();

            if (input.toLowerCase() === 'exit') {
                this.rl.close();
                return;
            }

            if (!input) {
                this.prompt();
                return;
            }

            try {
                if (input.startsWith('[')) {
                    // 编译模式
                    const asm = this.compiler.compile(input);
                    console.log(`Compiled ASM: ${asm.join(' | ')}`);
                    this.interpreter.load(asm);
                } else {
                    // 执行模式
                    if (!this.interpreter.asm) {
                        console.log("Error: No program loaded! Enter assembly in [ ] first");
                        this.prompt();
                        return;
                    }

                    // 解析参数
                    const args = input.split(/\s+/)
                        .map(i => parseInt(i))
                        .filter(n => !isNaN(n));

                    const result = this.interpreter.interpret(args);
                    console.log(`Result: ${result}`);
                }
            } catch (error) {
                console.error(`Error: ${error.message}`);
            }

            this.prompt();
        });
    }

    close() {
        this.rl.close();
        console.log("\nExiting...");
    }
}

// 启动REPL
const repl = new REPL();
repl.start();

// 处理关闭事件
repl.rl.on('close', () => {
    repl.close();
    exit(0);
});