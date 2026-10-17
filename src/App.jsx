import React from 'react';
import { GameProvider, useGame } from './context/GameContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Modal from './components/Modal';

import CharactersPage from './pages/CharactersPage';
import SkillTreePage from './pages/SkillTreePage';
import ArenaPage from './pages/ArenaPage';
import BattleViewerPage from './pages/BattleViewerPage';
import GuildsPage from './pages/GuildsPage';
import GuildRecruitmentPage from './pages/GuildRecruitmentPage';
import PartiesPage from './pages/PartiesPage';
import WorldMapPage from './pages/WorldMapPage';
import TerritoriesPage from './pages/TerritoriesPage';
import FactionsPage from './pages/FactionsPage';
import WorldBossPage from './pages/WorldBossPage';
import RivalsPage from './pages/RivalsPage';
import DungeonsPage from './pages/DungeonsPage';
import TowerPage from './pages/TowerPage';
import MaterialsPage from './pages/MaterialsPage';
import QuestsPage from './pages/QuestsPage';
import LifePage from './pages/LifePage';
import BrainPage from './pages/BrainPage';
import LegacyPage from './pages/LegacyPage';
import DynastyPage from './pages/DynastyPage';
import GuildWarsPage from './pages/GuildWarsPage';
import RenownPage from './pages/RenownPage';
import StoriesPage from './pages/StoriesPage';
import BusinessPage from './pages/BusinessPage';
import HallOfFamePage from './pages/HallOfFamePage';
import ItemHistoryPage from './pages/ItemHistoryPage';
import GraphsPage from './pages/GraphsPage';
import ArtifactsPage from './pages/ArtifactsPage';
import LawPage from './pages/LawPage';
import DeathsPage from './pages/DeathsPage';
import RelationshipsPage from './pages/RelationshipsPage';
import EquipmentPage from './pages/EquipmentPage';
import ChroniclePage from './pages/ChroniclePage';
import LogsPage from './pages/LogsPage';
import SettingsPage from './pages/SettingsPage';

function MainContent() {
  const { currentPage } = useGame();

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'characters': return <CharactersPage />;
      case 'battleViewer': return <BattleViewerPage />;
      case 'skills': return <SkillTreePage />;
      case 'arena': return <ArenaPage />;
      case 'guilds': return <GuildsPage />;
      case 'guildRecruitment': return <GuildRecruitmentPage />;
      case 'parties': return <PartiesPage />;
      case 'world': return <WorldMapPage />;
      case 'territories': return <TerritoriesPage />;
      case 'factions': return <FactionsPage />;
      case 'boss': return <WorldBossPage />;
      case 'rivals': return <RivalsPage />;
      case 'dungeons': return <DungeonsPage />;
      case 'tower': return <TowerPage />;
      case 'materials': return <MaterialsPage />;
      case 'quests': return <QuestsPage />;
      case 'life': return <LifePage />;
      case 'brain': return <BrainPage />;
      case 'legacy': return <LegacyPage />;
      case 'dynasty': return <DynastyPage />;
      case 'guildwars': return <GuildWarsPage />;
      case 'renown': return <RenownPage />;
      case 'stories': return <StoriesPage />;
      case 'business': return <BusinessPage />;
      case 'hall': return <HallOfFamePage />;
      case 'itemhistory': return <ItemHistoryPage />;
      case 'graphs': return <GraphsPage />;
      case 'artifacts': return <ArtifactsPage />;
      case 'law': return <LawPage />;
      case 'deaths': return <DeathsPage />;
      case 'relationships': return <RelationshipsPage />;
      case 'equipment': return <EquipmentPage />;
      case 'chronicle': return <ChroniclePage />;
      case 'logs': return <LogsPage />;
      case 'settings': return <SettingsPage />;
      default: return <CharactersPage />;
    }
  };

  return (
    <div className="app">
      <Header />
      <div className="layout">
        <Sidebar />
        <main className="content">
          {renderCurrentPage()}
        </main>
      </div>
      <div className="footer">
        NaraApp World Admin · Autonomous RPG Simulator
      </div>
      <Modal />
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <MainContent />
    </GameProvider>
  );
}
