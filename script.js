import { assemble, binary, createMachine, hex, loadMemory, parseByte, resetMachine, SIGNAL_NAMES, stepInstruction } from './sap1.mjs';

const $ = (selector) => document.querySelector(selector);
const machine = createMachine();
let runTimer = null;
let running = false;
let microVisible = false;

const signalDescriptions = {
  PCout: 'PC places its address on the bus', MARin: 'MAR captures the bus address', RAMout: 'RAM places selected byte on the bus',
  IRin: 'IR captures the instruction byte', PCinc: 'Increment PC modulo 16', Ain: 'Accumulator captures a byte',
  Bin: 'B-register captures a byte', ALUadd: 'ALU performs 8-bit addition', ALUsub: 'ALU performs 8-bit subtraction',
  OUTin: 'Output register captures accumulator', HLT: 'Stop instruction sequencing',
};

function showNotice(message, type = '') {
  const notice = $('#notice');
  notice.textContent = message;
  notice.className = `notice ${type}`.trim();
}

function setStatus() {
  const pill = $('#status-pill');
  const label = running ? 'Running' : machine.status[0].toUpperCase() + machine.status.slice(1);
  $('#status-text').textContent = label;
  pill.dataset.status = running ? 'running' : machine.status;
}

function renderRegisters() {
  const widths = { pc: 1, mar: 1, ir: 2, a: 2, b: 2, out: 2 };
  for (const [name, value] of Object.entries(machine.registers)) {
    $(`#reg-${name}-hex`).textContent = `${hex(value, widths[name])}H`;
    $(`#reg-${name}-bin`).textContent = binary(value, name === 'pc' || name === 'mar' ? 4 : 8);
    $(`#reg-${name}-dec`).textContent = String(value);
    $(`[data-register="${name}"]`).classList.toggle('changed', machine.changed.includes(name));
  }
  $('#output-value').innerHTML = `${hex(machine.registers.out)}H <small>/ ${machine.registers.out}</small>`;
  const bits = binary(machine.registers.out).split('');
  $('#led-row').innerHTML = bits.map((bit, index) => `<div class="led ${bit === '1' ? 'on' : ''}" aria-label="Bit ${7 - index}: ${bit}"><span class="led-dot"></span><span class="led-label">${7 - index}</span></div>`).join('');
}

function renderRam() {
  const currentAddress = machine.currentInstruction?.address;
  $('#ram-grid').innerHTML = machine.ram.map((value, address) => {
    const classes = ['ram-cell'];
    if (machine.registers.pc === address) classes.push('pc');
    if (machine.registers.mar === address && machine.currentInstruction) classes.push('mar');
    if (currentAddress === address) classes.push('executing');
    const flags = [machine.registers.pc === address ? 'PC' : '', machine.registers.mar === address && machine.currentInstruction ? 'MAR' : '', currentAddress === address ? 'IR' : ''].filter(Boolean).join(' · ');
    return `<div class="${classes.join(' ')}"><label for="ram-${address}"><span>${hex(address, 1)}H</span><span class="ram-flags">${flags}</span></label><input id="ram-${address}" data-address="${address}" value="${hex(value)}" maxlength="3" inputmode="text" aria-label="RAM address ${hex(address, 1)}H value"><code>${binary(value)}</code></div>`;
  }).join('');
  $('#raw-memory').value = machine.ram.map((value) => hex(value)).join(' ');
}

function renderBus() {
  const bus = machine.bus;
  const track = $('#bus-track');
  track.classList.toggle('active', Boolean(bus));
  $('#bus-value').textContent = bus ? `${hex(bus.value)}H` : '--';
  $('#bus-message').textContent = bus ? bus.description : 'No transfer in progress';
  $('#transfer-arrow').textContent = bus ? `${bus.from} → ${bus.to}` : 'W-BUS';
  $('#transfer-text').textContent = bus ? bus.description : 'Waiting for a fetch cycle';
  document.querySelectorAll('[data-component]').forEach((element) => element.classList.remove('active'));
  if (bus) {
    const aliases = { 'IR operand': 'IR', 'Control': 'ALU' };
    [bus.from, bus.to].forEach((part) => {
      const component = aliases[part] ?? part;
      document.querySelector(`[data-component="${component}"]`)?.classList.add('active');
    });
  }
}

function renderSignals() {
  $('#signal-list').innerHTML = SIGNAL_NAMES.map((signal) => `<div class="signal ${machine.signals.includes(signal) ? 'active' : ''}"><span>${signal}</span><span>${machine.signals.includes(signal) ? 'ON' : 'OFF'}</span></div>`).join('');
}

