export const OPCODES = Object.freeze({
  LDA: 0x0,
  ADD: 0x1,
  SUB: 0x2,
  OUT: 0xe,
  HLT: 0xf,
});

export const SIGNAL_NAMES = Object.freeze([
  'PCout', 'MARin', 'RAMout', 'IRin', 'PCinc', 'Ain', 'Bin',
  'ALUadd', 'ALUsub', 'OUTin', 'HLT',
]);

export const MAX_INSTRUCTIONS = 64;

export function createMachine() {
  return {
    ram: Array(16).fill(0),
    registers: { pc: 0, mar: 0, ir: 0, a: 0, b: 0, out: 0 },
    status: 'ready',
    cycles: 0,
    currentInstruction: null,
    phases: [],
    signals: [],
    bus: null,
    microOperations: [],
    log: [],
    changed: [],
    error: '',
  };
}

export function validateMemory(values) {
  if (!Array.isArray(values) || values.length !== 16) {
    throw new Error('Memory must contain exactly 16 byte values.');
  }
  if (values.some((value) => !Number.isInteger(value) || value < 0 || value > 0xff)) {
    throw new Error('Every memory value must be an integer from 00H to FFH.');
  }
  return values.slice();
}

export function loadMemory(machine, values) {
  machine.ram = validateMemory(values);
  resetMachine(machine);
  return machine;
}

export function resetMachine(machine) {
  machine.registers = { pc: 0, mar: 0, ir: 0, a: 0, b: 0, out: 0 };
  machine.status = 'ready';
  machine.cycles = 0;
  machine.currentInstruction = null;
  machine.phases = [];
  machine.signals = [];
  machine.bus = null;
  machine.microOperations = [];
  machine.log = [];
  machine.changed = [];
  machine.error = '';
  return machine;
}

function markChanged(machine, register) {
  if (!machine.changed.includes(register)) machine.changed.push(register);
}

function transfer(machine, from, to, value, signals, description) {
  machine.bus = { from, to, value: value & 0xff, description };
  machine.signals = signals;
  machine.microOperations.push({ ...machine.bus, signals: signals.slice() });
}

