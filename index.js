import Compiler from './compiler.js'
import Interpreter from './interpreter.js'
import { createInterface } from 'readline'
import { stdin, stdout, exit } from 'process'

const compiler = new Compiler()
const interpreter = new Interpreter()

const rl = createInterface({
    input: stdin,
    output: stdout
})

function repl(fn) {
    rl.question('t3pc> ', (...args) => {
        fn(...args)
        return repl(fn)
    })
}

repl((code) => {
    code = code.trim()
    if (code.startsWith('[')) {
        const asm = compiler.compile(code)
        console.log(asm.join(' | '))
        interpreter.load(asm)
    }
    else {
        if (interpreter.asm) {
            const args = code.split(' ').map(i => parseInt(i)).filter(i => !isNaN(i))
            console.log(interpreter.interpret(args))
        }
    }
})