function renderMicroOperations() {
  const list = $('#micro-list');
  list.hidden = !microVisible;
  $('#micro-toggle').setAttribute('aria-expanded', String(microVisible));
  $('#micro-toggle').innerHTML = `${microVisible ? 'Hide' : 'Show'} micro-operations <span>${microVisible ? '−' : '+'}</span>`;
  list.innerHTML = machine.microOperations.map((operation, index) => `<li><code>T${index + 1} ${operation.from} → ${operation.to}</code><span>${operation.description}</span><span>${operation.signals.join(' · ') || '—'}</span></li>`).join('');
}

function renderLog() {
  const log = $('#log-list');
  log.innerHTML = machine.log.length ? machine.log.slice().reverse().map((entry) => `<li>${escapeHtml(entry)}</li>`).join('') : '<li class="empty-log">The instruction trace will appear here.</li>';
  const instruction = machine.currentInstruction;
  $('#current-instruction').textContent = instruction ? `${hex(instruction.address, 1)}H · ${instruction.name}${['LDA', 'ADD', 'SUB'].includes(instruction.name) ? ` ${hex(instruction.operand, 1)}H` : ''}` : '—';
  $('#current-operand').textContent = instruction ? `OPCODE ${binary(instruction.opcode, 4)} · OPERAND ${binary(instruction.operand, 4)}` : 'FETCH / DECODE / EXECUTE';
  $('#phase-label').textContent = instruction ? `${machine.status === 'halted' ? 'HALTED' : machine.status === 'error' ? 'EXECUTION ERROR' : 'CYCLE ' + machine.cycles} / ${instruction.name}` : 'AWAITING INSTRUCTION';
  document.querySelectorAll('[data-phase]').forEach((element) => element.classList.toggle('complete', machine.phases.includes(element.dataset.phase)));
}

function render() {
  setStatus();
  renderRegisters();
  renderRam();
  renderBus();
  renderSignals();
  renderMicroOperations();
  renderLog();
  $('#step-button').disabled = running || machine.status === 'halted' || machine.status === 'error';
  $('#run-button').disabled = running || machine.status === 'halted' || machine.status === 'error';
  $('#pause-button').disabled = !running;
}

