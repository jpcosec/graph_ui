// El mismo statechart en XState v5, ejecutado con los escenarios de disparar-eventos.py.
// Uso: en un directorio con `npm install xstate@5.33.0`, `node reserva.xstate.mjs`.
import { createMachine, createActor } from 'xstate';

const acciones = [];

const reserva = (guest, party_size) => createMachine({
  id: 'reserva',
  context: { guest, party_size },
  initial: 'active',
  states: {
    active: {
      initial: 'pending',
      on: { cancel: '#reserva.cancelled' },
      states: {
        pending: {
          on: { confirm: { target: 'confirmed', guard: ({ context }) => context.party_size <= 8 } },
        },
        confirmed: {
          entry: ({ context }) => acciones.push(`avisar al cliente (${context.guest})`),
          on: { seat: '#reserva.seated' },
        },
      },
    },
    seated: { type: 'final' },
    cancelled: { type: 'final' },
  },
});

const escenarios = [
  { guest: 'Ana', party_size: 6, eventos: ['confirm', 'confirm', 'seat', 'cancel'] },
  { guest: 'Bruno', party_size: 10, eventos: ['confirm', 'cancel'] },
];

for (const { guest, party_size, eventos } of escenarios) {
  const actor = createActor(reserva(guest, party_size)).start();
  for (const evento of eventos) {
    const antes = JSON.stringify(actor.getSnapshot().value);
    actor.send({ type: evento });
    const despues = JSON.stringify(actor.getSnapshot().value);
    console.log(`${guest} ${evento}: ${antes} -> ${despues}${antes === despues ? ' (ignorado)' : ''}`);
  }
}
console.log(`acciones: ${acciones.join('; ')}`);
