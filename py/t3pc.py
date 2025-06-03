from compiler import Compiler
from interpreter import Interpreter


def repl():
    compiler = Compiler()
    interpreter = Interpreter()

    print("Tiny-Three-Pass-Compiler (t3pc)")
    print("Enter assembly in [ ] or arguments separated by space")
    print("Type 'exit' to quit\n")

    while True:
        try:
            code = input("t3pc> ").strip()

            if code.lower() == "exit":
                break

            if not code:
                continue

            if code.startswith("["):
                # 编译模式
                asm = compiler.compile(code)
                print("Compiled ASM:", " | ".join(asm))
                interpreter.load(asm)
            else:
                # 执行模式
                if interpreter.asm is None:
                    print("Error: No program loaded! Enter assembly in [ ] first")
                    continue

                # 解析参数
                args = []
                for arg in code.split():
                    try:
                        args.append(int(arg))
                    except ValueError:
                        print(f"Warning: Skipping invalid argument '{arg}'")

                # 执行并打印结果
                result = interpreter.interpret(args)
                print(f"Result: {result}")

        except KeyboardInterrupt:
            print("\nExiting...")
            break
        except Exception as e:
            print(f"Error: {str(e)}")


if __name__ == "__main__":
    repl()
