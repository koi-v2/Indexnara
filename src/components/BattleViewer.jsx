import React, { useState, useEffect, useRef } from 'react';
import { titleClass } from '../engine/gameEngine';

export function simulateTurn(attacker, defender, turnNumber) {
  const isCrit = Math.random() < Math.min(0.35, 0.05 + (attacker.agi || 5) * 0.01);
  const isDodge = !isCrit && Math.random() < Math.min(0.25, Math.max(0.02, ((defender.agi || 5) - (attacker.agi || 5)) * 0.015));

  if (isDodge) {
    return {
      type: 'dodge',
      attackerName: attacker.name,
      defenderName: defender.name,
      damage: 0,
      text: `${defender.name} dengan lincah menghindar dari serangan ${attacker.name}!`,
      crit: false,
      dodge: true,
      mpUsed: 0
    };
  }

  // Check if attacker uses skill
  let skillUsed = null;
  let damage = 0;
  let mpCost = 0;
  const canUseSkill = (attacker.mp || 0) >= 12 && attacker.skills && attacker.skills.length > 0 && Math.random() < 0.45;

  if (canUseSkill) {
    const unlockedSkills = attacker.skills.filter(s => s.unlocked);
    if (unlockedSkills.length > 0) {
      skillUsed = unlockedSkills[Math.floor(Math.random() * unlockedSkills.length)];
      mpCost = 10;
    }
  }

  const baseAtk = (attacker.atk || 10) + (skillUsed ? (attacker.mag || 5) * 1.2 : 0);
  const defReduction = Math.max(0, (defender.def || 5) * 0.65);
  const variance = (Math.random() * 0.3 + 0.85); // 0.85 - 1.15
  let rawDamage = Math.max(2, Math.round((baseAtk * 1.5 - defReduction) * variance));

  if (skillUsed) {
    rawDamage = Math.round(rawDamage * 1.4);
  }

  if (isCrit) {
    rawDamage = Math.round(rawDamage * 1.75);
  }

  damage = rawDamage;

  let text = '';
  if (skillUsed) {
    text = `✨ ${attacker.name} mengaktifkan jurus [${skillUsed.name}] ke ${defender.name}! (${damage} DMG${isCrit ? ' - KRITIKAL!' : ''})`;
  } else if (isCrit) {
    text = `💥 SERANGAN KRITIKAL! ${attacker.name} menghujamkan serangan telak ke ${defender.name}! (${damage} DMG)`;
  } else {
    text = `⚔️ ${attacker.name} menyerang ${defender.name} menimbulkan ${damage} damage.`;
  }

  return {
    type: 'attack',
    attackerName: attacker.name,
    defenderName: defender.name,
    damage,
    text,
    crit: isCrit,
    dodge: false,
    skill: skillUsed ? skillUsed.name : null,
    mpUsed: mpCost
  };
}

