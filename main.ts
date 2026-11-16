// "Zein's Number Duel" — a minimal, replayable guessing game (Node 22, stdlib only).
// Entrypoint: main.ts  Run with:  node main.ts

import * as readline from 'node:readline';
import { createInterface } from 'node:readline';

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

const DIFFICULTIES = new Map([
  ['easy', { min: 1, max: 50, lives: 8 }],
  ['medium', { min: 1, max: 100, lives: 6 }],
  ['hard', { min: 1, max: 200, lives: 4 }],
]);

function ask(prompt: string): Promise<string> {
  return new Promise((resolve) => rl.question(prompt, resolve));
}

function pick(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function playRound(diff: string, best: number | null): Promise<number | null> {
  const d = DIFFICULTIES.get(diff)!;
  const secret = pick(d.min, d.max);
  let lives = d.lives;
  let guesses = 0;

  console.log(`\n┌─ ZEIN'S NUMBER DUEL ── ${diff.toUpperCase()} ──────────┐`);
  console.log(`│ Saya pikir angka antara ${d.min} dan ${d.max}.`);
  console.log(`│ Kamu punya ${lives} nyawa. Tebak!`);
  console.log(`└───────────────────────────────────────────────┘`);

  while (lives > 0) {
    const raw = await ask(`\nTebakanmu (${d.min}–${d.max}), nyawa ${lives}: `);
    const g = Number(raw.trim());
    if (!Number.isFinite(g) || g < d.min || g > d.max) {
      console.log('Masukkan angka yang valid.');
      continue;
    }
    guesses++;
    if (g === secret) {
      console.log(`\n🎉 BENAR! Angkanya ${secret}. Kamu butuh ${guesses} tebakan.`);
      if (best === null || guesses < best) {
        console.log('🏆 SKOR TERBAIK BARU!');
        return guesses;
      }
      console.log(`Skor terbaikmu: ${best}.`);
      return best;
    }
    lives--;
    console.log(g < secret ? 'Terlalu rendah.' : 'Terlalu tinggi.');
    if (lives > 0) console.log(`Nyawa tersisa: ${lives}`);
  }

  console.log(`\n💀 Nyawa habis. Angkanya ${secret}.`);
  return best;
}

async function main(): Promise<void> {
  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║   ZEIN\u2019S NUMBER DUEL — Tebak Angka   ║');
  console.log('╚══════════════════════════════════════════╝\n');

  let best: number | null = null;
  let playing = true;

  while (playing) {
    console.log('\nPilih tingkat kesulitan:');
    console.log('  1. Easy   (1–50,  8 nyawa)');
    console.log('  2. Medium (1–100, 6 nyawa)');
    console.log('  3. Hard   (1–200, 4 nyawa)');
    console.log('  4. Keluar');

    const choice = (await ask('\nPilihan [1-4]: ')).trim();
    if (choice === '4' || choice.toLowerCase() === 'keluar') {
      playing = false;
      break;
    }

    const diff = choice === '1' ? 'easy' : choice === '2' ? 'medium' : choice === '3' ? 'hard' : null;
    if (!diff) {
      console.log('Pilihan tidak valid.');
      continue;
    }

    best = await playRound(diff, best);
    const again = (await ask('\nMain lagi? [y/n]: ')).trim().toLowerCase();
    if (again !== 'y' && again !== 'ya') playing = false;
  }

  console.log(`\nSkor terbaikmu: ${best ?? '—'}. Terima kasih sudah bermain!`);
  rl.close();
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