function escapeHtml(text) {
  return text.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

function stopRun() {
  if (runTimer !== null) clearTimeout(runTimer);
  runTimer = null;
  running = false;
}

function executeOne() {
  stepInstruction(machine);
  render();
  if (machine.status === 'error') {
    stopRun();
    render();
    showNotice(machine.error, 'error');
  } else if (machine.status === 'halted') {
    stopRun();
    render();
    showNotice(`HLT executed after ${machine.cycles} instruction cycles.`, 'success');
  }
}

function runNext() {
  if (!running) return;
  executeOne();
  if (running) runTimer = setTimeout(runNext, Number($('#speed-slider').value));
}

function resetExecution(message = 'Execution reset. RAM contents are preserved.') {
  stopRun();
  resetMachine(machine);
  render();
  showNotice(message, 'success');
}

function updateMachineCode() {
  try {
    const bytes = assemble($('#instruction-editor').value);
    $('#machine-code').innerHTML = `<span>MACHINE CODE</span><code>${bytes.map((value, index) => `${hex(index, 1)}H:${hex(value)}H/${binary(value)}`).join(' · ')}</code>`;
    return bytes;
  } catch (error) {
    $('#machine-code').innerHTML = '<span>MACHINE CODE</span><code>Waiting for valid instructions</code>';
    return null;
  }
}

function loadAssembledProgram() {
  stopRun();
  try {
    const bytes = assemble($('#instruction-editor').value);
    const memory = machine.ram.slice();
    bytes.forEach((value, address) => { memory[address] = value; });
    loadMemory(machine, memory);
    render();
    showNotice(`Loaded ${bytes.length} instruction${bytes.length === 1 ? '' : 's'} at address 0H. Execution state reset; remaining RAM preserved.`, 'success');
  } catch (error) {
    render();
    showNotice(error.message, 'error');
  }
}

function loadSample() {
  stopRun();
  try {
    const values = [parseByte($('#sample-a').value), parseByte($('#sample-b').value), parseByte($('#sample-c').value)];
    const memory = Array(16).fill(0);
    const program = assemble('LDA 9H\nADD AH\nSUB BH\nOUT\nHLT');
    program.forEach((value, address) => { memory[address] = value; });
    [9, 10, 11].forEach((address, index) => { memory[address] = values[index]; });
    $('#instruction-editor').value = 'LDA 9H\nADD AH\nSUB BH\nOUT\nHLT';
    loadMemory(machine, memory);
    updateMachineCode();
    render();
    showNotice(`Sample loaded: ${hex(values[0])}H + ${hex(values[1])}H − ${hex(values[2])}H.`, 'success');
  } catch (error) {
    showNotice(error.message, 'error');
  }
}

function applyRawMemory() {
  stopRun();
  const rawInput = $('#raw-memory').value;
  try {
    const parts = $('#raw-memory').value.trim().split(/[\s,;]+/).filter(Boolean);
    if (parts.length !== 16) throw new Error(`Enter exactly 16 bytes; received ${parts.length}.`);
    loadMemory(machine, parts.map(parseByte));
    render();
    showNotice('Raw memory loaded. Registers and execution state reset.', 'success');
  } catch (error) {
    render();
    $('#raw-memory').value = rawInput;
    showNotice(error.message, 'error');
  }
}

function clearRam() {
  if (!window.confirm('Clear all 16 RAM locations? This cannot be undone.')) return;
  stopRun();
  loadMemory(machine, Array(16).fill(0));
  render();
  showNotice('RAM cleared and execution state reset.', 'success');
}

function exportMemory() {
  const payload = JSON.stringify({ format: 'sap1-memory-v1', memory: machine.ram.map((value) => hex(value)) }, null, 2);
  const url = URL.createObjectURL(new Blob([payload], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'sap1-memory.json';
  link.click();
  URL.revokeObjectURL(url);
  showNotice('Memory exported as sap1-memory.json.', 'success');
}

async function importMemory(file) {
  stopRun();
  try {
    const content = await file.text();
    let values;
    if (file.name.toLowerCase().endsWith('.json')) {
      const parsed = JSON.parse(content);
      values = Array.isArray(parsed) ? parsed : parsed.memory;
      if (!Array.isArray(values)) throw new Error('JSON must be a byte array or an object with a memory array.');
      values = values.map((value) => typeof value === 'number' ? value : parseByte(value));
    } else {
      values = content.trim().split(/[\s,;]+/).filter(Boolean).map(parseByte);
    }
    loadMemory(machine, values);
    render();
    showNotice(`Imported and validated ${values.length} memory bytes.`, 'success');
  } catch (error) {
    render();
    showNotice(`Import failed: ${error.message}`, 'error');
  }
}

function handleRamEdit(event) {
  const input = event.target.closest('[data-address]');
  if (!input) return;
  if (running) stopRun();
  const address = Number(input.dataset.address);
  try {
    machine.ram[address] = parseByte(input.value);
    if (machine.status === 'halted' || machine.status === 'error') machine.status = 'ready';
    machine.error = '';
    render();
    showNotice(`RAM[${hex(address, 1)}H] updated to ${hex(machine.ram[address])}H.`, 'success');
  } catch (error) {
    render();
    showNotice(error.message, 'error');
  }
}

function initSignals() {
  $('#signal-list').innerHTML = SIGNAL_NAMES.map((signal) => `<div class="signal"><span title="${signalDescriptions[signal]}">${signal}</span><span>OFF</span></div>`).join('');
  $('#led-row').innerHTML = Array.from({ length: 8 }, (_, index) => `<div class="led" aria-label="Bit ${7 - index}: 0"><span class="led-dot"></span><span class="led-label">${7 - index}</span></div>`).join('');
}

$('#step-button').addEventListener('click', () => {
  if (running) return;
  executeOne();
});
$('#run-button').addEventListener('click', () => {
  if (running || machine.status === 'halted' || machine.status === 'error') return;
  running = true;
  render();
  showNotice('Automatic execution running.', '');
  runNext();
});
$('#pause-button').addEventListener('click', () => {
  if (!running) return;
  stopRun();
  render();
  showNotice('Execution paused. Step or Run to continue.', '');
});
$('#reset-button').addEventListener('click', () => resetExecution());
$('#load-button').addEventListener('click', loadAssembledProgram);
$('#sample-button').addEventListener('click', loadSample);
$('#apply-raw-button').addEventListener('click', applyRawMemory);
$('#micro-toggle').addEventListener('click', () => { microVisible = !microVisible; renderMicroOperations(); });
$('#instruction-editor').addEventListener('input', updateMachineCode);
$('#ram-grid').addEventListener('change', handleRamEdit);
$('#speed-slider').addEventListener('input', (event) => { $('#speed-value').textContent = `${event.target.value} ms`; });
$('#export-button').addEventListener('click', exportMemory);
$('#import-button').addEventListener('click', () => $('#import-file').click());
$('#import-file').addEventListener('change', (event) => {
  if (event.target.files?.[0]) importMemory(event.target.files[0]);
  event.target.value = '';
});
$('#clear-log-button').addEventListener('click', () => { machine.log = []; renderLog(); });
$('#clear-ram-button').addEventListener('click', clearRam);

initSignals();
updateMachineCode();
render();