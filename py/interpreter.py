class Interpreter:
    def __init__(self):
        self.asm = None

    def load(self, asm):
        self.asm = asm

    def interpret(self, args):
        r0 = None
        r1 = None
        stack = []

        for instruct in self.asm:
            # 分解指令和操作数
            parts = instruct.split()
            ins = parts[0] if parts else None
            n = int(parts[1]) if len(parts) > 1 else 0

            if ins == "IM":
                r0 = n
            elif ins == "AR":
                r0 = args[n]
            elif ins == "SW":
                r0, r1 = r1, r0
            elif ins == "PU":
                stack.append(r0)
            elif ins == "PO":
                r0 = stack.pop()
            elif ins == "AD":
                r0 += r1
            elif ins == "SU":
                r0 -= r1
            elif ins == "MU":
                r0 *= r1
            elif ins == "DI":
                r0 //= r1
        return r0
