import React from 'react';

function ChordPiano({ notes, accent = "var(--accent)" }) {
  if (!notes || !notes.length) return null;

  const pcs = new Set(notes.map(n => n.replace(/\d+$/, "")));

  const WHITES = ["C", "D", "E", "F", "G", "A", "B"];
  const BLACKS = [
    { name: "C#", afterIdx: 0 },
    { name: "D#", afterIdx: 1 },
    { name: "F#", afterIdx: 3 },
    { name: "G#", afterIdx: 4 },
    { name: "A#", afterIdx: 5 },
  ];

  const W = 13;
  const WH = 38;
  const BW = 8;
  const BH = 23;
  const totalW = W * 7;

  return (
    <svg className="chord-piano"
      width={totalW} height={WH}
      viewBox={`0 0 ${totalW} ${WH}`}
      style={{ display: "block" }}>
      {WHITES.map((n, i) => {
        const active = pcs.has(n);
        return (
          <rect key={n}
            x={i * W} y={0}
            width={W} height={WH}
            fill={active ? accent : "#ffffff"}
            stroke="#cdd2d8"
            strokeWidth="1"
            rx="1.5"
          />
        );
      })}
      {BLACKS.map(b => {
        const active = pcs.has(b.name);
        const x = (b.afterIdx + 1) * W - BW / 2;
        return (
          <rect key={b.name}
            x={x} y={0}
            width={BW} height={BH}
            fill={active ? accent : "#2d3436"}
            stroke={active ? accent : "#000"}
            strokeWidth="0.5"
            rx="1"
          />
        );
      })}
    </svg>
  );
}

export default ChordPiano;
