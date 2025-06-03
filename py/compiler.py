import re


class Compiler(object):

    def compile(self, program):
        return self.pass3(self.pass2(self.pass1(program)))

    def tokenize(self, program):
        """Turn a program string into an array of tokens.  Each token
        is either '[', ']', '(', ')', '+', '-', '*', '/', a variable
        name or a number (as a string)"""
        token_iter = (
            m.group(0) for m in re.finditer(r"[-+*/()[\]]|[A-Za-z]+|\d+", program)
        )
        return [int(tok) if tok.isdigit() else tok for tok in token_iter]

    def pass1(self, program):
        """Returns an un-optimized AST"""
        tokens = self.tokenize(program)
        p = 0
        arg_list = []

        def consume(word):
            nonlocal p
            if p < len(tokens) and tokens[p] == word:
                p += 1
                return word

        def p_function():
            if consume("["):
                p_args()
                consume("]")
                return p_expression()

        def p_args():
            variable = t_variable()
            while variable:
                arg_list.append(variable)
                variable = t_variable()
            return arg_list

        def p_expression():
            term = p_term()
            while operator := consume("+") or consume("-"):
                term2 = p_term()
                term = {"op": operator, "a": term, "b": term2}
            return term

        def p_term():
            factor = p_factor()
            while operator := consume("*") or consume("/"):
                factor2 = p_factor()
                factor = {
                    "op": operator,
                    "a": factor,
                    "b": factor2,
                }
            return factor

        def p_factor():
            if consume("("):
                exp = p_expression()
                consume(")")
                return exp

            if number := t_number():
                return {"op": "imm", "n": number}

            if variable := t_variable():
                return {"op": "arg", "n": arg_list.index(variable)}

        def t_variable():
            nonlocal p
            word = tokens[p]
            if isinstance(word, str) and word.isalpha():
                p += 1
                return word

        def t_number():
            nonlocal p
            num = tokens[p]
            if isinstance(num, int):
                p += 1
                return num

        return p_function()

    def pass2(self, ast):
        """Returns an AST with constant expressions reduced"""

        def reduce(node):
            if node["op"] == "imm" or node["op"] == "arg":
                return node
            a = reduce(node["a"])
            b = reduce(node["b"])
            if a["op"] == "imm" and b["op"] == "imm":
                v = 0
                if node["op"] == "+":
                    v = a["n"] + b["n"]
                if node["op"] == "-":
                    v = a["n"] - b["n"]
                if node["op"] == "*":
                    v = a["n"] * b["n"]
                if node["op"] == "/":
                    v = a["n"] / b["n"]
                return {"op": "imm", "n": v}
            return {"op": node["op"], "a": a, "b": b}

        return reduce(ast)

    def pass3(self, ast):
        """Returns assembly instructions"""
        asm = []

        def ins(word):
            asm.append(word)

        def assemble(node):
            if node["op"] == "imm":
                ins(f"IM {node['n']}")
            elif node["op"] == "arg":
                ins(f"AR {node['n']}")
            else:
                assemble(node["a"])
                ins("PU")
                assemble(node["b"])
                ins("SW")
                ins("PO")
                ins(["AD", "SU", "MU", "DI"]["+-*/".index(node["op"])])

        assemble(ast)
        return asm
