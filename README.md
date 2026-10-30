# SAP-1 Computer Architecture Lab

A dependency-free, browser-based SAP-1 simulator for exploring an 8-bit data path, memory, registers, and instruction execution. Open the dashboard, load a sample or assemble a program, then step through real machine state while watching the W-Bus, control signals, RAM, register values, and output LEDs update.

## Learning objectives

- Trace the fetch, decode, and execute stages of a simple processor.
- Understand how PC, MAR, IR, accumulator, B-register, RAM, ALU, and output interact.
- Read hexadecimal, binary, and decimal representations of byte values.
- Observe 8-bit overflow and two's-complement subtraction.
- Relate control signals and bus transfers to each instruction.

## Features

- 16 editable RAM locations, 00H through FFH, displayed as hex and binary.
- LDA, ADD, SUB, OUT, and HLT instruction assembly and execution.
- Single-step instruction execution and timed Run/Pause controls.
- Optional fetch/decode/execute micro-operation trace and active control signals.
- Editable sample data, raw 16-byte memory editing, and validated import/export.
- Eight output LEDs; output changes only when OUT executes.
- Responsive architecture dashboard with PC, MAR, current instruction, and transfer highlights.
- In-browser data validation and a 64-instruction execution guard.

## Architecture and implementation choices

The processor uses 16 addressable bytes of RAM. PC and MAR are four bits; IR, accumulator A, B-register, and output are eight bits. PC wraps modulo 16. ADD and SUB keep the low eight bits of the result, so values wrap from FFH to 00H (and subtraction underflows modulo 256).

Each Step executes a complete instruction. The engine first copies PC to MAR, reads RAM into IR, increments PC, decodes the upper nibble, and executes the instruction. The lower nibble is used as an address only for LDA, ADD, and SUB. OUT and HLT ignore it; the assembler emits the specified EFH and FFH encodings.

The machine is a simplified SAP-1 teaching model. The bus display reports the most recent transfer of each instruction step, while the optional micro-operation list records every transfer in that instruction. Control signals are shown for the final/current transfer. Fetch increments PC before execution. Reset clears registers, output, bus activity, and log while preserving RAM. Loading or importing a full memory image resets execution state. Loading assembly overwrites its bytes starting at address 0H and preserves other RAM bytes. Loading the sample initializes RAM and writes the three data values from the editable fields.

The output register is independent from accumulator A: only OUT copies A to output. An unknown opcode halts with an error. Reaching 64 recognized instruction cycles without HLT triggers an execution-limit error. A RAM image is data, so it is only a valid executable program when its bytes form suitable instructions and it terminates before the guard.

## Instruction set

| Mnemonic | Opcode | Operand | Operation |
| --- | --- | --- | --- |
| LDA | `0000` | 4-bit address | A <- RAM[address] |
| ADD | `0001` | 4-bit address | A <- (A + RAM[address]) mod 256 |
| SUB | `0010` | 4-bit address | A <- (A - RAM[address]) mod 256 |
| OUT | `1110` | ignored | Output <- A |
| HLT | `1111` | ignored | Stop execution |

Machine bytes use opcode in the upper nibble and operand in the lower nibble. OUT and HLT assemble to EFH and FFH respectively. For example `LDA 9H` assembles to 09H (`00001001`).

## Control signals

Signals are active-high and reflect the most recent transfer shown on the W-Bus. The micro-operation trace lists the signals for each transfer.

| Signal | Meaning |
| --- | --- |
| PCout | PC places its address on the bus |
| MARin | MAR captures the bus address |
| RAMout | RAM places the selected byte on the bus |
| IRin | IR captures the instruction byte |
| PCinc | Increment PC modulo 16 |
| Ain | Accumulator captures a byte |
| Bin | B-register captures a byte |
| ALUadd | ALU performs 8-bit addition |
| ALUsub | ALU performs 8-bit subtraction |
| OUTin | Output register captures A |
| HLT | Stop instruction sequencing |

## Project files

```text
index.html       Simulator dashboard
style.css        Responsive interface and visual states
script.js        Browser UI, controls, memory editing, and import/export
sap1.mjs         Testable SAP-1 execution and assembly engine
test/sap1.test.mjs  Node built-in tests
README.md        Setup, design decisions, and user guide
.gitignore       Common local/generated files
```

## Run in VS Code

No package installation or build step is required. Open this folder in VS Code and use Live Server on `index.html`, or serve the folder with any simple local HTTP server. Modern browsers support the JavaScript ES modules used here. The two display fonts are optional web fonts; system fallbacks are provided.

## Using the simulator

1. Change the sample data at 9H, AH, and BH if desired, then select **Load sample**. The default computes 25H + 05H - 23H = 07H.
2. Select **Step** to execute one whole instruction, or **Run** and **Pause** for timed execution. Adjust the speed slider to change the delay between instructions.
3. Use **Reset** to clear registers and output while keeping RAM. Use **Clear RAM** to zero memory after confirmation.
4. Enter one instruction per line in the program editor and select **Load program**. Addresses for LDA, ADD, and SUB are one hexadecimal digit, optionally followed by H. `#` begins a comment. Loading assembly writes from 0H and preserves remaining memory.
5. Edit any RAM cell directly, or open **Raw memory editor** and apply exactly 16 hexadecimal bytes in address order. Invalid bytes and layouts are rejected.
6. Export memory to JSON, or import a JSON array, an object containing a `memory` array, or a text file containing 16 hexadecimal bytes.
7. Expand **Show micro-operations** to see individual transfers and their signals. The execution log records the instruction and arithmetic result.

## Sample calculations

| Data at 9H, AH, BH | Calculation | Output hex | Binary | Decimal |
| --- | --- | --- | --- | ---: |
| 25H, 05H, 23H | 25H + 05H - 23H | 07H | `00000111` | 7 |
| 10H, 20H, 05H | 10H + 20H - 05H | 2BH | `00101011` | 43 |
| FFH, 01H, 01H | FFH + 01H - 01H, modulo 256 | FFH | `11111111` | 255 |

## Tests

The app has no runtime dependencies. With Node.js installed, run the focused core tests from the project directory:

```sh
node --test test/sap1.test.mjs
```

The tests cover all three arithmetic cases, HLT behavior, unknown opcodes, and malformed memory layouts. Manual browser checks: load the sample with each row of the table; verify output LEDs update only after OUT; pause Run and confirm PC stops changing; reset during Run and confirm registers clear while RAM stays; edit a RAM byte and confirm its binary display changes; import malformed data and confirm an error is shown.

## Known limitations

- This is a simplified SAP-1 model, not a cycle-accurate electrical simulation. The micro-operation view models the educational transfers and control signals represented in this interface.
- There is no separate register-write protection or memory-mapped I/O. RAM is editable directly.
- Browser import/export uses local files and does not send data to a server.
- The Node test command requires Node.js; the application itself runs in a modern browser without Node.

## GitHub

To publish the folder, create an empty GitHub repository, initialize Git in this directory, add these project files, commit them, and add the repository as the `origin` remote before pushing the chosen branch. No remote or push is configured by this project.