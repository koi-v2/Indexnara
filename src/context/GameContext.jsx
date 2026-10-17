import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  loadInitialState,
  saveStateToStorage,
  getDefaultState,
  addLog,
  addChronicle
} from '../engine/gameEngine';
import { runSimulationCycle } from '../engine/worldSystems';
import { NARA_SUPABASE_FUNCTION_URL, fixedPotions } from '../constants/gameData';

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [state, setState] = useState(() => loadInitialState());
  const [running, setRunning] = useState(false);
  const [currentPage, setCurrentPage] = useState('characters');
  const [selectedCharId, setSelectedCharId] = useState(null);
  const [modal, setModal] = useState({ isOpen: false, title: '', content: null });
  const timerRef = useRef(null);

  // Sync to localStorage whenever state changes
  useEffect(() => {
    saveStateToStorage(state);
  }, [state]);

  // Simulation timer
  useEffect(() => {
    if (running) {
      const intervalSec = Math.max(3, state.settings?.cycleSeconds || 8);
      timerRef.current = setInterval(() => {
        setState(prev => {
          try {
            return runSimulationCycle(prev);
          } catch (error) {
            // Keep a simulation bug from crashing the entire React UI.
            setRunning(false);
            const safeState = { ...prev, logs: Array.isArray(prev.logs) ? [...prev.logs] : [] };
            addLog(
              safeState,
              'Simulasi dihentikan karena error: ' + (error?.message || String(error)),
              'system'
            );
            return safeState;
          }
        });
      }, intervalSec * 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [running, state.settings?.cycleSeconds]);

  const toggleSim = () => {
    setRunning(prev => !prev);
  };

  const tickOnce = () => {
    setState(prev => {
      try {
        return runSimulationCycle(prev);
      } catch (error) {
        setRunning(false);
        const safeState = { ...prev, logs: Array.isArray(prev.logs) ? [...prev.logs] : [] };
        addLog(
          safeState,
          'Simulasi dihentikan karena error: ' + (error?.message || String(error)),
          'system'
        );
        return safeState;
      }
    });
  };

  const openModal = ({ title, content }) => {
    setModal({ isOpen: true, title, content });
  };

  const closeModal = () => {
    setModal({ isOpen: false, title: '', content: null });
  };

  const exportData = () => {
    const dataStr = JSON.stringify({ ...state, running: false }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `naraapp-world-backup-year-${state.worldCalendar?.year || 1}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (!parsed || !Array.isArray(parsed.characters)) {
          alert('Format backup tidak valid: data karakter tidak ditemukan.');
          return;
        }
        if (!window.confirm('Impor akan mengganti data dunia saat ini. Lanjutkan?')) return;
        setRunning(false);
        const merged = {
          ...getDefaultState(),
          ...parsed,
          running: false,
          shop: [...fixedPotions, ...(parsed.shop || []).filter(i => !['hp_potion', 'mp_potion'].includes(i.id))]
        };
        addLog(merged, 'Data dunia diimpor dari file cadangan.', 'admin');
        setState(merged);
        alert('Data berhasil diimpor!');
      } catch (err) {
        alert('Gagal membaca file backup: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const supabaseSync = async () => {
    const choice = window.prompt('Supabase Sync: ketik SAVE untuk mengirim dunia lokal ke cloud, atau LOAD untuk memuat dunia dari cloud. Batal untuk berhenti.');
    if (!choice) return;
    const action = choice.trim().toLowerCase();
    if (!['save', 'load'].includes(action)) {
      alert('Pilihan tidak valid. Ketik SAVE atau LOAD.');
      return;
    }
    let token = localStorage.getItem('nara_sync_token') || '';
    token = window.prompt('Masukkan nilai secret NARA_SYNC_TOKEN yang Tuan buat di Supabase:', token);
    if (token === null) return;
    token = token.trim();
    if (!token) {
      alert('Token tidak boleh kosong.');
      return;
    }
    localStorage.setItem('nara_sync_token', token);

    try {
      const payload = action === 'save'
        ? { action: 'save', world_data: { ...state, running: false }, world_year: Number(state.worldCalendar?.year) || 1 }
        : { action: 'load' };

      const res = await fetch(NARA_SUPABASE_FUNCTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-nara-token': token },
        body: JSON.stringify(payload)
      });
      const result = await res.json().catch(() => ({ error: 'Respons server bukan JSON' }));
      if (!res.ok) throw new Error(result.error || `HTTP ${res.status}`);

      if (action === 'save') {
        alert('Berhasil menyimpan dunia ke Supabase.\nTahun: ' + (result.saved?.world_year || state.worldCalendar?.year || 1));
      } else {
        if (!result.world || !result.world.world_data) {
          alert('Belum ada data dunia di Supabase.');
          return;
        }
        if (!window.confirm('Memuat data cloud akan mengganti data lokal saat ini. Lanjutkan?')) return;
        setRunning(false);
        const remote = result.world.world_data;
        const merged = {
          ...getDefaultState(),
          ...remote,
          running: false,
          shop: [...fixedPotions, ...(remote.shop || []).filter(i => !['hp_potion', 'mp_potion'].includes(i.id))]
        };
        setState(merged);
        alert('Data dunia berhasil dimuat dari Supabase!');
      }
    } catch (err) {
      alert('Sinkronisasi Supabase gagal: ' + (err.message || err));
    }
  };

  const resetData = () => {
    if (window.confirm('PERINGATAN: Seluruh karakter, guild, wilayah, dan progres akan direset ke pengaturan awal. Lanjutkan?')) {
      setRunning(false);
      const def = getDefaultState();
      setState(def);
      localStorage.removeItem('naraapp_world_v1');
      alert('Data dunia berhasil direset.');
    }
  };

  return (
    <GameContext.Provider value={{
      state,
      setState,
      running,
      toggleSim,
      tickOnce,
      currentPage,
      setCurrentPage,
      selectedCharId,
      setSelectedCharId,
      modal,
      openModal,
      closeModal,
      exportData,
      importData,
      supabaseSync,
      resetData
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