export function stepInstruction(machine) {
  if (machine.status === 'halted') {
    machine.error = 'The processor is halted. Reset or load a program to continue.';
    return machine;
  }
  if (machine.status === 'error') return machine;
  if (machine.cycles >= MAX_INSTRUCTIONS) {
    machine.status = 'error';
    machine.error = `Execution stopped after ${MAX_INSTRUCTIONS} instructions to prevent an endless loop.`;
    machine.log.push(machine.error);
    return machine;
  }

  const { registers, ram } = machine;
  machine.changed = [];
  machine.microOperations = [];
  machine.phases = [];
  machine.error = '';

  const instructionAddress = registers.pc;
  registers.mar = registers.pc & 0x0f;
  markChanged(machine, 'mar');
  transfer(machine, 'PC', 'MAR', registers.mar, ['PCout', 'MARin'], 'Copy program counter to memory address register.');

  const instruction = ram[registers.mar];
  registers.ir = instruction;
  markChanged(machine, 'ir');
  transfer(machine, 'RAM', 'IR', instruction, ['RAMout', 'IRin'], `Read RAM[${hex(registers.mar, 1)}] into instruction register.`);
  machine.phases.push('fetch');

  registers.pc = (registers.pc + 1) & 0x0f;
  markChanged(machine, 'pc');
  machine.signals = ['PCinc'];
  machine.microOperations.push({ from: 'PC', to: 'PC', value: registers.pc, signals: ['PCinc'], description: 'Increment program counter modulo 16.' });

  const opcode = instruction >> 4;
  const operand = instruction & 0x0f;
  const name = Object.keys(OPCODES).find((key) => OPCODES[key] === opcode);
  machine.currentInstruction = { address: instructionAddress, opcode, operand, name: name ?? '???', byte: instruction };
  machine.phases.push('decode');
  if (!name) {
    machine.status = 'error';
    machine.error = `Unknown opcode ${hex(opcode, 1)}H at address ${hex(instructionAddress, 1)}H.`;
    machine.log.push(machine.error);
    return machine;
  }

  machine.cycles += 1;
  machine.phases.push('execute');
  const prefix = `${hex(instructionAddress, 1)}H  ${name}${['LDA', 'ADD', 'SUB'].includes(name) ? ` ${hex(operand, 1)}H` : ''}`;
  machine.log.push(`${prefix} | Fetch: PC -> MAR, RAM -> IR; PC incremented.`);

  if (name === 'LDA') {
    registers.mar = operand;
    markChanged(machine, 'mar');
    transfer(machine, 'IR operand', 'MAR', operand, ['MARin'], 'Select operand address from instruction register.');
    registers.a = ram[registers.mar];
    markChanged(machine, 'a');
    transfer(machine, 'RAM', 'A', registers.a, ['RAMout', 'Ain'], `Load RAM[${hex(registers.mar, 1)}] into accumulator.`);
    machine.log.push(`Execute: A <- RAM[${hex(registers.mar, 1)}] = ${hex(registers.a, 2)}H.`);
  } else if (name === 'ADD' || name === 'SUB') {
    registers.mar = operand;
    markChanged(machine, 'mar');
    transfer(machine, 'IR operand', 'MAR', operand, ['MARin'], 'Select operand address from instruction register.');
    registers.b = ram[registers.mar];
    markChanged(machine, 'b');
    transfer(machine, 'RAM', 'B', registers.b, ['RAMout', 'Bin'], `Load RAM[${hex(registers.mar, 1)}] into B-register.`);
    const result = name === 'ADD' ? registers.a + registers.b : registers.a - registers.b;
    registers.a = result & 0xff;
    markChanged(machine, 'a');
    const aluSignal = name === 'ADD' ? 'ALUadd' : 'ALUsub';
    transfer(machine, 'ALU', 'A', registers.a, [aluSignal, 'Ain'], `${name === 'ADD' ? 'Add B-register to accumulator' : 'Subtract B-register from accumulator'}; keep the low 8 bits.`);
    machine.log.push(`Execute: A ${name === 'ADD' ? '+' : '-'} B = ${hex(registers.a, 2)}H (8-bit result).`);
  } else if (name === 'OUT') {
    registers.out = registers.a & 0xff;
    markChanged(machine, 'out');
    transfer(machine, 'A', 'OUT', registers.out, ['OUTin'], 'Copy accumulator to output register.');
    machine.log.push(`Execute: OUT <- A = ${hex(registers.out, 2)}H.`);
  } else {
    machine.status = 'halted';
    machine.signals = ['HLT'];
    machine.microOperations.push({ from: 'Control', to: 'Control', value: instruction, signals: ['HLT'], description: 'Halt instruction execution.' });
    machine.log.push('Execute: HLT asserted; processor stopped.');
  }

  return machine;
}

export function assemble(source) {
  const lines = source.split(/\r?\n/).map((line) => line.replace(/#.*/, '').trim()).filter(Boolean);
  if (lines.length > 16) throw new Error('A program cannot contain more than 16 instructions.');
  if (lines.length === 0) throw new Error('Enter at least one instruction.');

  return lines.map((line, index) => {
    const parts = line.toUpperCase().split(/\s+/);
    const [mnemonic, operand, ...extra] = parts;
    if (extra.length || !Object.hasOwn(OPCODES, mnemonic)) {
      throw new Error(`Line ${index + 1}: invalid instruction "${line}".`);
    }
    if (['LDA', 'ADD', 'SUB'].includes(mnemonic)) {
      if (operand === undefined || !/^(?:[0-9A-F])H?$/.test(operand)) {
        throw new Error(`Line ${index + 1}: ${mnemonic} requires a hexadecimal address from 0H to FH.`);
      }
      return (OPCODES[mnemonic] << 4) | Number.parseInt(operand.replace(/H$/, ''), 16);
    }
    if (operand !== undefined) throw new Error(`Line ${index + 1}: ${mnemonic} does not take an operand.`);
    return (OPCODES[mnemonic] << 4) | 0x0f;
  });
}

export function parseByte(value) {
  const normalized = String(value).trim().toUpperCase().replace(/^0X/, '').replace(/H$/, '');
  if (!/^[0-9A-F]{1,2}$/.test(normalized)) throw new Error(`Invalid byte "${value}". Enter hexadecimal 00H to FFH.`);
  return Number.parseInt(normalized, 16);
}

export function hex(value, digits = 2) {
  return (value & (digits === 1 ? 0x0f : 0xff)).toString(16).toUpperCase().padStart(digits, '0');
}

export function binary(value, bits = 8) {
  return (value & (bits === 4 ? 0x0f : 0xff)).toString(2).padStart(bits, '0');
}