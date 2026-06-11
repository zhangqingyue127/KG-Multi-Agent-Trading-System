import './App.css';
import React, { useState } from 'react';
import AgentPage from './pages/AgentPage';
import KnowledgeGraphPage from './pages/KnowledgeGraphPage';

function App() {
  const [currentPage, setCurrentPage] = useState('knowledge-graph');
  const [kgSection, setKgSection] = useState('overview');
  const [agentStep, setAgentStep] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const kgSections = [
    { id: 'overview', label: '图谱总览', icon: 'KG' },
    { id: 'explorer', label: '交互探索', icon: 'EX' },
    { id: 'live', label: '实时图谱', icon: 'RT' },
    { id: 'closedLoop', label: '闭环增强', icon: 'CL' },
    { id: 'linkage', label: '联动分析', icon: 'LK' },
    { id: 'risk', label: '风险雷达', icon: 'RK' },
    { id: 'query', label: '查询示例', icon: 'QL' }
  ];

  const agentSteps = [
    { id: 'overview', label: '框架总览', icon: '01' },
    { id: 'regime', label: '市场与子Agent', icon: '02' },
    { id: 'trust', label: '辩论与信任', icon: '03' },
    { id: 'decision', label: '决策与风控', icon: '04' },
    { id: 'backtest', label: '回测结果', icon: '05' },
    { id: 'memory', label: '记忆反思', icon: '06' }
  ];

  const openKgSection = (sectionId) => {
    setKgSection(sectionId);
    setCurrentPage('knowledge-graph');
  };

  const openAgentStep = (stepId) => {
    setAgentStep(stepId);
    setCurrentPage('agent');
  };

  return (
    <div className="App">
      <div className="app-wrapper">
        <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <div className="sidebar-header">
            <div className="sidebar-logo">
              <span className="logo-icon">KG</span>
              {sidebarOpen && <span className="logo-text">KG-Agent</span>}
            </div>
            <button
              className="sidebar-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title={sidebarOpen ? '收起导航' : '展开导航'}
            >
              {sidebarOpen ? '<' : '>'}
            </button>
          </div>

          <nav className="sidebar-menu">
            <div className="menu-section">
              <div className="section-title">{sidebarOpen && '知识图谱'}</div>
              {kgSections.map((section) => (
                <button
                  key={section.id}
                  className={`menu-item agent-menu-item ${currentPage === 'knowledge-graph' && kgSection === section.id ? 'active' : ''}`}
                  onClick={() => openKgSection(section.id)}
                  title={`知识图谱 - ${section.label}`}
                >
                  <span className="menu-icon agent-menu-icon">{section.icon}</span>
                  {sidebarOpen && <span className="menu-text">{section.label}</span>}
                </button>
              ))}
            </div>

            <div className="menu-section">
              <div className="section-title">{sidebarOpen && '多Agent'}</div>
              {agentSteps.map((step) => (
                <button
                  key={step.id}
                  className={`menu-item agent-menu-item ${currentPage === 'agent' && agentStep === step.id ? 'active' : ''}`}
                  onClick={() => openAgentStep(step.id)}
                  title={`多Agent - ${step.label}`}
                >
                  <span className="menu-icon agent-menu-icon">{step.icon}</span>
                  {sidebarOpen && <span className="menu-text">{step.label}</span>}
                </button>
              ))}
            </div>
          </nav>

          <div className="sidebar-footer">
            <div className="user-card">
              <div className="user-avatar">ZQ</div>
              {sidebarOpen && (
                <div className="user-info">
                  <div className="user-name">Zhang Qingyue</div>
                  <div className="user-status">知识图谱与多Agent</div>
                </div>
              )}
            </div>
          </div>
        </aside>

        <main className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          {currentPage === 'knowledge-graph' && (
            <KnowledgeGraphPage activeSection={kgSection} onSectionChange={setKgSection} />
          )}

          {currentPage === 'agent' && (
            <AgentPage activeStep={agentStep} onStepChange={setAgentStep} showStepRail={false} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
