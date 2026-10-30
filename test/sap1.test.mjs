import test from 'node:test';
import assert from 'node:assert/strict';
import { assemble, createMachine, loadMemory, stepInstruction } from '../sap1.mjs';

function runSample(values) {
  const machine = createMachine();
  const memory = Array(16).fill(0);
  memory.splice(0, 5, ...assemble('LDA 9H\nADD AH\nSUB BH\nOUT\nHLT'));
  memory[9] = values[0];
  memory[10] = values[1];
  memory[11] = values[2];
  loadMemory(machine, memory);
  for (let count = 0; count < 8 && machine.status !== 'halted' && machine.status !== 'error'; count += 1) stepInstruction(machine);
  assert.equal(machine.status, 'halted');
  return machine.registers.out;
}

test('sample calculations produce the required 8-bit output', () => {
  assert.equal(runSample([0x25, 0x05, 0x23]), 0x07);
  assert.equal(runSample([0x10, 0x20, 0x05]), 0x2b);
  assert.equal(runSample([0xff, 0x01, 0x01]), 0xff);
});

test('HLT stops execution and subsequent steps do not change registers', () => {
  const machine = createMachine();
  loadMemory(machine, [0xff, ...Array(15).fill(0)]);
  stepInstruction(machine);
  const snapshot = { ...machine.registers };
  assert.equal(machine.status, 'halted');
  stepInstruction(machine);
  assert.deepEqual(machine.registers, snapshot);
  assert.match(machine.error, /halted/i);
});

test('unknown opcodes stop with a clear error', () => {
  const machine = createMachine();
  loadMemory(machine, [0x30, ...Array(15).fill(0)]);
  stepInstruction(machine);
  assert.equal(machine.status, 'error');
  assert.match(machine.error, /unknown opcode/i);
});

test('memory validation rejects malformed layouts', () => {
  const machine = createMachine();
  assert.throws(() => loadMemory(machine, [0, 1]), /exactly 16/);
  assert.throws(() => loadMemory(machine, [256, ...Array(15).fill(0)]), /00H to FFH/);
});