export default function BattleViewer({ fighterA, fighterB, onFinish, autoStart = true }) {
  // Battle state
  const [hpA, setHpA] = useState(fighterA.hp || fighterA.maxHp || 100);
  const [hpB, setHpB] = useState(fighterB.hp || fighterB.maxHp || 100);
  const [mpA, setMpA] = useState(fighterA.mp || fighterA.maxMp || 30);
  const [mpB, setMpB] = useState(fighterB.mp || fighterB.maxMp || 30);

  const maxHpA = fighterA.maxHp || 100;
  const maxHpB = fighterB.maxHp || 100;
  const maxMpA = fighterA.maxMp || 30;
  const maxMpB = fighterB.maxMp || 30;

  const [combatLogs, setCombatLogs] = useState([
    { id: 0, text: `🏟️ Pertarungan dimulai antara ${fighterA.name} vs ${fighterB.name}!`, type: 'intro' }
  ]);
  const [activeTurn, setActiveTurn] = useState('A'); // 'A' or 'B'
  const [turnCount, setTurnCount] = useState(1);
  const [isPlaying, setIsPlaying] = useState(autoStart);
  const [speed, setSpeed] = useState(1); // 1x, 2x, 4x
  const [winner, setWinner] = useState(null);
  const [hitEffectA, setHitEffectA] = useState(null);
  const [hitEffectB, setHitEffectB] = useState(null);
  const [floatingTexts, setFloatingTexts] = useState([]);

  const logsEndRef = useRef(null);

  // Auto scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [combatLogs]);

  // Step one turn
  const stepCombat = () => {
    if (winner) return;

    if (activeTurn === 'A') {
      // A attacks B
      const result = simulateTurn(
        { ...fighterA, hp: hpA, mp: mpA },
        { ...fighterB, hp: hpB, mp: mpB },
        turnCount
      );

      if (result.mpUsed > 0) {
        setMpA(prev => Math.max(0, prev - result.mpUsed));
      }

      if (result.damage > 0) {
        const nextHpB = Math.max(0, hpB - result.damage);
        setHpB(nextHpB);
        setHitEffectB('hit');
        setTimeout(() => setHitEffectB(null), 350);

        // Add floating text
        const fId = Date.now() + Math.random();
        setFloatingTexts(prev => [
          ...prev,
          { id: fId, target: 'B', text: result.crit ? `🔥 -${result.damage}!` : `-${result.damage}`, crit: result.crit }
        ]);
        setTimeout(() => {
          setFloatingTexts(prev => prev.filter(f => f.id !== fId));
        }, 900);

        if (nextHpB <= 0) {
          setWinner(fighterA);
          setCombatLogs(prev => [
            ...prev,
            { id: Date.now(), text: result.text, type: result.crit ? 'crit' : 'normal' },
            { id: Date.now() + 1, text: `🏆 ${fighterA.name} memenangkan pertarungan dengan gemilang!`, type: 'victory' }
          ]);
          setIsPlaying(false);
          if (onFinish) onFinish({ winner: fighterA, loser: fighterB, turns: turnCount });
          return;
        }
      } else if (result.dodge) {
        setHitEffectB('dodge');
        setTimeout(() => setHitEffectB(null), 350);
        const fId = Date.now() + Math.random();
        setFloatingTexts(prev => [
          ...prev,
          { id: fId, target: 'B', text: '💨 DODGE!', crit: false }
        ]);
        setTimeout(() => {
          setFloatingTexts(prev => prev.filter(f => f.id !== fId));
        }, 900);
      }

      setCombatLogs(prev => [...prev, { id: Date.now(), text: result.text, type: result.crit ? 'crit' : (result.skill ? 'skill' : 'normal') }]);
      setActiveTurn('B');
      setTurnCount(t => t + 1);
    } else {
      // B attacks A
      const result = simulateTurn(
        { ...fighterB, hp: hpB, mp: mpB },
        { ...fighterA, hp: hpA, mp: mpA },
        turnCount
      );

      if (result.mpUsed > 0) {
        setMpB(prev => Math.max(0, prev - result.mpUsed));
      }

      if (result.damage > 0) {
        const nextHpA = Math.max(0, hpA - result.damage);
        setHpA(nextHpA);
        setHitEffectA('hit');
        setTimeout(() => setHitEffectA(null), 350);

        const fId = Date.now() + Math.random();
        setFloatingTexts(prev => [
          ...prev,
          { id: fId, target: 'A', text: result.crit ? `🔥 -${result.damage}!` : `-${result.damage}`, crit: result.crit }
        ]);
        setTimeout(() => {
          setFloatingTexts(prev => prev.filter(f => f.id !== fId));
        }, 900);

        if (nextHpA <= 0) {
          setWinner(fighterB);
          setCombatLogs(prev => [
            ...prev,
            { id: Date.now(), text: result.text, type: result.crit ? 'crit' : 'normal' },
            { id: Date.now() + 1, text: `🏆 ${fighterB.name} memenangkan pertarungan!`, type: 'victory' }
          ]);
          setIsPlaying(false);
          if (onFinish) onFinish({ winner: fighterB, loser: fighterA, turns: turnCount });
          return;
        }
      } else if (result.dodge) {
        setHitEffectA('dodge');
        setTimeout(() => setHitEffectA(null), 350);
        const fId = Date.now() + Math.random();
        setFloatingTexts(prev => [
          ...prev,
          { id: fId, target: 'A', text: '💨 DODGE!', crit: false }
        ]);
        setTimeout(() => {
          setFloatingTexts(prev => prev.filter(f => f.id !== fId));
        }, 900);
      }

      setCombatLogs(prev => [...prev, { id: Date.now(), text: result.text, type: result.crit ? 'crit' : (result.skill ? 'skill' : 'normal') }]);
      setActiveTurn('A');
      setTurnCount(t => t + 1);
    }
  };

  // Turn timer loop
  useEffect(() => {
    if (!isPlaying || winner) return;

    const delay = Math.max(200, 1100 / speed);
    const interval = setTimeout(() => {
      stepCombat();
    }, delay);

    return () => clearTimeout(interval);
  }, [isPlaying, winner, activeTurn, hpA, hpB, mpA, mpB, speed]);

  // Instant skip to end
  const handleInstantFinish = () => {
    let curHpA = hpA;
    let curHpB = hpB;
    let curMpA = mpA;
    let curMpB = mpB;
    let curTurn = activeTurn;
    let turns = turnCount;
    const newLogs = [...combatLogs];

    while (curHpA > 0 && curHpB > 0 && turns < 60) {
      if (curTurn === 'A') {
        const res = simulateTurn({ ...fighterA, hp: curHpA, mp: curMpA }, { ...fighterB, hp: curHpB, mp: curMpB }, turns);
        curMpA = Math.max(0, curMpA - (res.mpUsed || 0));
        curHpB = Math.max(0, curHpB - res.damage);
        newLogs.push({ id: Math.random(), text: res.text, type: res.crit ? 'crit' : 'normal' });
        if (curHpB <= 0) break;
        curTurn = 'B';
      } else {
        const res = simulateTurn({ ...fighterB, hp: curHpB, mp: curMpB }, { ...fighterA, hp: curHpA, mp: curMpA }, turns);
        curMpB = Math.max(0, curMpB - (res.mpUsed || 0));
        curHpA = Math.max(0, curHpA - res.damage);
        newLogs.push({ id: Math.random(), text: res.text, type: res.crit ? 'crit' : 'normal' });
        if (curHpA <= 0) break;
        curTurn = 'A';
      }
      turns++;
    }

    const won = curHpA > 0 ? fighterA : fighterB;
    const lost = curHpA > 0 ? fighterB : fighterA;
    newLogs.push({ id: Math.random(), text: `🏆 ${won.name} memenangkan duel!`, type: 'victory' });

    setHpA(curHpA);
    setHpB(curHpB);
    setMpA(curMpA);
    setMpB(curMpB);
    setWinner(won);
    setCombatLogs(newLogs);
    setIsPlaying(false);
    if (onFinish) onFinish({ winner: won, loser: lost, turns });
  };

  const hpPctA = Math.max(0, Math.min(100, (hpA / maxHpA) * 100));
  const hpPctB = Math.max(0, Math.min(100, (hpB / maxHpB) * 100));
  const mpPctA = Math.max(0, Math.min(100, (mpA / maxMpA) * 100));
  const mpPctB = Math.max(0, Math.min(100, (mpB / maxMpB) * 100));

  return (
    <div className="battle-arena-container">
      {/* ARENA STAGE */}
      <div className="battle-stage">
        {/* FIGHTER A (LEFT) */}
        <div className={`fighter-card ${hitEffectA ? `animate-${hitEffectA}` : ''} ${activeTurn === 'A' && !winner ? 'active-turn' : ''}`}>
          <div className="fighter-avatar-wrap">
            <div className="avatar battle-avatar">
              {fighterA.photo ? (
                <img src={fighterA.photo} alt={fighterA.name} />
              ) : (
                fighterA.name.slice(0, 1).toUpperCase()
              )}
            </div>
            {activeTurn === 'A' && !winner && <div className="turn-indicator">MENYERANG</div>}
            {floatingTexts.filter(f => f.target === 'A').map(f => (
              <span key={f.id} className={`floating-damage ${f.crit ? 'crit' : ''}`}>{f.text}</span>
            ))}
          </div>
          <div className="fighter-info">
            <div className="fighter-name">
              <b>{fighterA.name}</b>
              {fighterA.activeTitle && (
                <span className={`title-badge ${titleClass(fighterA.activeTitle)}`} style={{ fontSize: '10px', padding: '2px 6px' }}>
                  {fighterA.activeTitle}
                </span>
              )}
            </div>
            <div className="muted small">Lv. {fighterA.level} · {fighterA.role || 'Petualang'}</div>
            
            {/* HP Bar */}
            <div className="bar-wrapper">
              <div className="bar-labels">
                <span>HP</span>
                <b>{hpA} / {maxHpA}</b>
              </div>
              <div className="bar">
                <i style={{
                  width: `${hpPctA}%`,
                  background: hpPctA > 50 ? 'var(--green)' : hpPctA > 20 ? 'var(--gold)' : 'var(--red)'
                }} />
              </div>
            </div>

            {/* MP Bar */}
            <div className="bar-wrapper">
              <div className="bar-labels">
                <span>MP</span>
                <b>{mpA} / {maxMpA}</b>
              </div>
              <div className="bar mp">
                <i style={{ width: `${mpPctA}%` }} />
              </div>
            </div>

            <div className="fighter-stats-mini">
              <span>ATK: {fighterA.atk || 10}</span>
              <span>DEF: {fighterA.def || 5}</span>
              <span>AGI: {fighterA.agi || 5}</span>
            </div>
          </div>
        </div>

        {/* VS BADGE / CENTER DIVIDER */}
        <div className="battle-vs-badge">
          {winner ? (
            <div className="winner-crown">
              <div style={{ fontSize: '28px' }}>👑</div>
              <small>SELESAI</small>
            </div>
          ) : (
            <div className="vs-circle">
              <b>VS</b>
              <small>Ronde {turnCount}</small>
            </div>
          )}
        </div>

        {/* FIGHTER B (RIGHT) */}
        <div className={`fighter-card ${hitEffectB ? `animate-${hitEffectB}` : ''} ${activeTurn === 'B' && !winner ? 'active-turn' : ''}`}>
          <div className="fighter-avatar-wrap">
            <div className="avatar battle-avatar" style={{ background: fighterB.isMonster ? '#3b2429' : undefined }}>
              {fighterB.photo ? (
                <img src={fighterB.photo} alt={fighterB.name} />
              ) : fighterB.isMonster ? (
                '👾'
              ) : (
                fighterB.name.slice(0, 1).toUpperCase()
              )}
            </div>
            {activeTurn === 'B' && !winner && <div className="turn-indicator">MENYERANG</div>}
            {floatingTexts.filter(f => f.target === 'B').map(f => (
              <span key={f.id} className={`floating-damage ${f.crit ? 'crit' : ''}`}>{f.text}</span>
            ))}
          </div>
          <div className="fighter-info">
            <div className="fighter-name">
              <b>{fighterB.name}</b>
              {fighterB.activeTitle && (
                <span className={`title-badge ${titleClass(fighterB.activeTitle)}`} style={{ fontSize: '10px', padding: '2px 6px' }}>
                  {fighterB.activeTitle}
                </span>
              )}
            </div>
            <div className="muted small">Lv. {fighterB.level} · {fighterB.role || (fighterB.isMonster ? 'Monster' : 'Petualang')}</div>

            {/* HP Bar */}
            <div className="bar-wrapper">
              <div className="bar-labels">
                <span>HP</span>
                <b>{hpB} / {maxHpB}</b>
              </div>
              <div className="bar">
                <i style={{
                  width: `${hpPctB}%`,
                  background: hpPctB > 50 ? 'var(--green)' : hpPctB > 20 ? 'var(--gold)' : 'var(--red)'
                }} />
              </div>
            </div>

            {/* MP Bar */}
            <div className="bar-wrapper">
              <div className="bar-labels">
                <span>MP</span>
                <b>{mpB} / {maxMpB}</b>
              </div>
              <div className="bar mp">
                <i style={{ width: `${mpPctB}%` }} />
              </div>
            </div>

            <div className="fighter-stats-mini">
              <span>ATK: {fighterB.atk || 10}</span>
              <span>DEF: {fighterB.def || 5}</span>
              <span>AGI: {fighterB.agi || 5}</span>
            </div>
          </div>
        </div>
      </div>

      {/* CONTROLS BAR */}
      <div className="battle-controls-row">
        <div className="row">
          {!winner ? (
            <>
              <button
                className={isPlaying ? '' : 'primary'}
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? '⏸ Jeda' : '▶ Putar'}
              </button>
              <button onClick={stepCombat} disabled={isPlaying}>
                ⏭ 1 Langkah
              </button>
              <button onClick={handleInstantFinish}>
                ⚡ Langsung Selesai
              </button>
            </>
          ) : (
            <div className="pill" style={{ color: 'var(--gold)', fontWeight: 800, padding: '6px 12px' }}>
              🎉 Pemenang: {winner.name} (Tersisa {winner === fighterA ? hpA : hpB} HP)
            </div>
          )}
        </div>

        <div className="row">
          <span className="muted small">Kecepatan:</span>
          {[1, 2, 4].map(s => (
            <button
              key={s}
              className={speed === s ? 'primary' : ''}
              style={{ padding: '4px 10px', fontSize: '12px' }}
              onClick={() => setSpeed(s)}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* COMBAT LOG */}
      <div className="battle-log-box">
        <div className="battle-log-header">
          <span>📜 Catatan Jalannya Pertarungan</span>
          <small className="muted">{combatLogs.length} aksi tercatat</small>
        </div>
        <div className="battle-log-content">
          {combatLogs.map((log) => (
            <div
              key={log.id}
              className={`battle-log-entry ${log.type === 'crit' ? 'crit' : ''} ${log.type === 'victory' ? 'victory' : ''} ${log.type === 'skill' ? 'skill' : ''}`}
            >
              {log.text}
            </div>
          ))}
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );
}
