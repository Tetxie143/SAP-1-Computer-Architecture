# SAP-1 Computer Architecture Lab

A dependency-free, browser-based SAP-1 (Simple-As-Possible 1) computer architecture simulator for exploring an 8-bit data path, memory, registers, bus transfers, and instruction execution. Open the interactive dashboard, load sample calculations or assemble custom machine programs, and step through micro-operations while observing the W-Bus, active control signals, 16-byte RAM, registers, and output LEDs update in real time.

---

## Table of Contents

- [Overview](#sap-1-computer-architecture-lab)
- [Technology Choice and Justification](#technology-choice-and-justification)
  - [Technology Comparison Matrix](#technology-comparison-matrix)
- [Installation and Setup Guide (Mac, Linux, Windows)](#installation-and-setup-guide-mac-linux-windows)
  - [1. Downloading and Cloning the Repository](#1-downloading-and-cloning-the-repository)
    - [Option A: Clone via Git (Recommended)](#option-a-clone-via-git-recommended)
    - [Option B: Download ZIP Archive](#option-b-download-zip-archive)
  - [2. Dependency Installation](#2-dependency-installation)
    - [Runtime Dependencies (Zero Dependencies)](#runtime-dependencies-zero-dependencies)
    - [Optional: Installing Node.js for Automated Testing](#optional-installing-nodejs-for-automated-testing)
  - [3. Running Locally in a Browser](#3-running-locally-in-a-browser)
    - [macOS Instructions](#macos-instructions)
    - [Linux Instructions (Ubuntu, Debian, Fedora, Arch)](#linux-instructions-ubuntu-debian-fedora-arch)
    - [Windows Instructions (PowerShell or Command Prompt)](#windows-instructions-powershell-or-command-prompt)
    - [Cross-Platform: Running via VS Code Live Server](#cross-platform-running-via-vs-code-live-server)
- [Learning Objectives](#learning-objectives)
- [Features](#features)
- [Architecture and Implementation Choices](#architecture-and-implementation-choices)
- [Instruction Set](#instruction-set)
- [Control Signals](#control-signals)
- [Project Files Structure](#project-files-structure)
- [Using the Simulator](#using-the-simulator)
- [Sample Calculations](#sample-calculations)
- [Automated and Manual Testing](#automated-and-manual-testing)
  - [Automated Unit Tests](#automated-unit-tests)
  - [Manual Browser Test Plan](#manual-browser-test-plan)
- [Known Limitations](#known-limitations)
- [GitHub Repository and Version Control](#github-repository-and-version-control)

---

## Technology Choice and Justification

Among the evaluated options (Vanilla HTML/CSS/JavaScript, React, Vue, and Svelte), this project is intentionally built using **Option 1: HTML5, CSS3, and Vanilla JavaScript (No Framework) with native ES Modules**. By choosing a pure web-standards approach over framework alternatives, the simulator eliminates all build-step complexity—such as Node bundlers (Vite/Webpack), transpilers (Babel/SWC), and heavy `node_modules` dependencies. Users on macOS, Linux, or Windows can clone the repository and run the simulator immediately in any modern browser without configuration or installation friction. Furthermore, relying on living W3C and WHATWG standards guarantees maximum long-term maintainability and zero risk of "dependency rot" or breaking framework version updates over time.

Architecturally, this choice directly mirrors the **"Simple-As-Possible" (SAP-1)** teaching philosophy introduced by Albert Paul Malvino. Rather than introducing virtual DOM reconciliation, asynchronous state batching, or reactive proxy abstractions, vanilla JavaScript executes discrete instruction cycles (Fetch, Decode, Execute) and bus transfers through clean, synchronous, and transparent operations. The core architecture engine (`sap1.mjs`) is cleanly decoupled from the UI, enabling headless execution and direct verification using Node.js's built-in test runner (`node --test`) without third-party test libraries.

### Technology Comparison Matrix

| Evaluation Criteria | Option 1: HTML/CSS/JS (Vanilla) **[Chosen]** | Option 2: React (JS/TS) | Option 3: Vue (JS/TS) | Option 4: Svelte (JS/TS) |
| :--- | :---: | :---: | :---: | :---: |
| **Build Step Required?** | **No (Zero build step)** | Yes (Vite / CRA / Babel) | Yes (Vite / Vue CLI) | Yes (Svelte Compiler) |
| **Runtime Dependencies** | **0 dependencies (0 KB)** | ~140 KB (react + react-dom) | ~100 KB (vue) | Small runtime |
| **Node.js Required to Run?** | **No (Runs directly in browser)** | Yes | Yes | Yes |
| **Direct Browser Runnable?** | **Yes (Instant execution)** | No (Requires build) | No (Requires build) | No (Requires build) |
| **Long-Term Maintainability** | **Maximum (Web Standards)** | Moderate (Subject to API churn) | Moderate (Subject to API churn) | Moderate (Syntax changes in v5) |
| **Hardware State Transparency**| **Direct and Synchronous** | Low (Virtual DOM / Async batch) | Moderate (Proxy-based reactivity) | Good (Compiled updates) |
| **Testability without Bundlers**| **Native (node --test)** | Complex (Needs Jest/Vitest + Babel) | Complex (Needs Vitest + plugins) | Complex (Needs Vitest + plugins) |
| **Pedagogical Simplicity** | **High (Matches SAP-1 Philosophy)**| Low (Heavy framework overhead) | Moderate (Framework abstractions) | Moderate (Tooling dependencies) |

---

## Installation and Setup Guide (Mac, Linux, Windows)

Follow the platform-specific instructions below to download, install dependencies, and run the SAP-1 simulator locally.

### 1. Downloading and Cloning the Repository

#### Option A: Clone via Git (Recommended)
Open your terminal (macOS/Linux) or PowerShell/Command Prompt (Windows) and clone the repository:

```bash
git clone https://github.com/Tetxie143/SAP-1-Computer-Architecture.git
cd SAP-1-Computer-Architecture
```

#### Option B: Download ZIP Archive
If you do not have Git installed:
1. Navigate to the GitHub repository: [https://github.com/Tetxie143/SAP-1-Computer-Architecture](https://github.com/Tetxie143/SAP-1-Computer-Architecture)
2. Click the green **Code** button and select **Download ZIP**.
3. Extract the downloaded `SAP-1-Computer-Architecture-main.zip` archive into a folder on your computer.
4. Open your terminal / command prompt and navigate to the extracted folder:
   - **macOS / Linux**: `cd ~/Downloads/SAP-1-Computer-Architecture-main`
   - **Windows**: `cd %USERPROFILE%\Downloads\SAP-1-Computer-Architecture-main`

---

### 2. Dependency Installation

#### Runtime Dependencies (Zero Dependencies)
- **No packages to install!** 
- This application uses pure HTML5, CSS3, and native ES Modules.
- There is no `package.json` to install, no `npm install` command required, and no `node_modules` directory created.

#### Optional: Installing Node.js for Automated Testing
The simulator dashboard runs entirely inside your web browser. However, if you wish to run the included automated unit test suite (`node --test test/sap1.test.mjs`), install **Node.js (version 18.0.0 or higher)**:

- **macOS**:
  - Using [Homebrew](https://brew.sh/):
    ```bash
    brew install node
    ```
  - Or download the official macOS installer (`.pkg`) from [nodejs.org](https://nodejs.org/).

- **Linux**:
  - **Ubuntu / Debian**:
    ```bash
    sudo apt update
    sudo apt install nodejs npm
    ```
  - **Fedora**:
    ```bash
    sudo dnf install nodejs
    ```
  - **Arch Linux**:
    ```bash
    sudo pacman -S nodejs
    ```

- **Windows**:
  - Using Windows Package Manager (Winget):
    ```powershell
    winget install OpenJS.NodeJS.LTS
    ```
  - Or download and run the official Windows MSI installer from [nodejs.org](https://nodejs.org/).

Verify the installation in your terminal:
```bash
node --version
```

---

### 3. Running Locally in a Browser

Because the application uses native JavaScript ES Modules (`<script type="module" src="script.js">`), modern web browsers enforce standard security policies (CORS) that restrict module loading via the raw `file://` protocol. 

Therefore, running a lightweight local HTTP server is recommended on all operating systems.

---

#### macOS Instructions

1. **Open Terminal** (`Applications` > `Utilities` > `Terminal` or press `Cmd + Space` and search for "Terminal").
2. Navigate to the project directory:
   ```bash
   cd /path/to/SAP-1-Computer-Architecture
   ```
3. Start a local HTTP server using any of the following standard tools:
   - **Using Python 3 (Pre-installed on macOS)**:
     ```bash
     python3 -m http.server 8000
     ```
   - **Using Node.js / npx (if Node is installed)**:
     ```bash
     npx serve .
     ```
   - **Using PHP (if installed)**:
     ```bash
     php -S localhost:8000
     ```
4. Open your web browser (Safari, Chrome, Firefox, or Edge) and navigate to:
   ```text
   http://localhost:8000
   ```

---

#### Linux Instructions (Ubuntu, Debian, Fedora, Arch)

1. **Open your Terminal emulator** (`Ctrl + Alt + T`).
2. Navigate to the project directory:
   ```bash
   cd /path/to/SAP-1-Computer-Architecture
   ```
3. Start a local HTTP server:
   - **Using Python 3**:
     ```bash
     python3 -m http.server 8000
     ```
   - **Using Node.js / npx**:
     ```bash
     npx serve .
     ```
4. Open your web browser (Firefox, Chromium, Chrome) and navigate to:
   ```text
   http://localhost:8000
   ```

---

#### Windows Instructions (PowerShell or Command Prompt)

1. **Open PowerShell or Command Prompt**:
   - Press `Win + R`, type `powershell`, and press Enter.
2. Navigate to the project directory:
   ```powershell
   cd C:\path\to\SAP-1-Computer-Architecture
   ```
3. Start a local HTTP server using either Python or Node.js:
   - **Using Python**:
     ```powershell
     python -m http.server 8000
     ```
   - **Using Node.js / npx**:
     ```powershell
     npx serve .
     ```
4. Open your web browser (Chrome, Edge, Firefox) and navigate to:
   ```text
   http://localhost:8000
   ```

---

#### Cross-Platform: Running via VS Code Live Server

If you use **Visual Studio Code** (available on macOS, Linux, and Windows):
1. Open Visual Studio Code.
2. Select **File > Open Folder...** and choose the `SAP-1-Computer-Architecture` directory.
3. If not already installed, install the **Live Server** extension by Ritwick Dey from the Extensions Marketplace (`Ctrl + Shift + X` or `Cmd + Shift + X`).
4. Right-click `index.html` in the file explorer and select **"Open with Live Server"**, or click the **"Go Live"** button in the bottom status bar.
5. Your default browser will automatically open `http://127.0.0.1:5500/index.html`.

---

## Learning Objectives

- **Trace Processor Cycle Stages**: Follow the exact fetch, decode, and execute stages of an instruction cycle.
- **Understand Component Interactions**: Observe how the Program Counter (PC), Memory Address Register (MAR), Instruction Register (IR), Accumulator (A), B-Register, RAM, Arithmetic Logic Unit (ALU), and Output Register interact across the 8-bit W-Bus.
- **Master Number Systems**: Read hexadecimal, binary, and decimal representations of byte values simultaneously across all registers and memory locations.
- **Observe Binary Arithmetic**: Observe 8-bit addition overflow and two's-complement subtraction underflow wrapping modulo 256.
- **Correlate Control Signals**: Relate individual hardware control signals (`PCout`, `MARin`, `RAMout`, `IRin`, `PCinc`, `Ain`, `Bin`, `ALUadd`, `ALUsub`, `OUTin`, `HLT`) and bus transfers to each instruction.

---

## Features

- **16 Addressable RAM Locations**: Full 16-byte memory space (`00H` through `0FH`), displaying values in both hexadecimal and 8-bit binary.
- **Instruction Assembly and Execution**: Full support for `LDA`, `ADD`, `SUB`, `OUT`, and `HLT` instructions.
- **Dual Execution Modes**: Single-step execution (`Step`) for granular tracing, and continuous execution (`Run` / `Pause`) with an adjustable speed slider (150 ms to 1500 ms delay).
- **Micro-Operation Tracing**: Expandable micro-operation log showing individual bus transfers and active hardware control signals for each instruction cycle.
- **Interactive Memory Editing**: Edit RAM cells inline, modify raw 16-byte memory strings, or load preset sample values.
- **Validated Import and Export**: Export memory configurations to JSON or import existing JSON/text memory snapshots with validation.
- **Active 8-bit Output LEDs**: Eight physical LED indicators representing output register bits (MSB bit 7 down to LSB bit 0) that update exclusively when an `OUT` instruction executes.
- **Architecture Dashboard**: Visual hardware data path highlighting the active source component, W-Bus rail animation, and destination register during every transfer.
- **Defensive Safeguards**: Built-in memory input validation and a 64-instruction execution guard to prevent infinite loops.

---

## Architecture and Implementation Choices

The simulated processor models the classic Malvino SAP-1 teaching architecture:
- **Memory**: 16 addressable bytes of RAM (`0H` to `FH`).
- **Registers**:
  - `PC` (Program Counter): 4 bits, addressing memory modulo 16.
  - `MAR` (Memory Address Register): 4 bits, latching RAM addresses.
  - `IR` (Instruction Register): 8 bits (upper 4 bits opcode, lower 4 bits operand).
  - `A` (Accumulator Register): 8 bits, primary arithmetic register.
  - `B` (B-Register): 8 bits, secondary arithmetic operand buffer.
  - `OUT` (Output Register): 8 bits, decoupled from accumulator; only updated via the `OUT` instruction.
- **ALU (Arithmetic Logic Unit)**: Performs 8-bit unsigned addition and subtraction. Results wrap modulo 256 (from `FFH` + 1 = `00H`, and `00H` - 1 = `FFH`).

### Instruction Cycle Execution Model
Each **Step** button press executes a complete instruction cycle:
1. **Fetch Stage**:
   - `PC -> MAR` (`PCout`, `MARin`): Program counter value is placed onto the W-Bus and latched into the Memory Address Register.
   - `RAM[MAR] -> IR` (`RAMout`, `IRin`): Memory at MAR is fetched and latched into the Instruction Register.
   - `PC = PC + 1` (`PCinc`): Program counter increments modulo 16.
2. **Decode Stage**:
   - The upper nibble (`IR[7:4]`) is decoded to determine the opcode.
   - The lower nibble (`IR[3:0]`) is extracted as the operand address (for memory-referencing instructions `LDA`, `ADD`, `SUB`).
3. **Execute Stage**:
   - `LDA`: MAR captures the operand address (`MARin`); RAM places data onto the bus; Accumulator latches data (`Ain`).
   - `ADD`: MAR captures the operand address; RAM places data into B-Register (`Bin`); ALU adds A and B, latching the 8-bit sum back into A (`ALUadd`, `Ain`).
   - `SUB`: MAR captures the operand address; RAM places data into B-Register (`Bin`); ALU subtracts B from A, latching the 8-bit difference back into A (`ALUsub`, `Ain`).
   - `OUT`: Accumulator places its byte onto the bus; Output Register latches the byte (`OUTin`), updating the physical LED indicators.
   - `HLT`: Halts further instruction sequencing (`HLT`).

---

## Instruction Set

| Mnemonic | Opcode (Upper Nibble) | Operand (Lower Nibble) | Machine Byte Format | Operation Description |
| :--- | :---: | :---: | :---: | :--- |
| **LDA** | `0000` (`0H`) | 4-bit Address (`0H`–`FH`) | `0<addr>H` | Load RAM at specified address into Accumulator: `A <- RAM[address]` |
| **ADD** | `0001` (`1H`) | 4-bit Address (`0H`–`FH`) | `1<addr>H` | Add RAM byte to Accumulator: `A <- (A + RAM[address]) mod 256` |
| **SUB** | `0010` (`2H`) | 4-bit Address (`0H`–`FH`) | `2<addr>H` | Subtract RAM byte from Accumulator: `A <- (A - RAM[address]) mod 256` |
| **OUT** | `1110` (`EH`) | Ignored (`FH`) | `EFH` | Transfer Accumulator to Output Register: `Output <- A` |
| **HLT** | `1111` (`FH`) | Ignored (`FH`) | `FFH` | Stop instruction sequencing and halt processor |

> **Note**: For `OUT` and `HLT`, the operand nibble is ignored by the hardware. The assembler emits the standard encodings `EFH` and `FFH` respectively. For example, `LDA 9H` assembles to `09H` (`0000 1001` in binary).

---

## Control Signals

All control signals are active-high and govern data transfers along the 8-bit W-Bus:

| Signal | Full Name | Description |
| :--- | :--- | :--- |
| **PCout** | Program Counter Out | Places the 4-bit PC address onto the W-Bus |
| **MARin** | Memory Address Register In | Captures the memory address from the W-Bus into MAR |
| **RAMout**| RAM Output Enable | Places the 8-bit byte at the addressed RAM cell onto the W-Bus |
| **IRin**  | Instruction Register In | Captures the 8-bit instruction byte from the W-Bus into IR |
| **PCinc** | Program Counter Increment | Increments the 4-bit Program Counter by 1 (modulo 16) |
| **Ain**   | Accumulator In | Latches the 8-bit value from the W-Bus into Accumulator A |
| **Bin**   | B-Register In | Latches the 8-bit value from the W-Bus into the B-Register |
| **ALUadd**| ALU Add Operation | Drives the 8-bit adder result (`A + B`) onto the W-Bus |
| **ALUsub**| ALU Subtract Operation | Drives the 8-bit subtractor result (`A - B`) onto the W-Bus |
| **OUTin** | Output Register In | Captures the byte from Accumulator A into the Output Register |
| **HLT**   | Halt Signal | Stops the clock generator and terminates program execution |

---

## Project Files Structure

```text
SAP-1-Computer-Architecture/
├── index.html          # Semantic HTML5 dashboard layout and component definitions
├── style.css           # Modular CSS styling, dark hardware theme, responsive layout, and LED animations
├── script.js           # Browser UI controller, event handlers, DOM bindings, and file import/export
├── sap1.mjs            # Core SAP-1 domain engine: machine state, ALU, assembler, validation, and stepping
├── test/
│   └── sap1.test.mjs   # Automated unit test suite using Node.js built-in test runner
├── .gitignore          # Git exclusion rules for OS and local files
└── README.md           # Project documentation, technology justification, and setup guides
```

---

## Using the Simulator

1. **Preset Calculation**:
   - Modify the sample input values for memory addresses `9H`, `AH`, and `BH` if desired.
   - Click **Load sample**. By default, this loads the program computing:
     $$\text{25H} + \text{05H} - \text{23H} = \text{07H} \quad (37 + 5 - 35 = 7)$$
2. **Stepping and Running**:
   - Click **Step** to execute a single whole instruction cycle (Fetch, Decode, Execute).
   - Click **Run** to execute automatically at the frequency specified by the **Run Speed** slider. Click **Pause** at any time.
3. **Resetting and Clearing**:
   - Click **Reset** to clear all internal registers, cycle counters, and bus activity while preserving RAM data.
   - Click **Clear RAM** to zero out all 16 memory addresses.
4. **Writing Custom Assembly**:
   - In the **Program** panel, type one instruction per line:
     ```text
     LDA 9H     # Load value at 9H into accumulator
     ADD AH     # Add value at AH
     SUB BH     # Subtract value at BH
     OUT        # Output accumulator to display
     HLT        # Stop processor
     ```
   - Click **Load program**. The assembler compiles instructions starting at address `0H` and preserves untouched memory cells.
5. **Direct RAM & Raw Editing**:
   - Click any individual RAM cell input box to edit a byte directly in hexadecimal (`00` to `FF`).
   - Click **Raw memory editor** to view or paste all 16 bytes separated by spaces.
6. **Import and Export**:
   - Click **Export memory** to download the current 16-byte state as a `.json` file.
   - Click **Import memory** to upload a previously saved JSON snapshot or raw hex text file.
7. **Micro-Operation Log**:
   - Click **Show micro-operations** in the Architecture panel to reveal every individual bus transfer and active control signal for each step.

---

## Sample Calculations

The table below illustrates sample calculations and their corresponding machine representations:

| Memory at 9H, AH, BH | Mathematical Calculation | Hex Output | Binary Output | Decimal Output |
| :---: | :---: | :---: | :---: | :---: |
| `25H`, `05H`, `23H` | $25\text{H} + 05\text{H} - 23\text{H} = 07\text{H}$ | `07H` | `00000111` | 7 |
| `10H`, `20H`, `05H` | $10\text{H} + 20\text{H} - 05\text{H} = 2B\text{H}$ | `2BH` | `00101011` | 43 |
| `FFH`, `01H`, `01H` | $\text{FFH} + 01\text{H} - 01\text{H} \pmod{256} = \text{FFH}$ | `FFH` | `11111111` | 255 |

---

## Automated and Manual Testing

### Automated Unit Tests

The core architecture engine (`sap1.mjs`) has zero external dependencies and is thoroughly validated via the Node.js native test runner.

Run the test suite from the project root:

```bash
node --test test/sap1.test.mjs
```

**Test Coverage Highlights**:
- **Arithmetic Accuracy**: Validates all three standard sample calculations, including two's complement subtraction and 8-bit overflow modulo 256.
- **HLT Instruction Enforcement**: Verifies that once `HLT` is asserted, machine status changes to `halted` and subsequent steps do not alter register states.
- **Opcode Error Trapping**: Confirms that invalid machine opcodes trigger an error status and halt execution cleanly.
- **Memory Integrity**: Asserts that malformed memory layouts (arrays not containing exactly 16 bytes, negative numbers, or values exceeding `0xFF`) are rejected with descriptive error messages.

### Manual Browser Test Plan

To verify browser-specific UI behavior:
1. **Sample Load Check**: Load the default sample and verify that address cells `9H`, `AH`, and `BH` populate with `25H`, `05H`, and `23H`.
2. **LED Output Verification**: Step through the program and verify that the 8 output LEDs remain off until the `OUT` instruction executes, at which point LEDs `0`, `1`, and `2` illuminate (`07H` = `00000111`).
3. **Run / Pause Dynamics**: Start execution using **Run** and verify that clicking **Pause** halts execution mid-stream without corrupting register state.
4. **Reset State Persistence**: Click **Reset** during or after execution; verify that all registers return to `0` while RAM values are preserved intact.
5. **Interactive Memory Editing**: Directly change address `9H` to `30H` and confirm that its binary display updates in real time.
6. **Import/Export Validation**: Export the current memory, modify a value, import the saved file, and verify the memory state restores accurately.

---

## Known Limitations

- **Educational Model**: This simulator is an educational representation of the SAP-1 architecture based on Malvino's model. It executes instructions with step-level and micro-operation abstractions rather than nanosecond-accurate analog transistor propagation delays.
- **Memory Addressing**: In keeping with the classic SAP-1 specification, the architecture features 16 bytes of total memory addressed by a 4-bit Program Counter and MAR.
- **Client-Side Sandbox**: Memory import and export actions are handled strictly in-memory using browser File and Blob APIs; no user data is ever transmitted across a network.
- **Test Runner Prerequisite**: The simulator runs in any modern browser without any software installed; executing the automated test suite requires Node.js v18+.

---

## GitHub Repository and Version Control

- **Repository URL**: [https://github.com/Tetxie143/SAP-1-Computer-Architecture](https://github.com/Tetxie143/SAP-1-Computer-Architecture)
- **Branch**: `main`

To push updates or publish a fork to GitHub:

```bash
# Check repository status
git status

# Stage updated documentation and files
git add README.md

# Commit changes
git commit -m "Update README with detailed TOC, technology justification, and multi-OS instructions"

# Push to the origin remote
git push origin main
```
