// =>
// expression ::= term
//              | term ('+' term)*
//              | term ('-' term)*

// term     ::= factor
//              | factor ('*' factor)*
//              | factor ('/' factor)*

// factor    ::= number
//              | variable
//              | '(' expression ')'


export default class Compiler {

    compile(code) {
        return this.pass3(this.pass2(this.pass1(code)))
    }

    pass1(code) {
        let p = 0
        let args = []

        function consume(word) {
            sync()
            if (code.substring(p, p + word.length) === word) {
                p += word.length
                return word
            }
            return undefined
        }

        function sync() {
            while (/\s/.test(code[p])) { ++p }
        }

        function pFunction() {
            if (consume('[')) {
                args = pArgList()
                consume(']')
                let expression = pExpression()
                return expression
            }
            return undefined
        }

        function pArgList() {
            let variable = tVariable()
            let argls = []
            while (variable) {
                argls.push(variable)
                variable = tVariable()
            }
            return argls
        }

        function pExpression() {
            let term = pTerm()

            let operator
            while (operator = consume('+') || consume('-')) {
                let term2 = pTerm()
                term = {
                    op: operator,
                    a: term,
                    b: term2
                }
            }
            return term
        }

        function pTerm() {
            let factor = pFactor()

            let operator
            while (operator = consume('*') || consume('/')) {
                let factor2 = pFactor()
                factor = {
                    op: operator,
                    a: factor,
                    b: factor2
                }
            }
            return factor
        }

        function pFactor() {
            if (consume('(')) {
                let expression = pExpression()
                consume(')')
                return expression
            }

            let number = tNumber()
            if (number) {
                return { op: 'imm', n: number }
            }

            let variable = tVariable()
            if (variable) {
                return {
                    op: 'arg',
                    n: args.indexOf(variable)
                }
            }
        }

        function tVariable() {
            sync()
            if (/[a-zA-Z]/.test(code[p])) {
                const str = code.substring(p).match(/^[a-zA-Z]+/)[0]
                p += str.length
                return str
            }
            return undefined
        }

        function tNumber() {
            sync()
            if (/[0-9]/.test(code[p])) {
                const str = code.substring(p).match(/^[0-9]+(\.[0-9]+)?/)[0]
                p += str.length
                return parseFloat(str)
            }
            return undefined
        }

        return pFunction()
    }

    pass2(ast) {
        function reduce(node) {
            if (node.op === 'imm' || node.op === 'arg') {
                return node
            }
            let a = reduce(node.a)
            let b = reduce(node.b)
            if (a.op === 'imm' && b.op === 'imm') {
                let v
                if (node.op === '+') { v = a.n + b.n }
                if (node.op === '-') { v = a.n - b.n }
                if (node.op === '*') { v = a.n * b.n }
                if (node.op === '/') { v = a.n / b.n }
                return { op: 'imm', n: v }
            }
            return { op: node.op, a, b }
        }

        return reduce(ast)
    }

    pass3(ast) {
        const asm = []
        function ins(word) { asm.push(word) }

        function assemble(node) {
            if (node.op === 'imm') { ins(`IM ${node.n}`) }
            else if (node.op === 'arg') { ins(`AR ${node.n}`) }
            else {
                const op = node.op
                assemble(node.a)
                ins('PU')
                assemble(node.b)
                ins('SW')
                ins('PO')
                ins(['AD', 'SU', 'MU', 'DI']['+-*/'.indexOf(op)])
            }
        }

        assemble(ast)
        return asm
    }
}
