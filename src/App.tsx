/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ProjectProvider, useProject } from './context/ProjectContext';
import { Navbar } from './components/Navbar';
import { ProjectOverview } from './components/ProjectOverview';
import { ProjectsView } from './components/ProjectsView';
import { TaskBoard } from './components/TaskBoard';
import { ManpowerView } from './components/ManpowerView';
import { AccountsView } from './components/AccountsView';
import { GanttTimeline } from './components/GanttTimeline';
import { DailySiteLogView } from './components/DailySiteLogView';
import { MaterialsLedger } from './components/MaterialsLedger';
import { SnagList } from './components/SnagList';
import { GitHubDeployGuide } from './components/GitHubDeployGuide';
import { TaskDetailModal } from './components/TaskDetailModal';
import { NewTaskModal } from './components/NewTaskModal';
import { NewProjectModal } from './components/NewProjectModal';
import { NewDailyLogModal } from './components/NewDailyLogModal';
import { NewMaterialModal } from './components/NewMaterialModal';
import { NewSnagModal } from './components/NewSnagModal';
import { LoginModal } from './components/LoginModal';
import { UserManagementView } from './components/UserManagementView';
import { GeminiSiteAssistant } from './components/GeminiSiteAssistant';
import { TaxComplianceView } from './components/TaxComplianceView';
import { LandingLoginPortal } from './components/LandingLoginPortal';
import { ModulesPortalView } from './components/ModulesPortalView';
import { UserLogoutPage } from './components/UserLogoutPage';
import { ConstructionTask } from './types';
import { translations } from './utils/translations';
import { HardHat, Github, Sparkles, MapPin } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    language, 
    isLoginModalOpen, 
    setIsLoginModalOpen, 
    currentUser, 
    isAdmin,
    isLogoutPageActive,
    setIsLogoutPageActive
  } = useProject();
  const t = translations[language];

  // Modals state - Hooks MUST be called unconditionally at the top of the component
  const [selectedTask, setSelectedTask] = useState<ConstructionTask | null>(null);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [isNewDailyLogOpen, setIsNewDailyLogOpen] = useState(false);
  const [isNewMaterialOpen, setIsNewMaterialOpen] = useState(false);
  const [isNewSnagOpen, setIsNewSnagOpen] = useState(false);

  // Gemini AI Assistant state
  const [isSiteAssistantOpen, setIsSiteAssistantOpen] = useState(false);
  const [assistantPrompt, setAssistantPrompt] = useState<string | undefined>(undefined);

  const handleOpenAssistant = (prompt?: string) => {
    setAssistantPrompt(prompt);
    setIsSiteAssistantOpen(true);
  };

  // Dedicated User Logout Page (renders when user signs out)
  if (isLogoutPageActive) {
    return (
      <UserLogoutPage 
        onReturnToLogin={() => setIsLogoutPageActive(false)} 
      />
    );
  }

  // If user is not logged in, show the dedicated landing login portal
  if (!currentUser) {
    return (
      <LandingLoginPortal 
        onLoginSuccess={() => {
          setIsLogoutPageActive(false);
          setActiveTab('home');
        }} 
      />
    );
  }

  return (
    <div className={`min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans ${language === 'ur' ? 'font-urdu' : ''}`}>
      {/* Top Bar with Al Asad Constructors Royal Blue & Emerald branding */}
      <Navbar
        onOpenNewTask={() => setIsNewTaskOpen(true)}
        onOpenNewProject={() => setIsNewProjectOpen(true)}
        onOpenSiteAssistant={() => handleOpenAssistant()}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'home' && (
          <ModulesPortalView />
        )}

        {activeTab === 'overview' && (
          <ProjectOverview
            onOpenNewProject={() => setIsNewProjectOpen(true)}
            onOpenNewTask={() => setIsNewTaskOpen(true)}
            onOpenSiteAssistant={handleOpenAssistant}
          />
        )}

        {activeTab === 'projects' && (
          <ProjectsView
            onOpenNewProject={() => setIsNewProjectOpen(true)}
            onOpenNewTask={() => setIsNewTaskOpen(true)}
            onOpenSiteAssistant={handleOpenAssistant}
          />
        )}

        {activeTab === 'tasks' && (
          <TaskBoard
            onOpenNewTask={() => setIsNewTaskOpen(true)}
            onSelectTask={(task) => setSelectedTask(task)}
          />
        )}

        {activeTab === 'manpower' && (
          <ManpowerView />
        )}

        {activeTab === 'accounts' && (
          <AccountsView />
        )}

        {activeTab === 'gantt' && (
          <GanttTimeline
            onSelectTask={(task) => setSelectedTask(task)}
          />
        )}

        {activeTab === 'daily_logs' && (
          <DailySiteLogView
            onOpenNewLog={() => setIsNewDailyLogOpen(true)}
          />
        )}

        {activeTab === 'materials' && (
          <MaterialsLedger
            onOpenNewMaterial={() => setIsNewMaterialOpen(true)}
          />
        )}

        {activeTab === 'snags' && (
          <SnagList
            onOpenNewSnag={() => setIsNewSnagOpen(true)}
          />
        )}

        {(activeTab === 'tax_compliance' || activeTab === 'invoices_rfq') && (
          <TaxComplianceView />
        )}

        {activeTab === 'users' && (
          <UserManagementView />
        )}

        {activeTab === 'github_guide' && (
          <GitHubDeployGuide />
        )}
      </main>

      {/* Floating Action Button for Gemini Site Assistant */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => handleOpenAssistant()}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-semibold text-xs shadow-2xl shadow-blue-600/40 border border-blue-400/40 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          title="Open Al Asad AI Site Intelligence"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <Sparkles className="w-4 h-4 text-emerald-300 group-hover:rotate-12 transition-transform" />
          <span className="font-bold tracking-wide">
            {language === 'ur' ? 'سائٹ اے آئی' : 'Site AI'}
          </span>
          <span className="hidden sm:inline-flex px-1.5 py-0.5 text-[9px] font-mono bg-blue-950/80 text-blue-200 rounded uppercase">
            Maps
          </span>
        </button>
      </div>

      {/* Modals */}
      <GeminiSiteAssistant
        isOpen={isSiteAssistantOpen}
        onClose={() => setIsSiteAssistantOpen(false)}
        initialPrompt={assistantPrompt}
      />

      <TaskDetailModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
      />

      <NewTaskModal
        isOpen={isNewTaskOpen}
        onClose={() => setIsNewTaskOpen(false)}
      />

      <NewProjectModal
        isOpen={isNewProjectOpen}
        onClose={() => setIsNewProjectOpen(false)}
      />

      <NewDailyLogModal
        isOpen={isNewDailyLogOpen}
        onClose={() => setIsNewDailyLogOpen(false)}
      />

      <NewMaterialModal
        isOpen={isNewMaterialOpen}
        onClose={() => setIsNewMaterialOpen(false)}
      />

      <NewSnagModal
        isOpen={isNewSnagOpen}
        onClose={() => setIsNewSnagOpen(false)}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      {/* Clean Executive Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/90 py-6 text-xs text-slate-500 mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <img src="/logo.jpg" alt="Al Asad Constructors" className="w-6 h-6 rounded-md object-cover border border-blue-900/50 shadow-sm" />
            <span className="font-bold text-slate-200">
              {language === 'ur' ? 'الاسد کنسٹرکٹرز' : 'Al Asad Constructors'}
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-slate-400">
              {language === 'ur' ? 'تعمیراتی پروجیکٹ اور سائٹ مینجمنٹ سسٹم' : 'Civil Engineering & Job Site Operations'}
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span className="font-mono text-[11px] text-slate-400">copyright @ 2026, ShizCon</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="flex items-center gap-1.5 text-blue-400">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>{language === 'ur' ? 'کراچی، سندھ، پاکستان' : 'Karachi, Sindh, Pakistan'}</span>
            </span>
            <button
              onClick={() => handleOpenAssistant()}
              className="text-xs text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-blue-400" />
              <span>AI Site Assistant</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <ProjectProvider>
      <MainAppContent />
    </ProjectProvider>
  );
}
