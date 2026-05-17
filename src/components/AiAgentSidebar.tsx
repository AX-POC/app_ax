import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { triggerConfetti, showCenterSuccessToast } from '../utils/uiHelpers';

// Agent Data
const agents = [
  {
    id: 'promotion',
    name: 'Promotion Agent',
    desc: 'Handles campaigns, coupons, and discounts.',
    avatar: '/agents/promo_animal.png',
    suggestions: ['Create coupon', 'Start pre-order']
  },
  {
    id: 'product',
    name: 'Product Agent',
    desc: 'Manages catalog, inventory, and listings.',
    avatar: '/agents/product_animal.png',
    suggestions: ['Create PTO model']
  },
  {
    id: 'order',
    name: 'Order Agent',
    desc: 'Tracks fulfillment and delivery workflows.',
    avatar: '/agents/order_agent_latest.png',
    suggestions: ['Find order ORD-BYUH3FDH', 'Search customer hsleelee@example.com', 'Go to Order List']
  },
  {
    id: 'rollout',
    name: 'Rollout Agent',
    desc: 'Instantly spins up new global storefronts.',
    avatar: '/agents/rollout_lop_rabbit.png',
    suggestions: ['스페인 사이트 열어줘', 'Deploy UK Store']
  },

  {
    id: 'security',
    name: 'Security Agent',
    desc: 'Monitors threats and protects your store in real-time.',
    avatar: '/agents/security_doberman.png',
    suggestions: ['Run security scan', 'Show threat logs', 'Generate report']
  }
];

function OrderIssuesForm({ onResolveErrors, onNotifyScm }: { onResolveErrors: (ids: string[]) => void, onNotifyScm: (ids: string[]) => void }) {
  const [checkedErrors, setCheckedErrors] = useState<string[]>([]);
  const [checkedDelays, setCheckedDelays] = useState<string[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  
  // AI Flow States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAiProposal, setShowAiProposal] = useState(false);
  const [isCarrierFixed, setIsCarrierFixed] = useState(false);

  const mockCreationErrors = [
    { type: 'ship method code error', ids: ['ORDER_81001821483', 'ORDER_81003920194'], msgTemplate: "ECSS message: [Seq. {id}][GERP] @ Shipping method is not Found. ( Carrier: , Warehouse: E0M, Delivery_type_Code: S)" },
    { type: 'price expired', ids: ['ORDER_81000938472'], msgTemplate: "ECSS message: [Seq. {id}][GERP] @ Price list is not set up. Contact to Sales Admin and ask to register a price." }
  ];

  const mockDelayedPicking = ['ORDER_81007891345', 'ORDER_81006672391'];

  const toggleCheck = (id: string, list: string[], setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <div className="chat-form" style={{ background: '#fafafa', border: '1px solid #ced4da', animation: 'fadeIn 0.4s ease' }}>
      <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', fontWeight: 'bold' }}>⚠️ Pending Order Flow Actions</p>
      
      {/* 1. Creation Errors */}
      <div style={{ marginBottom: '16px', background: '#fff', border: '1px solid #e9ecef', borderRadius: '4px', padding: '12px' }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '0.8rem', color: '#dc3545', display: 'flex', alignItems: 'center', gap: '6px' }}>🔴 Order Creation Error</h4>
        
        {mockCreationErrors.map(group => (
          <div key={group.type} style={{ marginBottom: '12px', paddingLeft: '8px', borderLeft: '2px solid #e9ecef' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6c757d', marginBottom: '6px' }}>Reason: {group.type}</div>
            {group.ids.map(id => (
              <label key={id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', marginBottom: '4px', cursor: 'pointer' }}>
                <input type="checkbox" checked={checkedErrors.includes(id)} onChange={() => toggleCheck(id, checkedErrors, setCheckedErrors)} />
                <span style={{ fontWeight: 700, letterSpacing: '0.05em' }}>{id}</span>
              </label>
            ))}
          </div>
        ))}

        {showDetails && checkedErrors.length > 0 && (
          <div style={{ background: '#212529', color: '#f8f9fa', padding: '10px', borderRadius: '4px', fontSize: '0.7rem', fontFamily: 'monospace', marginBottom: '12px', whiteSpace: 'pre-wrap', maxHeight: '120px', overflowY: 'auto', position: 'relative' }}>
            {checkedErrors.map(id => {
              const group = mockCreationErrors.find(g => g.ids.includes(id));
              return group ? <div key={id} style={{marginBottom: '4px'}}>{group.msgTemplate.replace('{id}', id)}</div> : null;
            })}
            
            {/* Loading Analysis Overlay */}
            {isAnalyzing && (
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(33,37,41,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#adb5bd', fontSize: '0.75rem', fontWeight: 'bold' }}>
                <span className="heartbeat-animation" style={{ marginRight: '8px' }}>🤖</span> AI Analysis in progress...
              </div>
            )}
          </div>
        )}

        {/* AI Proposal Card */}
        {showAiProposal && !isAnalyzing && checkedErrors.length > 0 && (
          <div style={{ background: '#f8f9fa', border: '1px solid #ced4da', borderLeft: '4px solid #0d6efd', padding: '12px', borderRadius: '4px', marginBottom: '12px', animation: 'fadeIn 0.5s ease' }}>
            <h5 style={{ margin: '0 0 8px 0', fontSize: '0.8rem', color: '#0d6efd', display: 'flex', alignItems: 'center', gap: '6px' }}>💡 Agent Analysis</h5>
            {!isCarrierFixed ? (
              <>
                <p style={{ margin: '0 0 10px 0', fontSize: '0.75rem', color: '#495057', lineHeight: '1.4' }}>
                  다른 제품들과 비교했을 때, 캐리어 값이 누락되어 있습니다.<br/>
                  동일 제품군의 Carrier 명인 <strong>Pantos</strong>로 세팅할까요?
                </p>
                <button 
                  className="btn" 
                  style={{ background: '#0d6efd', color: '#fff', fontSize: '0.7rem', padding: '6px 12px', fontWeight: 'bold', border: 'none', borderRadius: '4px' }}
                  onClick={(e) => { e.preventDefault(); setIsCarrierFixed(true); }}
                >
                  승인 (Approve & Update)
                </button>
              </>
            ) : (
              <p style={{ margin: '0', fontSize: '0.75rem', color: '#198754', fontWeight: 'bold' }}>
                ✅ Carrier explicitly mapped to <strong style={{ color: '#0d6efd' }}>Pantos</strong>.<br/>
                <span style={{ fontWeight: 'normal', color: '#6c757d', display: 'block', marginTop: '4px' }}>Ready to resend to ECS/ERP.</span>
              </p>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          {!showDetails && (
            <button 
              className="btn" 
              style={{ width: '100%', background: '#f8f9fa', border: '1px solid #ced4da', color: '#495057', fontSize: '0.75rem', padding: '8px', fontWeight: 'bold' }}
              onClick={(e) => { 
                e.preventDefault(); 
                setShowDetails(true); 
                setIsAnalyzing(true);
                setTimeout(() => {
                  setIsAnalyzing(false);
                  setShowAiProposal(true);
                }, 1800);
              }}
              disabled={checkedErrors.length === 0}
            >
              Check Details
            </button>
          )}

          {isCarrierFixed && (
            <button 
              className="btn btn-primary" 
              style={{ width: '100%', background: 'var(--lg-red)', fontSize: '0.75rem', padding: '8px', animation: 'fadeIn 0.3s ease' }}
              onClick={(e) => { e.preventDefault(); if(checkedErrors.length > 0) onResolveErrors(checkedErrors); }}
            >
              Resend to ECS/ERP ({checkedErrors.length})
            </button>
          )}
        </div>
      </div>

      {/* 2. Delayed Picking */}
      <div style={{ background: '#fff', border: '1px solid #e9ecef', borderRadius: '4px', padding: '12px' }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '0.8rem', color: '#ffc107', display: 'flex', alignItems: 'center', gap: '6px' }}>🟡 Order Picking Delayed</h4>
        
        <div style={{ marginBottom: '12px', paddingLeft: '8px', borderLeft: '2px solid #e9ecef' }}>
          {mockDelayedPicking.map(id => (
            <label key={id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', marginBottom: '4px', cursor: 'pointer' }}>
               <input type="checkbox" checked={checkedDelays.includes(id)} onChange={() => toggleCheck(id, checkedDelays, setCheckedDelays)} />
               <span style={{ fontWeight: 700, letterSpacing: '0.05em' }}>{id}</span>
            </label>
          ))}
        </div>

        <button 
          className="btn btn-primary" 
          style={{ width: '100%', marginTop: '8px', background: 'var(--lg-black)', fontSize: '0.75rem', padding: '8px' }}
          onClick={(e) => { e.preventDefault(); if(checkedDelays.length > 0) onNotifyScm(checkedDelays); }}
          disabled={checkedDelays.length === 0}
        >
          Notify SCM Manager Again ({checkedDelays.length})
        </button>
      </div>
    </div>
  );
}

export default function AiAgentSidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [view, setView] = useState<'dashboard' | 'chat'>('dashboard');
  const [activeAgent, setActiveAgent] = useState<any>(null);
  const [activePromotions, setActivePromotions] = useState<any[]>([]);
  const [lastProcessedLogId, setLastProcessedLogId] = useState<string | null>(null);
  const navigate = useNavigate();
  
  
  // Drag State for Floating Button
  const [btnPos, setBtnPos] = useState({ x: 16, y: 16 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, btnX: 0, btnY: 0, moved: false });
  
  // Chat States
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Security Report Modal
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportContent, setReportContent] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [reportMeta, setReportMeta] = useState<any>(null);

  const dispatchAiAction = (detail: any) => {
    window.dispatchEvent(new CustomEvent('ai-action-apply', { detail }));
    const iframe = document.getElementById('store-preview-iframe') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      const targetOrigin = window.location.hostname.includes('onrender.com') ? 'https://lg-ai-commerce.onrender.com' : '*';
      iframe.contentWindow.postMessage({ type: 'ai-action-apply', detail }, targetOrigin);
    }
  };

  // Auto-push body padding when Sidebar is open, persisting through Astro ViewTransitions
  useEffect(() => {
    const syncBodyClass = () => {
      if (isOpen) {
        document.body.classList.add('ai-sidebar-open');
      } else {
        document.body.classList.remove('ai-sidebar-open');
      }
    };
    
    syncBodyClass();
    document.addEventListener('astro:page-load', syncBodyClass);
    return () => document.removeEventListener('astro:page-load', syncBodyClass);
  }, [isOpen]);

  useEffect(() => {
    fetch('/api/promotions')
      .then(res => res.json())
      .then(data => setActivePromotions(data))
      .catch(err => console.error("Failed to fetch promotions:", err));
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // 에이전트 ID → 우측 Admin 페이지 매핑
  const agentPageMap: Record<string, string> = {
    promotion: '/promotions',
    product: '/products',
    order: '/orders',
    rollout: '/stores',
    security: '/security',
  };

  // Poll for Security Threats
  const isFirstPoll = useRef(true);

  useEffect(() => {
    let polling = true;
    const checkSecurityState = async () => {
      if (!polling) return;
      try {
        const res = await fetch(`/api/security/state?t=${Date.now()}`, { cache: 'no-store' });
        if (res.ok) {
          const state = await res.json();
          if (state.logs && state.logs.length > 0) {
            const latestLog = state.logs[state.logs.length - 1];
            
            // 페이지 첫 로드 시에는 기존 로그에 반응하지 않고 최신 ID만 기억합니다.
            if (isFirstPoll.current) {
              isFirstPoll.current = false;
              setLastProcessedLogId(latestLog.id);
            } 
            // 새롭게 발생한 심각한 위협 감지 (RESOLVED가 아닌 경우)
            else if (latestLog.status !== 'RESOLVED' && (latestLog.severity === 'HIGH' || latestLog.severity === 'CRITICAL') && latestLog.id !== lastProcessedLogId) {
              setLastProcessedLogId(latestLog.id);
              
              // 1. 보안 대시보드 화면으로 강제 이동 및 사이드바 오픈
              navigate('/security');
              setIsOpen(true);
              
              const secAgent = agents.find(a => a.id === 'security');
              if (secAgent) {
                setActiveAgent(secAgent);
                setView('chat');
                
                // 2. 공격 탐지 메시지 출력
                setMessages([
                  { role: 'agent', type: 'text', content: `🔴 **CRITICAL ALERT:**\nAnomaly detected! A massive spike in malicious traffic (${latestLog.type}) is hitting the endpoints from multiple IP ranges.` }
                ]);
                
                // 처리 중(애니메이션 효과)를 위해 타이핑 인디케이터 켬
                setTimeout(() => setIsTyping(true), 1000);
                
                // 3. 자율 방어 조치 메시지 및 종결 처리 (10초 후)
                setTimeout(async () => {
                  setIsTyping(false);
                  setMessages(prev => [...prev, { role: 'agent', type: 'text', content: `⚡ **Autonomous Defense Triggered:**\nI have automatically routed the traffic through the scrubbing center and blacklisted the offending subnets. The attack has been neutralized without system downtime.` }]);
                  
                  try {
                    await fetch('/api/security/resolve', { method: 'POST' });
                  } catch(e) {}
                }, 10000);
              }
            }
          }
        }
      } catch (err) {
        // ignore
      }
      if (polling) {
        setTimeout(checkSecurityState, 2000);
      }
    };
    
    checkSecurityState();
    return () => { polling = false; };
  }, [lastProcessedLogId, navigate]);


  const handleSelectAgent = (agent: any) => {
    // 우측 대시보드를 에이전트에 맞는 Admin 페이지로 이동
    const targetPage = agentPageMap[agent.id];
    if (targetPage) {
      navigate(targetPage);
    }

    setActiveAgent(agent);
    setView('chat');

    if (agent.id === 'security') {
      setMessages([
        { role: 'agent', type: 'text', content: `🛡️ Security Guardian activated.\nI am monitoring your store in real-time. The Security Dashboard is now displayed on the right panel.\n\nAvailable commands:\n• "Run DDoS simulation"\n• "Scan for SQL injection"\n• "Generate security report"\n• "Show current threat level"` }
      ]);
    } else {
      const initialMsgs: any[] = [
        { role: 'agent', type: 'text', content: `Welcome! I am your ${agent.name}. How can I help you manage the store today?` }
      ];
      
      if (agent.suggestions && agent.suggestions.length > 0) {
        initialMsgs.push({ role: 'agent', type: 'suggestions_group', suggestions: agent.suggestions });
      }
      
      setMessages(initialMsgs);
    }
  };

  // Drag Event Handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        dragRef.current.moved = true;
      }
      setBtnPos({
        x: dragRef.current.btnX + dx,
        y: dragRef.current.btnY + dy
      });
    };

    const handleMouseUp = () => {
      if (isDragging) setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const COMMERCE_API = '';

  const submitMessage = async (text: string) => {
    if (!text.trim()) return;

    setMessages(prev => [...prev, { role: 'user', type: 'text', content: text }]);
    setInputText('');
    setIsTyping(true);

    // Instant navigation for PTO flow
    if (activeAgent?.id === 'product' && (text.toLowerCase().includes('pto') || text.toLowerCase().includes('pick to order') || text.toLowerCase().includes('create pto model'))) {
      if (window.location.pathname !== '/preview') {
         navigate('/preview');
      }
    }

    // Security Agent 명령 처리
    if (activeAgent?.id === 'security') {
      const lower = text.toLowerCase();
      try {
        if (lower.includes('ddos')) {
          await fetch(`${COMMERCE_API}/api/security/simulate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'DDOS' }) });
          const res = await fetch(`${COMMERCE_API}/api/security/state`);
          const state = await res.json();
          setTimeout(() => { setIsTyping(false); setMessages(prev => [...prev, { role: 'agent', type: 'text', content: `🌊 DDoS attack simulation executed.\n\n🔴 Threat Level: ${state.level}\n⚡ Active Threats: ${state.activeThreats}\n🛡️ Blocked Today: ${state.blockedToday}\n📊 Total Scanned: ${state.totalScanned.toLocaleString()}\n\nThe Security Dashboard on the right has been updated in real-time.` }]); }, 800);
        } else if (lower.includes('sql')) {
          await fetch(`${COMMERCE_API}/api/security/simulate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'SQL_INJECTION' }) });
          const res = await fetch(`${COMMERCE_API}/api/security/state`);
          const state = await res.json();
          setTimeout(() => { setIsTyping(false); setMessages(prev => [...prev, { role: 'agent', type: 'text', content: `💉 SQL Injection attack simulation executed.\n\n🔴 Threat Level: ${state.level}\n⚡ Active Threats: ${state.activeThreats}\n🛡️ Blocked Today: ${state.blockedToday}\n\nInjection attempt has been intercepted and logged.` }]); }, 800);
        } else if (lower.includes('brute')) {
          await fetch(`${COMMERCE_API}/api/security/simulate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'BRUTE_FORCE' }) });
          const res = await fetch(`${COMMERCE_API}/api/security/state`);
          const state = await res.json();
          setTimeout(() => { setIsTyping(false); setMessages(prev => [...prev, { role: 'agent', type: 'text', content: `🔓 Brute Force attack simulation executed.\n\n🔴 Threat Level: ${state.level}\n⚡ Active Threats: ${state.activeThreats}\n🛡️ Blocked Today: ${state.blockedToday}\n\nSuspicious login attempts have been blocked.` }]); }, 800);
        } else if (lower.includes('price') || lower.includes('가격')) {
          await fetch(`${COMMERCE_API}/api/security/simulate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'PRICE_MANIPULATION' }) });
          const res = await fetch(`${COMMERCE_API}/api/security/state`);
          const state = await res.json();
          setTimeout(() => { setIsTyping(false); setMessages(prev => [...prev, { role: 'agent', type: 'text', content: `💰 Price Manipulation attack simulation executed.\n\n🔴 Threat Level: ${state.level}\n🛡️ Blocked Today: ${state.blockedToday}\n\nPrice tampering attempt detected and neutralized.` }]); }, 800);
        } else if (lower.includes('full') || lower.includes('all') || lower.includes('전체')) {
          await fetch(`${COMMERCE_API}/api/security/simulate-all`, { method: 'POST' });
          setTimeout(async () => {
            const res = await fetch(`${COMMERCE_API}/api/security/state`);
            const state = await res.json();
            setIsTyping(false);
            setMessages(prev => [...prev, { role: 'agent', type: 'text', content: `🚨 Full Attack Scenario executed!\n\n🔴 Threat Level: ${state.level}\n⚡ Active Threats: ${state.activeThreats}\n🛡️ Blocked Today: ${state.blockedToday}\n📊 Total Scanned: ${state.totalScanned.toLocaleString()}\n📋 Total Logs: ${state.logs.length}\n\nAll attack vectors have been simulated. Check the dashboard for details.` }]);
          }, 2000);
        } else if (lower.includes('report') || lower.includes('보고서')) {
          // 보고서 팝업 모달 띄우기
          setIsTyping(false);
          setMessages(prev => [...prev, { role: 'agent', type: 'text', content: '📊 Generating AI Security Report... Opening report window.' }]);
          setReportLoading(true);
          setShowReportModal(true);
          // 상태 먼저 수집
          const statusRes = await fetch(`${COMMERCE_API}/api/security/state`);
          const statusData = await statusRes.json();
          setReportMeta(statusData);
          // AI 보고서 생성
          const res = await fetch(`${COMMERCE_API}/api/security/report`, { method: 'GET' });
          const data = await res.json();
          setReportContent(data.report || 'No threats detected. System is operating normally.');
          setReportLoading(false);
        } else if (lower.includes('clear') || lower.includes('초기화') || lower.includes('reset')) {
          await fetch(`${COMMERCE_API}/api/security/logs`, { method: 'DELETE' });
          setTimeout(() => { setIsTyping(false); setMessages(prev => [...prev, { role: 'agent', type: 'text', content: `🗑️ Security logs cleared. System reset to SAFE status.\n\nAll threat data has been purged. Dashboard is now clean.` }]); }, 500);
        } else if (lower.includes('status') || lower.includes('level') || lower.includes('상태') || lower.includes('threat')) {
          const res = await fetch(`${COMMERCE_API}/api/security/state`);
          const state = await res.json();
          setTimeout(() => { setIsTyping(false); setMessages(prev => [...prev, { role: 'agent', type: 'text', content: `🛡️ Current Security Status:\n\n• Threat Level: ${state.level}\n• Active Threats: ${state.activeThreats}\n• Blocked Today: ${state.blockedToday}\n• Total Scanned: ${state.totalScanned.toLocaleString()}\n• Event Logs: ${state.logs.length} entries\n• Last Updated: ${new Date(state.lastUpdated).toLocaleTimeString('ko-KR')}` }]); }, 500);
        } else {
          // AI 대화로 fallback
          try {
            const response = await fetch('/api/agent/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: text, agent: 'security' }) });
            const data = await response.json();
            setIsTyping(false);
            setMessages(prev => [...prev, { role: 'agent', type: 'text', content: data.text || data.error || 'I can help with security operations. Try commands like "Run DDoS simulation" or "Generate security report".' }]);
          } catch {
            setIsTyping(false);
            setMessages(prev => [...prev, { role: 'agent', type: 'text', content: 'Available commands:\n• "Run DDoS simulation"\n• "Scan for SQL injection"\n• "Simulate brute force"\n• "Price manipulation test"\n• "Full attack scenario"\n• "Generate report"\n• "Show status"\n• "Clear logs"' }]);
          }
        }
      } catch (err) {
        setIsTyping(false);
        setReportLoading(false);
        setMessages(prev => [...prev, { role: 'agent', type: 'text', content: '⚠️ Failed to connect to Security Engine. Please check your network connection.' }]);
      }
      return;
    }


    // Natural Language local parser for promotion coupon creation
    if (activeAgent?.id === 'promotion') {
      const lower = text.toLowerCase();
      
      // Flexible parsing: check if it's asking for a coupon and specifies a percentage
      if (lower.includes('coupon') && /\d+%/.test(lower)) {
        const rateMatch = lower.match(/(\d+)%/);
        const rate = rateMatch ? parseInt(rateMatch[1], 10) : 10;
        
        let target = 'All Products';
        if (lower.includes('tv')) target = 'All TV';
        else if (lower.includes('soundbar')) target = 'All Soundbar';
        else if (lower.includes('ref')) target = 'All Refrigerator';
        else if (lower.includes('sku')) target = 'Specific SKU';
        
        let audience = 'ALL';
        if (lower.includes('d2c')) audience = 'D2C';
        else if (lower.includes('guest')) audience = 'GUEST';
        else if (lower.includes('d2b2c')) audience = 'D2B2C';
        else if (lower.includes('d2e')) audience = 'D2E';

        const promoDetails = {
          discountType: 'PERCENT',
          rate: rate,
          target: target,
          audience: audience,
          sku: '',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 86400000*30).toISOString().split('T')[0]
        };

        setTimeout(() => {
          setIsTyping(false);
          setMessages(prev => [...prev, {
            role: 'agent',
            type: 'action',
            content: `I've understood your request! You want to create a ${rate}% discount for ${audience} targeting ${target}. Is this correct? You can preview and deploy below.`,
            actionDetails: { type: 'PROMOTION', ...promoDetails }
          }]);
        }, 800);
        return; // Exit here, do not call Gemini API
      }
    }

    try {
      const response = await fetch('/api/agent/chat', { 
         method: 'POST', 
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ message: text, agent: activeAgent.id, activePromotions }) 
      });
      const data = await response.json();
      setIsTyping(false);
      
      if (!response.ok) {
        setMessages(prev => [...prev, { role: 'agent', type: 'text', content: `⚠️ ${data.error || '알 수 없는 서버 오류'}` }]);
        return;
      }
      
      // Auto-handler for STOP promotion action coming from AI
      if (data && data.type === 'action' && data.actionDetails?.type === 'STOP_PROMOTION') {
        const rawPromoId = data.actionDetails.promotionId || '';
        const promoId = rawPromoId.replace(/\[|\]/g, ''); // Strip bracket hallucinations
        const schedule = (data.actionDetails.schedule || 'Immediate').toLowerCase();

        if (schedule.includes('immediate')) {
          setActivePromotions(prev => {
            const nextList = prev.filter(p => p.id !== promoId);
            dispatchAiAction({ type: 'STOP', remaining: nextList, promotionId: promoId });
            return nextList;
          });
        }
      }

      if (data) {
        setMessages(prev => [...prev, {
          role: 'agent',
          type: data.type || 'text',
          formType: data.formType,
          content: data.text,
          actionDetails: data.actionDetails || data.action
        }]);
        
        if (data.type === 'action' && data.action) {
          if (data.action.type === 'NAVIGATE') {
            setTimeout(() => navigate(data.action.payload), 1000);
          } else if (data.action.type === 'REFRESH_DATA') {
            setTimeout(() => window.location.reload(), 1500);
          }
        }
      }
    } catch (err) {
      console.error("AI Fetch Error:", err);
      setIsTyping(false);
      setMessages(prev => [...prev, { role: 'agent', type: 'text', content: 'Connection to AI brain failed. Please check the network or API Key.' }]);
    }
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    submitMessage(inputText);
  };

  const handleFormSubmit = (promoDetails: any) => {
    const isPct = promoDetails.discountType === 'PERCENT';
    const valObj = isPct ? `${promoDetails.rate}%` : `$${promoDetails.rate}`;
    const targetObj = promoDetails.target === 'Specific SKU' ? `SKU ${promoDetails.sku}` : promoDetails.target;
    const textMsg = `Draft a promotion applying a ${valObj} discount on ${targetObj} for audience [${promoDetails.audience}] valid from ${promoDetails.startDate || 'today'} until ${promoDetails.endDate || 'forever'}.`;
    
    setMessages(prev => [...prev, { 
      role: 'user', 
      type: 'text', 
      content: textMsg
    }]);

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        role: 'agent',
        type: 'action',
        content: "I've drafted the promotion settings based on the form. Would you like to preview this live before deploying?",
        actionDetails: { type: 'PROMOTION', ...promoDetails }
      }]);
    }, 1500);
  };

  const handleApproveAction = async (details: any) => {
    try {
      const payload = {
        ...details,
        name: details.name || "AI Generated Coupon",
        targetScope: details.target,
        discountValue: details.rate,
        targetSku: details.sku,
        startDate: details.startDate ? (details.startDate.includes('T') ? details.startDate : `${details.startDate}T00:00:00`) : null,
        endDate: details.endDate ? (details.endDate.includes('T') ? details.endDate : `${details.endDate}T23:59:59`) : null
      };
      const res = await fetch('/api/promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText);
      }
      
      const newPromo = await res.json();
      setActivePromotions(prev => [...prev, newPromo]);

      let affectedCount = 1;
      if (details.target === 'All Products') affectedCount = 1450;
      else if (details.target === 'All TV') affectedCount = 38;
      else if (details.target === 'All Soundbar') affectedCount = 12;
      else if (details.target === 'All Refrigerator') affectedCount = 45;
      else if (details.target === 'Specific SKU') affectedCount = 1;

      setMessages(prev => [...prev, {
        role: 'agent',
        type: 'action',
        actionDetails: { type: 'PROMOTION_SUCCESS', promotionId: newPromo.id, affectedCount, target: details.target, sku: details.sku }
      }]);

      dispatchAiAction({ type: 'PROMOTION', promotion: newPromo });
    } catch (err: any) {
      console.error("Failed to save promotion:", err);
      setMessages(prev => [...prev, {
        role: 'agent',
        type: 'text',
        content: `⚠️ Deployment Failed: ${err.message}`
      }]);
    }
  };

  return (
    <>
      {/* ===== Security Report Modal ===== */}
      {showReportModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 0.3s ease'
        }}
          onClick={() => setShowReportModal(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: 720, maxWidth: '92vw', maxHeight: '88vh',
              background: '#fff', borderRadius: 16,
              boxShadow: '0 24px 80px rgba(0,0,0,0.25)',
              display: 'flex', flexDirection: 'column',
              overflow: 'hidden', animation: 'cloiSlideUp 0.3s ease'
            }}
          >
            {/* Report Header */}
            <div style={{
              padding: '24px 28px 20px',
              borderBottom: '1px solid #e5e7eb',
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              color: '#fff'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: 22 }}>🛡️</span>
                    <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, letterSpacing: '0.5px' }}>
                      AI Security Analysis Report
                    </h2>
                  </div>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>
                    Generated: {new Date().toLocaleString('ko-KR')} · LG AI Commerce Platform
                  </div>
                </div>
                <button
                  onClick={() => setShowReportModal(false)}
                  style={{
                    background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff',
                    width: 32, height: 32, borderRadius: 8, cursor: 'pointer',
                    fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >✕</button>
              </div>

              {/* Summary Cards */}
              {reportMeta && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginTop: 16 }}>
                  {[
                    { label: 'Threat Level', value: reportMeta.level, color: reportMeta.level === 'CRITICAL' ? '#ef4444' : reportMeta.level === 'WARNING' ? '#f59e0b' : '#22c55e' },
                    { label: 'Active Threats', value: reportMeta.activeThreats, color: reportMeta.activeThreats > 0 ? '#ef4444' : '#22c55e' },
                    { label: 'Blocked Today', value: reportMeta.blockedToday, color: '#3b82f6' },
                    { label: 'Total Scanned', value: reportMeta.totalScanned?.toLocaleString(), color: '#a78bfa' },
                  ].map((s, i) => (
                    <div key={i} style={{
                      background: 'rgba(255,255,255,0.07)', borderRadius: 8,
                      padding: '10px 12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</div>
                      <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Report Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
              {reportLoading ? (
                <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>
                  <div style={{ fontSize: 28, marginBottom: 12, animation: 'dotPulse 1.4s infinite ease-in-out' }}>🤖</div>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>AI가 보안 로그를 분석하고 있습니다...</div>
                  <div style={{ fontSize: 12, marginTop: 6, color: '#94a3b8' }}>Gemini Security Analyzer</div>
                </div>
              ) : (
                <div style={{ fontSize: 14, lineHeight: 1.8, color: '#1e293b', whiteSpace: 'pre-wrap' }}>
                  {/* 마크다운 형식의 보고서를 렌더링 */}
                  {reportContent.split('\n').map((line, idx) => {
                    const trimmed = line.trim();
                    if (trimmed.startsWith('# ')) return <h2 key={idx} style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: '20px 0 8px', borderBottom: '2px solid #e2e8f0', paddingBottom: 6 }}>{trimmed.slice(2)}</h2>;
                    if (trimmed.startsWith('## ')) return <h3 key={idx} style={{ fontSize: 16, fontWeight: 700, color: '#1e40af', margin: '16px 0 6px', display: 'flex', alignItems: 'center', gap: 6 }}>{trimmed.slice(3)}</h3>;
                    if (trimmed.startsWith('### ')) return <h4 key={idx} style={{ fontSize: 14, fontWeight: 700, color: '#334155', margin: '12px 0 4px' }}>{trimmed.slice(4)}</h4>;
                    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) return <div key={idx} style={{ paddingLeft: 16, position: 'relative', marginBottom: 4 }}><span style={{ position: 'absolute', left: 4, color: '#3b82f6', fontWeight: 700 }}>•</span>{trimmed.slice(2)}</div>;
                    if (trimmed.startsWith('> ')) return <div key={idx} style={{ borderLeft: '3px solid #3b82f6', paddingLeft: 12, color: '#475569', fontStyle: 'italic', margin: '8px 0', background: '#f8fafc', padding: '8px 12px', borderRadius: '0 6px 6px 0' }}>{trimmed.slice(2)}</div>;
                    if (trimmed.startsWith('---')) return <hr key={idx} style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '16px 0' }} />;
                    if (trimmed === '') return <div key={idx} style={{ height: 8 }} />;
                    // Bold text
                    const boldParsed = trimmed.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
                    return <div key={idx} dangerouslySetInnerHTML={{ __html: boldParsed }} style={{ marginBottom: 2 }} />;
                  })}
                </div>
              )}
            </div>

            {/* Report Footer */}
            <div style={{
              padding: '14px 28px', borderTop: '1px solid #e5e7eb',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: '#f8fafc'
            }}>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>
                🔒 Confidential · LG AI Commerce Security Team
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => {
                    const printWindow = window.open('', '_blank');
                    if (printWindow) {
                      printWindow.document.write(`<html><head><title>Security Report</title><style>body{font-family:'Segoe UI',sans-serif;padding:40px;color:#1e293b;line-height:1.8}h1{color:#0f172a;border-bottom:2px solid #e2e8f0;padding-bottom:8px}h2{color:#1e40af}h3{color:#334155}hr{border:none;border-top:1px solid #e2e8f0;margin:16px 0}</style></head><body><h1>🛡️ AI Security Analysis Report</h1><p style="color:#94a3b8;font-size:12px">Generated: ${new Date().toLocaleString('ko-KR')}</p><pre style="white-space:pre-wrap;font-family:inherit">${reportContent}</pre></body></html>`);
                      printWindow.document.close();
                      printWindow.print();
                    }
                  }}
                  style={{
                    padding: '8px 16px', borderRadius: 8, border: '1px solid #d1d5db',
                    background: '#fff', color: '#374151', fontSize: 12, fontWeight: 600,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
                  }}
                >🖨️ Print</button>
                <button
                  onClick={() => setShowReportModal(false)}
                  style={{
                    padding: '8px 20px', borderRadius: 8, border: 'none',
                    background: '#0f172a', color: '#fff', fontSize: 12, fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className={`ai-sidebar-container ${isOpen ? 'open' : ''}`}>
        <div className="ai-header">
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--lg-black)' }}>LG AI Agents</h2>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} style={{ border:'none', background:'transparent', fontSize:'1.2rem', cursor:'pointer' }}>
          ✕
        </button>
      </div>

      {view === 'dashboard' ? (
        <div className="ai-view-content">
          <p style={{marginBottom:'24px', fontWeight:500, lineHeight: '1.5', color: '#475569', fontSize: '0.95rem'}}>
            <strong style={{color: '#1e293b', fontSize: '1.05rem'}}>Welcome to LG Commerce Admin!</strong><br/>
            Our AI Agents will help you explore and configure your site in the blink of an eye.<br/>
            <span style={{fontWeight: 700, color: 'var(--accent)', display: 'inline-block', marginTop: '10px'}}>Select an agent to start working:</span>
          </p>
          {agents.map(agent => (
            <div key={agent.id} className="ai-agent-item" style={{ display: 'flex', alignItems: 'center' }} onClick={() => handleSelectAgent(agent)}>
              <img src={agent.avatar} alt={agent.name} className="ai-agent-avatar" />
              <div className="ai-agent-info" style={{ flexGrow: 1 }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {agent.name}
                </h3>
                <p>{agent.desc}</p>
              </div>
              {agent.id === 'promotion' && (
                <div 
                  className="promotion-bell heartbeat-animation" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveAgent(agent);
                    setView('chat');
                    setMessages([
                      { 
                        role: 'agent', 
                        type: 'text', 
                        content: `🚀 **Sales Opportunity Detected:**\nAdministrator, I've observed an incredible traffic surge for the **OLED65G4** TV line over the past week. Let's capture this immense interest and maximize our conversions!` 
                      },
                      {
                        role: 'agent',
                        type: 'action',
                        actionDetails: { type: 'DATA_VISUALIZATION_OLED' }
                      },
                      {
                        role: 'agent',
                        type: 'text',
                        content: `Should we issue a proactive targeted discount coupon to turn these hesitant visitors into buyers?`
                      },
                      {
                        role: 'agent',
                        type: 'action',
                        actionDetails: { type: 'PROACTIVE_TV_COUPON' }
                      }
                    ]);
                  }}
                  style={{ position: 'relative', cursor: 'pointer', padding: '12px', background: '#e9ecef', borderRadius: '50%', color: '#495057', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="New Insight Available"
                >
                  <span style={{ fontSize: '1.2rem' }}>🔔</span>
                  <span style={{ position: 'absolute', top: '6px', right: '8px', width: '10px', height: '10px', background: 'var(--lg-red)', borderRadius: '50%', border: '2px solid white' }}></span>
                </div>
              )}
              {agent.id === 'order' && (
                <div 
                  className="promotion-bell heartbeat-animation" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveAgent(agent);
                    setView('chat');
                    setMessages([
                      { 
                        role: 'agent', 
                        type: 'text', 
                        content: `🔔 **System Alert:**\nWarning, I've detected some unprocessed orders and delayed pickings in the supply chain pipeline. Please select appropriate actions to resolve them.` 
                      },
                      {
                        role: 'agent',
                        type: 'form',
                        formType: 'order_issues_flow'
                      }
                    ]);
                  }}
                  style={{ position: 'relative', cursor: 'pointer', padding: '12px', background: '#e9ecef', borderRadius: '50%', color: '#495057', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '8px' }}
                  title="Order Issues Available"
                >
                  <span style={{ fontSize: '1.2rem' }}>🔔</span>
                  <span style={{ position: 'absolute', top: '6px', right: '8px', width: '10px', height: '10px', background: 'var(--lg-red)', borderRadius: '50%', border: '2px solid white' }}></span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="ai-view-content" style={{ display:'flex', flexDirection:'column' }}>
            <div className="ai-chat-header">
              <button className="back-btn" onClick={() => setView('dashboard')}>←</button>
              <img src={activeAgent?.avatar} alt="Agent" style={{width:'48px', height:'48px', borderRadius:'50%'}} />
              <span style={{fontWeight:700, fontSize:'1.1rem'}}>{activeAgent?.name}</span>
            </div>

            <div className="chat-history">
              {messages.map((msg, idx) => (
                <div key={idx} className={`chat-bubble ${msg.role}`}>
                  {msg.content && msg.type !== 'suggestion' && <p style={{ whiteSpace: 'pre-wrap', margin: 0, lineHeight: '1.4' }}>{msg.content}</p>}
                  
                  {/* Grouped Suggestions Bubble Type */}
                  {msg.type === 'suggestions_group' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <span style={{ fontSize: '0.8rem', color: '#6c757d', marginBottom: '2px', fontWeight: 'bold' }}>Quick Actions:</span>
                      {msg.suggestions.map((sug: string, sIdx: number) => (
                        <button 
                          key={sIdx} 
                          style={{
                            background: '#fff', border: '1px solid #ced4da', borderRadius: '8px',
                            padding: '10px 14px', fontSize: '0.85rem', color: '#495057', cursor: 'pointer',
                            textAlign: 'left', transition: 'all 0.2s ease', boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                            display: 'block', width: '100%', outline: 'none'
                          }}
                          onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--lg-red)'; e.currentTarget.style.color = 'var(--lg-red)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.05)'; }}
                          onMouseOut={(e) => { e.currentTarget.style.borderColor = '#ced4da'; e.currentTarget.style.color = '#495057'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)'; }}
                          onClick={() => submitMessage(sug)}
                        >
                          💡 {sug}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {/* Live Progress Stream Component */}
                  {msg.type === 'progress' && (
                    <div className="progress-card" style={{ background: '#f8f9fa', border: '1px solid #dee2e6', padding: '12px', borderRadius: '8px', marginTop: '8px' }}>
                      <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#495057' }}>{msg.progressTitle || '⚙️ Deployment Progress'}</h4>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.85rem' }}>
                        {msg.progressList?.map((line: string, i: number) => (
                          <li key={i} style={{ marginBottom: '6px', color: line.includes('✅') || line.includes('SUCCESS') ? 'var(--lg-red)' : '#6c757d', fontWeight: line.includes('✅') ? 'bold' : 'normal', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                            {line.includes('✅') || line.includes('SUCCESS') ? null : (
                              i === msg.progressList!.length - 1 ? (
                                <span className="spinner" style={{display:'inline-block', minWidth:'12px', height:'12px', border:'2px solid #ccc', borderTopColor:'var(--lg-red)', borderRadius:'50%', animation:'spin 1s linear infinite', marginTop: '4px'}}></span>
                              ) : (
                                <span style={{display:'inline-block', minWidth:'12px', height:'12px', border:'2px solid #ccc', borderRadius:'50%', marginTop: '4px'}}></span>
                              )
                            )}
                            <span>{line}</span>
                          </li>
                        ))}
                      </ul>
                      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                    </div>
                  )}

                  {/* Interactive Dynamic Form */}
                  {msg.type === 'form' && msg.formType === 'promotion' && (
                    <PromotionForm onSubmit={handleFormSubmit} />
                  )}

                  {msg.type === 'form' && msg.formType === 'stop_promotion_flow' && (
                    <StopPromotionForm 
                      activePromotions={activePromotions} 
                      onSubmit={(promoId, scheduleType, date) => {
                        const textMsg = scheduleType === 'Immediate' 
                          ? `Stop coupon [${promoId}] immediately.` 
                          : `Schedule stop for coupon [${promoId}] on ${date}.`;
                        
                        setMessages(prev => [...prev, { role: 'user', type: 'text', content: textMsg }]);
                        setIsTyping(true);
                        setTimeout(() => {
                           setIsTyping(false);
                           setMessages(prev => [...prev, {
                             role: 'agent',
                             type: 'action',
                             content: "I have prepared the termination.",
                             actionDetails: { type: 'STOP_PROMOTION', promotionId: promoId, schedule: scheduleType === 'Immediate' ? 'Immediate' : date }
                           }]);
                           
                           if (scheduleType === 'Immediate') {
                              fetch(`/api/promotions/${promoId}`, { method: 'DELETE' })
                                .then(() => {
                                  setActivePromotions(prev => {
                                    const nextList = prev.filter(p => p.id !== promoId);
                                    dispatchAiAction({ type: 'STOP', remaining: nextList, promotionId: promoId });
                                    return nextList;
                                  });
                                })
                                .catch(err => console.error("Failed to stop promotion:", err));
                           }
                        }, 1000);
                      }} 
                    />
                  )}

                  {msg.type === 'form' && msg.formType === 'pto_flow' && (
                    <PtoCreationForm onSubmit={(bundleName, price, skus, category, images, startDate, endDate) => {
                        setMessages(prev => [...prev, { role: 'user', type: 'text', content: `Create PTO Bundle: [${bundleName}] containing [${skus.join(', ')}] in category [${category}] for $${price}.` }]);
                        setIsTyping(true);
                        setTimeout(() => {
                           setIsTyping(false);
                           setMessages(prev => [...prev, {
                             role: 'agent',
                             type: 'action',
                             content: "The dynamic PTO bundle has been configured successfully. Please approve the deployment.",
                             actionDetails: { type: 'PTO_CREATE', bundleName, price, skus, category, images, startDate, endDate }
                           }]);
                        }, 1200);
                    }} />
                  )}

                  {msg.type === 'form' && msg.formType === 'order_issues_flow' && (
                    <OrderIssuesForm 
                      onResolveErrors={(ids) => {
                        setMessages(prev => [...prev, { role: 'user', type: 'text', content: `Run data cleansing and resend on: ${ids.join(', ')}` }]);
                        setIsTyping(true);
                        setTimeout(() => {
                          setIsTyping(false);
                          setMessages(prev => [...prev, { role: 'agent', type: 'text', content: `✅ Data cleansing completed. Successfully resent ${ids.length} orders to the processing queue.` }]);
                        }, 1500);
                      }}
                      onNotifyScm={(ids) => {
                        setMessages(prev => [...prev, { role: 'user', type: 'text', content: `Notify SCM Manager regarding delayed pickings: ${ids.join(', ')}` }]);
                        setIsTyping(true);
                        setTimeout(() => {
                          setIsTyping(false);
                          setMessages(prev => [...prev, { role: 'agent', type: 'text', content: `✅ SCM Manager has been notified with high priority regarding the ${ids.length} delayed shipments.` }]);
                        }, 1200);
                      }}
                    />
                  )}

                  {/* Rollout Setup Form */}
                  {msg.type === 'form' && msg.formType === 'rollout_setup' && (
                    <RolloutSetupForm 
                      initialData={msg.actionDetails}
                      onSubmit={(config) => {
                        const deployMsg = config.labels?.deployMsg?.replace('{0}', config.region).replace('{1}', config.currency).replace('{2}', config.language) || `Deploy storefront for ${config.region} with currency ${config.currency} and language ${config.language}.`;
                        setMessages(prev => [...prev, { role: 'user', type: 'text', content: deployMsg }]);
                        setIsTyping(true);
                        setTimeout(() => {
                          setIsTyping(false);
                          setMessages(prev => [...prev, {
                            role: 'agent',
                            type: 'action',
                            content: config.labels?.compiledMsg || `I have compiled the build configurations and provisioned the database for the new region. Please approve to launch.`,
                            actionDetails: { type: 'ROLLOUT_SUCCESS', ...config }
                          }]);
                        }, 2000);
                      }}
                    />
                  )}

                  {/* Action Card Implementation */}
                  {msg.type === 'action' && msg.actionDetails?.type === 'DATA_VISUALIZATION_OLED' && (
                    <div className="action-card" style={{ background: '#f8f9fa', border: '1px solid #dee2e6' }}>
                      <div className="action-card-title" style={{ fontSize: '0.9rem', color: '#495057', display: 'flex', alignItems: 'center', gap: '8px' }}>
                         📊 <span>7-Day Funnel Analysis (OLED65G4)</span>
                      </div>
                      <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: '#fff', borderRadius: '4px', borderLeft: '3px solid #ced4da' }}>
                          <span style={{color: '#6c757d', fontWeight: 600}}>Unique Views</span>
                          <span style={{fontWeight: 'bold', color: '#212529'}}>45,200</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: '#fff', borderRadius: '4px', borderLeft: '3px solid var(--lg-red)' }}>
                          <span style={{color: '#6c757d', fontWeight: 600}}>Cart Additions</span>
                          <span style={{fontWeight: 'bold', color: '#212529'}}>3,100 <span style={{fontSize:'0.8rem', color:'var(--lg-red)'}}>(-12%)</span></span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: '#fff', borderRadius: '4px', borderLeft: '3px solid #dc3545' }}>
                          <span style={{color: '#6c757d', fontWeight: 600}}>Completed Orders</span>
                          <span style={{fontWeight: 'bold', color: '#dc3545'}}>540 <span style={{fontSize:'0.8rem'}}> (1.19% CVR)</span></span>
                        </div>
                      </div>

                      {/* Hooking KPIs instead of Graph */}
                      <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                        <div style={{ flex: 1, padding: '16px 12px', background: '#fff', border: '1px solid #ced4da', borderRadius: '8px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                          <div style={{ color: '#6c757d', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Missed Revenue</div>
                          <div style={{ color: 'var(--lg-red)', fontSize: '1.3rem', fontWeight: 900, margin: '8px 0 4px', fontFamily: 'var(--font-headline)' }}>$1,240,000</div>
                          <div style={{ color: '#adb5bd', fontSize: '0.7rem' }}>Estimated from 45.2K views</div>
                        </div>
                        <div style={{ flex: 1, padding: '16px 12px', background: 'var(--lg-black)', border: '1px solid var(--lg-black)', borderRadius: '8px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                          <div style={{ color: '#adb5bd', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Expected Lift</div>
                          <div style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 900, margin: '8px 0 4px', fontFamily: 'var(--font-headline)' }}>+ $850,000</div>
                          <div style={{ color: '#adb5bd', fontSize: '0.7rem' }}>with Targeted 15% Coupon</div>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* Ask Preview Card */}
                  {msg.type === 'action' && msg.actionDetails?.type === 'ASK_PREVIEW' && (
                    <div className="action-card" style={{ background: '#e0f2fe', border: '1px solid #bae6fd', marginTop: '8px' }}>
                      <p style={{ fontSize: '0.85rem', color: '#0369a1', marginBottom: '12px', fontWeight: 600 }}>
                        Would you like to open the Store Preview to verify these changes live?
                      </p>
                      <button 
                        className="btn" 
                        style={{ width: '100%', background: '#0284c7', color: 'white', padding: '10px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        onClick={() => { navigate('/preview?locale=' + encodeURIComponent((msg.actionDetails.language || 'au').substring(0, 2).toLowerCase())); }}
                      >
                        <span style={{ fontSize: '1.2rem' }}>👀</span> Open Live Preview
                      </button>
                    </div>
                  )}

                  {msg.type === 'action' && msg.actionDetails?.type === 'PROACTIVE_TV_COUPON' && (
                    <div className="action-card">
                      <div className="action-row">
                        <button className="action-btn reject" onClick={() => {
                          setMessages(prev => prev.filter(m => m !== msg));
                          setMessages(prev => [...prev, { role: 'agent', type: 'text', content: 'Understood. I will continue monitoring.'}]);
                        }}>Dismiss</button>
                        <button className="action-btn approve" onClick={() => {
                          setMessages(prev => prev.filter(m => m !== msg));
                          setMessages(prev => [
                            ...prev, 
                            { role: 'user', type: 'text', content: 'Yes, draft a 15% off coupon for OLED TVs.' },
                            { role: 'agent', type: 'text', content: 'Certainly. I have pre-filled the promotion schema for you.' },
                            { role: 'agent', type: 'form', formType: 'promotion' }
                          ]);
                        }}>Yes, Create Coupon</button>
                      </div>
                    </div>
                  )}

                  {msg.type === 'action' && msg.actionDetails?.type === 'PROMOTION' && (
                    <div className="action-card">
                      <div className="action-card-title">✨ Promotion Draft</div>
                      <div className="action-card-details">
                        <p><strong>Discount:</strong> {msg.actionDetails.discountType === 'FIXED' ? '$' : ''}{msg.actionDetails.rate}{msg.actionDetails.discountType === 'PERCENT' ? '%' : ''} OFF</p>
                        <p><strong>Target:</strong> {msg.actionDetails.target} {msg.actionDetails.sku ? `(${msg.actionDetails.sku})` : ''}</p>
                        <p><strong>Audience:</strong> {msg.actionDetails.audience}</p>
                        <p><strong>Period:</strong> {msg.actionDetails.startDate || 'Now'} ~ {msg.actionDetails.endDate || 'No Expiry'}</p>
                      </div>
                      <div className="action-row">
                        <button className="action-btn reject" onClick={() => {
                          setMessages(prev => [...prev, { role: 'agent', type: 'text', content: 'Action cancelled. Let me know if you need anything else.'}]);
                        }}>Reject</button>
                        <button className="action-btn secondary" style={{ background: '#475569', color: 'white', border: 'none' }} onClick={async () => {
                          let categoryId = '';
                          try {
                            const res = await fetch('http://localhost:8080/api/v1/catalog/categories');
                            if (res.ok) {
                              const catTree = await res.json();
                              const categories: any[] = [];
                              const flatten = (arr: any[]) => {
                                arr.forEach(c => {
                                  categories.push(c);
                                  if (c.children) flatten(c.children);
                                });
                              };
                              flatten(catTree);
                              
                              const targetName = msg.actionDetails.target.replace(/^All\s+/i, '').toLowerCase();
                              if (targetName !== 'products') {
                                const matched = categories.find(c => c.name.toLowerCase().includes(targetName) || targetName.includes(c.name.toLowerCase()));
                                if (matched) categoryId = matched.categoryId;
                              }
                            }
                          } catch (err) {
                            console.error('Failed to fetch categories:', err);
                          }

                          // Fallback to hardcoded only if fetching completely fails and it's not 'All Products'
                          if (!categoryId && msg.actionDetails.target !== 'All Products') {
                            if (msg.actionDetails.target === 'All TV') categoryId = '112';
                            else if (msg.actionDetails.target === 'All Soundbar') categoryId = '110';
                            else if (msg.actionDetails.target === 'All Refrigerator') categoryId = '76';
                          }

                          localStorage.setItem('pending-ai-promo', JSON.stringify({
                            type: 'PROMOTION',
                            promotion: {
                              id: 'PREVIEW-DRAFT',
                              name: "AI Preview Coupon",
                              type: 'COUPON',
                              targetScope: msg.actionDetails.target,
                              discountValue: msg.actionDetails.rate,
                              discountType: msg.actionDetails.discountType || 'PERCENT',
                              targetSku: msg.actionDetails.sku || null
                            }
                          }));
                          
                          navigate(`/preview${categoryId ? '?categoryId=' + categoryId : ''}`);

                          let affectedCount = 1;
                          if (msg.actionDetails.target === 'Specific SKU') {
                            affectedCount = 1;
                          } else {
                            try {
                              const url = categoryId 
                                ? `http://localhost:8080/api/v1/catalog/products?categoryId=${categoryId}&size=1`
                                : `http://localhost:8080/api/v1/catalog/products?size=1`;
                              const res = await fetch(url);
                              if (res.ok) {
                                const data = await res.json();
                                affectedCount = data.totalElements || 1;
                              }
                            } catch (err) {
                              console.error('Failed to fetch count from DB:', err);
                              // Fallback
                              if (msg.actionDetails.target === 'All Products') affectedCount = 1450;
                              else if (msg.actionDetails.target === 'All TV') affectedCount = 38;
                              else if (msg.actionDetails.target === 'All Soundbar') affectedCount = 12;
                              else if (msg.actionDetails.target === 'All Refrigerator') affectedCount = 45;
                            }
                          }

                          setMessages(prev => [...prev, 
                            { role: 'agent', type: 'text', content: `I have applied the draft promotion to the Live Store Preview. It is expected to affect ${affectedCount.toLocaleString()} products. If you are satisfied with how it looks, you can proceed to deploy.` },
                            { role: 'agent', type: 'action', actionDetails: { ...msg.actionDetails, type: 'PROMOTION_DEPLOY', affectedCount, categoryId } }
                          ]);
                        }}>👀 Live Preview</button>
                      </div>
                    </div>
                  )}

                  {msg.type === 'action' && msg.actionDetails?.type === 'PROMOTION_DEPLOY' && (
                    <div className="action-card" style={{ background: '#f8fafc', border: '1px solid #cbd5e1' }}>
                      <p style={{ fontSize: '0.85rem', marginBottom: '10px', color: '#334155' }}>Ready to launch this promotion to the live store?</p>
                      
                      <div style={{ marginBottom: '12px' }}>
                        <PromotionDetailsButton target={msg.actionDetails.target} count={msg.actionDetails.affectedCount || 1} sku={msg.actionDetails.sku} categoryId={msg.actionDetails.categoryId} />
                      </div>

                      <div className="action-row">
                        <button className="action-btn reject" onClick={() => {
                          setMessages(prev => [...prev, { role: 'agent', type: 'text', content: 'Deployment cancelled.'}]);
                        }}>Cancel</button>
                        <button className="action-btn approve" style={{ background: 'var(--lg-red)', color: 'white', border: 'none' }} onClick={() => handleApproveAction(msg.actionDetails)}>🚀 Publish to Live</button>
                      </div>
                    </div>
                  )}

                  {/* Promotion Success Card */}
                  {msg.type === 'action' && msg.actionDetails?.type === 'PROMOTION_SUCCESS' && (
                    <div className="action-card" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', marginTop: '8px' }}>
                      <div className="action-card-title" style={{ color: '#166534', fontSize: '0.9rem' }}>✅ Deployment Successful</div>
                      <p style={{ fontSize: '0.85rem', marginBottom: '12px', color: '#14532d' }}>
                        Promotion <strong>[{msg.actionDetails.promotionId}]</strong> applied to {msg.actionDetails.affectedCount.toLocaleString()} item(s) in {msg.actionDetails.target}.
                      </p>
                      <PromotionDetailsButton target={msg.actionDetails.target} count={msg.actionDetails.affectedCount} sku={msg.actionDetails.sku} />
                    </div>
                  )}

                  {/* Rollout Success Card */}
                  {msg.type === 'action' && msg.actionDetails?.type === 'ROLLOUT_SUCCESS' && (
                    <div className="action-card" style={{ borderLeft: '4px solid var(--accent)' }}>
                      <div className="action-card-title">{msg.actionDetails.labels?.cardTitle || '🌍 Site Launch Ready'}</div>
                      <div className="action-card-details">
                        <p><strong>{msg.actionDetails.labels?.region || 'Region'}:</strong> {msg.actionDetails.region}</p>
                        <p><strong>{msg.actionDetails.labels?.currency || 'Currency'}:</strong> {msg.actionDetails.currency}</p>
                        <p><strong>{msg.actionDetails.labels?.language || 'Language'}:</strong> {msg.actionDetails.language}</p>
                        <p><strong>{msg.actionDetails.labels?.catalog || 'Catalog'}:</strong> {msg.actionDetails.catalog}</p>
                      </div>
                      <div className="action-row">
                        <button className="action-btn reject" onClick={() => {
                          setMessages(prev => [...prev, { role: 'agent', type: 'text', content: msg.actionDetails.labels?.abort || 'Abort' }]);
                        }}>{msg.actionDetails.labels?.abort || 'Abort'}</button>
                        <button className="action-btn approve" style={{ background: 'var(--accent)' }} onClick={() => {
                          const config = msg.actionDetails;
                          
                          // 1. Add progress message placeholder
                          const progressMsgIdx = messages.length + 1; // Since we are adding "Deploying..." text first
                          const startDeployMsg = config.labels?.startDeploy?.replace('{0}', config.region) || `Start deployment for ${config.region}.`;
                          const initMsg = config.labels?.initPipeline || 'Initializing pipeline...';
                          const pTitle = config.labels?.progressTitle || '⚙️ Deployment Progress';
                          setMessages(prev => [...prev, 
                            { role: 'user', type: 'text', content: startDeployMsg },
                            { role: 'agent', type: 'progress', progressTitle: pTitle, progressList: [initMsg] }
                          ]);

                          // 2. Open SSE stream
                          const currentAdminId = localStorage.getItem('adminId') || 'SYSTEM';
                          const userLang = config.userLang || 'en';
                          const url = `/api/agent/rollout/execute?region=${encodeURIComponent(config.region)}&websiteId=${encodeURIComponent(config.websiteId)}&language=${encodeURIComponent(config.language)}&currency=${encodeURIComponent(config.currency)}&userLang=${encodeURIComponent(userLang)}&userId=${encodeURIComponent(currentAdminId)}`;
                          const eventSource = new EventSource(url);

                          eventSource.addEventListener('progress', (e) => {
                             setMessages(prev => {
                               const next = [...prev];
                               const lastIdx = next.length - 1;
                               const pMsg = next[lastIdx];
                               if (pMsg && pMsg.type === 'progress') {
                                 next[lastIdx] = {
                                   ...pMsg,
                                   progressList: [...(pMsg.progressList || []), e.data]
                                 };
                               }
                               return next;
                             });
                          });

                          eventSource.addEventListener('complete', (e) => {
                             eventSource.close();
                             triggerConfetti();
                             let finalLanguage = config.language || config.region;
                             try {
                               if (e.data) {
                                 const payload = JSON.parse(e.data);
                                 if (payload.finalLanguage) {
                                   finalLanguage = payload.finalLanguage;
                                 }
                               }
                             } catch (err) {}
                             showCenterSuccessToast(`🎉 ${config.region} Rollout Successfully Completed!`);
                             const successMsg = config.labels?.successMsg?.replace('{0}', config.region) || `🚀 Deployment initiated! The **${config.region}** storefront is now LIVE at `;
                             setMessages(prev => [...prev, 
                               { role: 'agent', type: 'text', content: `${successMsg}lg.com/${finalLanguage.toLowerCase()}` },
                               { role: 'agent', type: 'action', actionDetails: { type: 'ASK_PREVIEW', language: finalLanguage } }
                             ]);
                          });

                          eventSource.addEventListener('error', (e) => {
                             eventSource.close();
                             setMessages(prev => [...prev, { role: 'agent', type: 'text', content: msg.actionDetails.labels?.failMsg || `❌ Deployment failed.` }]);
                          });
                        }}>{msg.actionDetails.labels?.launch || 'Launch Site'}</button>
                      </div>
                    </div>
                  )}

                  {/* Stop Promotion Card */}
                  {msg.type === 'action' && msg.actionDetails?.type === 'STOP_PROMOTION' && (
                    <div className="action-card">
                       <span style={{color: 'var(--lg-red)', fontWeight: 'bold'}}>
                         🛑 {(msg.actionDetails.schedule || 'Immediate').toLowerCase().includes('immediate') ? `Stopped Promotion ID: ${msg.actionDetails.promotionId.replace(/\[|\]/g, '')}` : `Scheduled Stop: [${msg.actionDetails.promotionId.replace(/\[|\]/g, '')}] on ${msg.actionDetails.schedule}`}
                       </span>
                    </div>
                  )}

                  {/* PTO Bundle Action Card */}
                  {msg.type === 'action' && msg.actionDetails?.type === 'PTO_CREATE' && (
                    <div className="action-card" style={{ borderLeft: '4px solid var(--lg-red)', background: '#fff4f4' }}>
                      <div className="action-card-title">📦 PTO Bundle Draft</div>
                      <div className="action-card-details">
                        {msg.actionDetails.images && msg.actionDetails.images.length > 0 && (
                          <div style={{ position: 'relative', height: '140px', background: '#fff', borderRadius: '4px', border: '1px solid #ddd', marginBottom: '12px', overflow: 'hidden' }}>
                             {msg.actionDetails.images.map((img: string, idx: number) => (
                               <img 
                                 key={idx} 
                                 src={img} 
                                 alt="Bundle Preview" 
                                 style={{
                                    position: 'absolute',
                                    width: '55%',
                                    height: '100%',
                                    objectFit: 'contain',
                                    top: '0',
                                    left: idx === 0 ? '0%' : 'auto',
                                    right: idx === 1 ? '0%' : 'auto',
                                    zIndex: 10 - idx,
                                    mixBlendMode: 'multiply',
                                    WebkitMaskImage: idx === 0 
                                      ? 'linear-gradient(to right, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%)'
                                      : (idx === 1 ? 'linear-gradient(to left, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%)' : 'none'),
                                    maskImage: idx === 0 
                                      ? 'linear-gradient(to right, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%)'
                                      : (idx === 1 ? 'linear-gradient(to left, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%)' : 'none')
                                 }}
                               />
                             ))}
                             {msg.actionDetails.images.length > 1 && (
                               <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%, -50%)', zIndex: 12, background:'var(--lg-red)', color:'white', width:'24px', height:'24px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'bold', fontSize:'0.9rem', boxShadow:'0 1px 3px rgba(0,0,0,0.3)' }}>+</div>
                             )}
                             <span className="badge" style={{ position: 'absolute', top: '8px', left: '8px', background: 'var(--lg-red)', color:'white', fontSize: '0.65rem', padding: '2px 6px', transform: 'none', border:'1px solid white', zIndex: 20 }}>BUNDLE DEAL</span>
                          </div>
                        )}
                        <p><strong>Name:</strong> {msg.actionDetails.bundleName}</p>
                        <p><strong>Price:</strong> ${msg.actionDetails.price.toLocaleString()}</p>
                        <p><strong>Category:</strong> {msg.actionDetails.category}</p>
                        <p><strong>Includes:</strong> {msg.actionDetails.skus?.join(' + ')}</p>
                      </div>
                      <div className="action-row">
                        <button className="action-btn reject" onClick={() => {
                          setMessages(prev => [...prev, { role: 'agent', type: 'text', content: 'PTO Creation cancelled.'}]);
                        }}>Reject</button>
                        <button className="action-btn approve" style={{ background: 'var(--lg-red)' }} onClick={async () => {
                          try {
                            const res = await fetch('/api/products/pto', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ 
                                name: msg.actionDetails.bundleName, 
                                bundlePrice: msg.actionDetails.price, 
                                bundleCategory: msg.actionDetails.category, 
                                bundleSkus: msg.actionDetails.skus?.join(','), 
                                bundleImages: msg.actionDetails.images?.join(','),
                                startDate: msg.actionDetails.startDate,
                                endDate: msg.actionDetails.endDate
                              })
                            });
                            const newPto = await res.json();
                            dispatchAiAction({...msg.actionDetails, id: newPto.id});
                            setMessages(prev => [...prev, 
                              { role: 'agent', type: 'text', content: `Successfully deployed PTO Bundle: ${msg.actionDetails.bundleName} to the catalog in preview mode.` },
                              { role: 'agent', type: 'action', actionDetails: { type: 'ASK_PUBLISH_LIVE', id: newPto.id, name: msg.actionDetails.bundleName } }
                            ]);
                          } catch (err) {
                            console.error("PTO Creation error:", err);
                          }
                        }}>Approve & Save Preview</button>
                      </div>
                    </div>
                  )}

                  {/* Publish Live Card */}
                  {msg.actionDetails.type === 'ASK_PUBLISH_LIVE' && (
                    <div className="action-card" style={{ background: '#fff9f9', borderLeft: '4px solid var(--lg-red)' }}>
                      <div className="action-card-title">🚀 Preview looks good?</div>
                      <div className="action-card-content">
                        <p>The bundle <strong>{msg.actionDetails.name}</strong> is now visible in the preview storefront. If everything looks correct, you can publish it live.</p>
                      </div>
                      <div className="action-row">
                        <button className="action-btn approve" style={{ background: 'var(--lg-red)' }} onClick={async () => {
                          try {
                            const res = await fetch(`/api/products/pto/${msg.actionDetails.id}/live`, {
                              method: 'PUT'
                            });
                            if (res.ok) {
                              setMessages(prev => [...prev, 
                                { role: 'agent', type: 'text', content: `PTO Bundle: ${msg.actionDetails.name} is now LIVE!` }
                              ]);
                            } else {
                              console.error("Failed to publish live");
                            }
                          } catch (err) {
                            console.error("PTO Publish error:", err);
                          }
                        }}>Publish Live</button>
                      </div>
                    </div>
                  )}

                  {/* List Promotions Card */}
                  {msg.type === 'list_promotions' && (
                    <div className="action-card" style={{ background: 'var(--lg-body-bg)' }}>
                      <div className="action-card-title">📝 Active Promotions ({activePromotions.length})</div>
                      {activePromotions.length === 0 ? <p style={{fontSize:'0.85rem'}}>No active promotions.</p> : (
                        <ul style={{fontSize:'0.85rem', paddingLeft:'20px'}}>
                          {activePromotions.map(p => (
                            <li key={p.id}>
                              <strong>[{p.id}]</strong> {p.discountType==='FIXED'?'$':''}{p.rate}{p.discountType==='PERCENT'?'%':''} off {p.target} {p.sku ? `(${p.sku})` : ''} - For: {p.audience} ({p.startDate} ~ {p.endDate})
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="chat-bubble agent typing-indicator">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          </div>

          <div className="ai-input-area">
            {activeAgent?.suggestions && (
              <div className="ai-suggestions-container">
                {activeAgent.suggestions.map((sug: string, idx: number) => (
                  <button 
                    key={idx} 
                    className="ai-suggestion-chip" 
                    onClick={() => submitMessage(sug)}
                  >
                    {sug}
                  </button>
                ))}
              </div>
            )}
            <form className="ai-input-wrap" onSubmit={handleSendMessage}>
              <input 
                type="text" 
                placeholder="Message your agent..." 
                value={inputText}
                onChange={e => setInputText(e.target.value)}
              />
              <button type="submit">↑</button>
            </form>
          </div>
        </>
      )}
    </div>
    {!isOpen && (
      <button 
        className="ai-toggle-btn"
        onMouseDown={(e) => {
          setIsDragging(true);
          dragRef.current = { startX: e.clientX, startY: e.clientY, btnX: btnPos.x, btnY: btnPos.y, moved: false };
        }}
        onClick={(e) => {
          if (dragRef.current.moved) return;
          setIsOpen(true);
        }}
        title="Expand Agent"
        style={{ left: `${btnPos.x}px`, top: `${btnPos.y}px`, cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <span style={{ fontSize: '1.4rem' }}>✨</span>
      </button>
    )}
    </>
  );
}

// Sub-component for the interactive form
function PromotionForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [discountType, setDiscountType] = useState('PERCENT');
  const [rate, setRate] = useState(15);
  const [target, setTarget] = useState('All Products');
  const [sku, setSku] = useState('');
  const [audiences, setAudiences] = useState<string[]>(['All']);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 86400000*30).toISOString().split('T')[0]);

  const handleAudienceChange = (aud: string) => {
    if (aud === 'All') {
      setAudiences(['All']);
    } else {
      setAudiences(prev => {
        const next = prev.filter(x => x !== 'All');
        if (next.includes(aud)) {
           const removed = next.filter(x => x !== aud);
           return removed.length === 0 ? ['All'] : removed;
        } else {
           return [...next, aud];
        }
      });
    }
  };

  return (
    <div className="chat-form">
      <div style={{ display: 'flex', gap: '8px' }}>
        <div style={{ flex: 1 }}>
          <label>Type</label>
          <select className="chat-input" value={discountType} onChange={e => setDiscountType(e.target.value)}>
            <option value="PERCENT">% Percent</option>
            <option value="FIXED">$ Amount</option>
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label>Value</label>
          <input type="number" className="chat-input" value={rate} onChange={e => setRate(Number(e.target.value))} />
        </div>
      </div>
      <div>
        <label>Target Scope</label>
        <select className="chat-input" value={target} onChange={e => setTarget(e.target.value)}>
          <option value="All Products">All Products</option>
          <option value="All TV">All TV</option>
          <option value="All Soundbar">All Soundbar</option>
          <option value="All Refrigerator">All Refrigerator</option>
          <option value="Specific SKU">Specific SKU</option>
        </select>
      </div>
      {target === 'Specific SKU' && (
        <div>
          <label>SKU Code</label>
          <input type="text" className="chat-input" placeholder="e.g. OLED65G4" value={sku} onChange={e => setSku(e.target.value)} />
        </div>
      )}
      <div>
        <label>Target Audience</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px', marginBottom: '8px' }}>
          {['All', 'Guest', 'D2C', 'D2B2C', 'D2E'].map(aud => (
             <label key={aud} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
                <input type="checkbox" checked={audiences.includes(aud)} onChange={() => handleAudienceChange(aud)} /> {aud}
             </label>
          ))}
        </div>
      </div>
      <div>
        <label>Start Date</label>
        <input type="date" className="chat-input" value={startDate} onChange={e => setStartDate(e.target.value)} />
      </div>
      <div style={{ marginTop: '8px' }}>
        <label>End Date</label>
        <input type="date" className="chat-input" value={endDate} onChange={e => setEndDate(e.target.value)} />
      </div>
      <button 
        className="btn btn-primary" 
        style={{ padding: '8px', fontSize: '0.85rem', width: '100%', marginTop: '12px' }}
        onClick={(e) => { e.preventDefault(); onSubmit({ discountType, rate, target, sku, audience: audiences.join(', '), startDate, endDate }); }}
      >
        Set Parameters
      </button>
    </div>
  );
}

// Stop Promotion Interactive Form
function StopPromotionForm({ activePromotions, onSubmit }: { activePromotions: any[], onSubmit: (id: string, schedule: string, date: string) => void }) {
  const [selectedId, setSelectedId] = useState('');
  const [scheduleType, setScheduleType] = useState('Immediate');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  if (activePromotions.length === 0) {
    return <div className="chat-form"><p style={{fontSize:'0.85rem'}}>No active promotions to stop.</p></div>;
  }

  return (
    <div className="chat-form">
       <label>Select Promotion to Terminate:</label>
       <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px', marginTop: '4px' }}>
         {activePromotions.map(p => (
            <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
               <input type="radio" name="promo_stop" value={p.id} checked={selectedId === p.id} onChange={() => setSelectedId(p.id)} />
               <strong>[{p.id}]</strong> {p.target} ({p.discountType === 'PERCENT' ? p.rate+'%' : '$'+p.rate} OFF)
            </label>
         ))}
       </div>

       {selectedId && (
         <div style={{ animation: 'highlightFlash 0.5s ease-out' }}>
           <label>Termination Schedule:</label>
           <div style={{ display: 'flex', gap: '12px', marginTop: '4px', marginBottom: '8px' }}>
              <label style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                 <input type="radio" checked={scheduleType === 'Immediate'} onChange={() => setScheduleType('Immediate')} /> Immediate
              </label>
              <label style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                 <input type="radio" checked={scheduleType === 'Scheduled'} onChange={() => setScheduleType('Scheduled')} /> Future Date
              </label>
           </div>
           
           {scheduleType === 'Scheduled' && (
             <div style={{ marginBottom: '12px' }}>
               <label>Select Date:</label>
               <input type="date" className="chat-input" value={date} onChange={e => setDate(e.target.value)} />
             </div>
           )}

           <button 
              className="btn btn-primary" 
              style={{ background: 'var(--lg-red)', padding: '8px', fontSize: '0.85rem', width: '100%', marginTop: '4px', color:'white', border:'none', borderRadius:'4px', cursor:'pointer' }}
              onClick={(e) => { e.preventDefault(); onSubmit(selectedId, scheduleType, date); }}
            >
              Confirm Termination
           </button>
         </div>
       )}
    </div>
  );
}

// PTO Creation Interactive Form
function PtoCreationForm({ onSubmit }: { onSubmit: (name: string, price: number, skus: string[], category: string, images: string[], startDate: string, endDate: string) => void }) {
  const [selectedSkus, setSelectedSkus] = useState<string[]>([]);
  const [individualPrices, setIndividualPrices] = useState<Record<string, number>>({});
  const [bundleName, setBundleName] = useState('');
  
  // Date states
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().split('T')[0];
  });
  
  const FULL_CATALOG: Record<string, {sku: string, name: string, defaultPrice: number, imageUrl: string}[]> = {
    'TV / Audio': [
      { sku: 'OLED65G4', name: 'LG OLED evo G4 65" 4K Smart TV', defaultPrice: 2999, imageUrl: 'https://www.lg.com/content/dam/channel/wcms/au/tvs/oled65c3psa/gallery/DZ-01.jpg' },
      { sku: 'OLED83C4', name: 'LG OLED evo C4 83" 4K Smart TV', defaultPrice: 5499, imageUrl: 'https://www.lg.com/content/dam/channel/wcms/au/tvs/oled65c3psa/gallery/DZ-01.jpg' },
      { sku: 'S95TR', name: 'LG 9.1.5 ch High Res Audio Soundbar', defaultPrice: 1499, imageUrl: 'https://www.lg.com/content/dam/channel/wcms/au/audio/sp11ra/gallery/DZ_01.jpg' }
    ],
    'Kitchen Appliances': [
      { sku: 'LRYKC2606S', name: 'LG InstaView Refrigerator', defaultPrice: 3499, imageUrl: 'https://www.lg.com/content/dam/channel/wcms/au/refrigerators/gs-v6010pl/gallery/medium01.jpg' },
      { sku: 'LSEL6337F', name: 'InstaView Electric Smart Range', defaultPrice: 2099, imageUrl: 'https://www.lg.com/content/dam/channel/wcms/au/refrigerators/gs-v6010pl/gallery/medium01.jpg' }
    ],
    'Laundry': [
      { sku: 'WM4000HBA', name: 'LG Front Load Washer', defaultPrice: 1199, imageUrl: 'https://www.lg.com/content/dam/channel/wcms/au/washing-machines/wv9-1412w/gallery/medium01.jpg' },
      { sku: 'WKE9900', name: 'LG WashTower Center', defaultPrice: 2299, imageUrl: 'https://www.lg.com/content/dam/channel/wcms/au/washing-machines/wv9-1412w/gallery/medium01.jpg' }
    ],
    'IT / Computing': [
      { sku: '17Z90S-G.AA75K', name: 'LG gram 17" Laptop', defaultPrice: 1799, imageUrl: 'https://www.lg.com/content/dam/channel/wcms/au/monitors/17z90r-k-aa78a1/gallery/medium01.jpg' }
    ]
  };

  const [currentPageProducts, setCurrentPageProducts] = useState<{sku: string, name: string, defaultPrice: number, imageUrl: string}[]>([]);
  const [retainedProducts, setRetainedProducts] = useState<Record<string, {sku: string, name: string, defaultPrice: number, imageUrl: string}>>({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Request products from the preview iframe
    const requestProducts = () => {
      const iframe = document.getElementById('store-preview-iframe') as HTMLIFrameElement;
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({ type: 'REQUEST_PRODUCTS' }, '*');
      }
    };

    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'storefront-products-loaded') {
        if (e.data.products) {
          const mapped = e.data.products.map((p: any) => ({
             sku: p.sku,
             name: p.name,
             defaultPrice: p.price || p.defaultPrice,
             imageUrl: p.imageUrl
          }));
          // Deduplicate
          const unique: typeof mapped = [];
          const seen = new Set();
          for (const p of mapped) {
             if (!seen.has(p.sku)) {
                unique.push(p);
                seen.add(p.sku);
             }
          }
          setCurrentPageProducts(unique);
        } else {
          // Storefront just loaded new products, let's request them
          requestProducts();
        }
      }
    };
    window.addEventListener('message', handleMessage);

    // Initial request
    setTimeout(requestProducts, 500);

    // Whenever iframe loads (or reloads), request again
    const iframe = document.getElementById('store-preview-iframe');
    if (iframe) {
      iframe.addEventListener('load', requestProducts);
    }

    return () => {
      window.removeEventListener('message', handleMessage);
      if (iframe) iframe.removeEventListener('load', requestProducts);
    };
  }, []);

  const getFlatCatalog = () => {
     // merge FULL_CATALOG, currentPageProducts, and retainedProducts for pricing lookup
     return [...Object.values(FULL_CATALOG).flat(), ...currentPageProducts, ...Object.values(retainedProducts)];
  };

  const [activeTab, setActiveTab] = useState<'current' | 'browse'>('current');
  const [browseCategory, setBrowseCategory] = useState<string>('TV / Audio');
  const [bundleCategory, setBundleCategory] = useState('TV / Audio');

  const handleToggle = (sku: string) => {
    setSelectedSkus(prev => {
      const isSelected = prev.includes(sku);
      if (isSelected) {
        const next = prev.filter(s => s !== sku);
        setIndividualPrices(p => {
           const copy = { ...p };
           delete copy[sku];
           return copy;
        });
        setRetainedProducts(prevRetained => {
           const copy = { ...prevRetained };
           delete copy[sku];
           return copy;
        });
        return next;
      } else {
        const fullProd = getFlatCatalog().find(c => c.sku === sku);
        if (fullProd) {
           setRetainedProducts(prevRetained => ({ ...prevRetained, [sku]: fullProd }));
        }
        const defaultP = fullProd?.defaultPrice || 0;
        setIndividualPrices(p => ({ ...p, [sku]: defaultP }));
        return [...prev, sku];
      }
    });
  };

  const handleClearAll = () => {
    setSelectedSkus([]);
    setIndividualPrices({});
    setRetainedProducts({});
    setBundleName('');
  };

  const handlePriceChange = (sku: string, price: number) => {
    setIndividualPrices(p => ({ ...p, [sku]: price }));
  };

  const calculateSuggestedBundleName = () => {
    setBundleName(`Premium Smart Set: ${selectedSkus.length} Items`);
  };

  const [discountType, setDiscountType] = useState('PERCENT');
  const [discountValue, setDiscountValue] = useState<number | ''>('');

  const bulkDiscountPrices = () => {
    if (!discountValue) return;
    const newPrices = { ...individualPrices };
    selectedSkus.forEach(sku => {
      const defaultP = getFlatCatalog().find(c => c.sku === sku)?.defaultPrice || 0;
      if (discountType === 'PERCENT') {
        newPrices[sku] = Math.max(0, Math.round(defaultP * (1 - Number(discountValue) / 100)));
      } else {
        newPrices[sku] = Math.max(0, defaultP - Number(discountValue));
      }
    });
    setIndividualPrices(newPrices);
    calculateSuggestedBundleName();
  };

  const currentTotal = selectedSkus.reduce((sum, sku) => sum + (individualPrices[sku] || 0), 0);
  const displayedCatalog = activeTab === 'current' ? currentPageProducts : FULL_CATALOG[browseCategory];

  return (
    <div className="chat-form" style={{ borderLeft: '3px solid var(--lg-red)', background: '#fff4f4' }}>
      <p style={{ margin: '0 0 10px 0', fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--lg-red)' }}>Pick To Order Builder</p>
      
      <label>1. Select Base Products:</label>
      
      {/* Category Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', marginTop: '4px', alignItems: 'center' }}>
         <button 
           type="button" 
           onClick={() => setActiveTab('current')} 
           style={{ flex: 1, fontSize: '0.7rem', padding: '6px', borderRadius: '4px', border: '1px solid #ccc', background: activeTab === 'current' ? 'var(--lg-red)' : '#fff', color: activeTab === 'current' ? '#fff' : '#333' }}
         >
           Current Page ({currentPageProducts.length})
         </button>
         <button 
           type="button" 
           onClick={() => setActiveTab('browse')} 
           style={{ flex: 1, fontSize: '0.7rem', padding: '6px', borderRadius: '4px', border: '1px solid #ccc', background: activeTab === 'browse' ? 'var(--lg-red)' : '#fff', color: activeTab === 'browse' ? '#fff' : '#333' }}
         >
           Browse Full Catalog
         </button>
         <button 
           type="button" 
           onClick={handleClearAll}
           style={{ fontSize: '0.7rem', padding: '6px', borderRadius: '4px', border: '1px solid #dc3545', background: '#fff', color: '#dc3545', cursor: 'pointer', fontWeight: 'bold' }}
           title="Clear all selected products"
         >
           Clear All
         </button>
      </div>

      {activeTab === 'browse' && (
         <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
           <select 
              className="chat-input" 
              style={{ flex: 1, padding: '4px', fontSize: '0.8rem' }}
              value={browseCategory} 
              onChange={(e) => setBrowseCategory(e.target.value)}
           >
              {Object.keys(FULL_CATALOG).map(cat => (
                 <option key={cat} value={cat}>{cat}</option>
              ))}
           </select>
           <input 
              type="text" 
              className="chat-input" 
              style={{ flex: 1, padding: '4px', fontSize: '0.8rem' }}
              placeholder="Search SKUs..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
           />
         </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px', background: '#fff', border: '1px solid #ddd', padding: '8px', borderRadius: '4px', maxHeight: '150px', overflowY: 'auto' }}>
        {displayedCatalog.length === 0 ? (
           <p style={{ fontSize: '0.8rem', color: '#888', margin: 0 }}>No products found.</p>
        ) : (
           displayedCatalog.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.sku.toLowerCase().includes(searchTerm.toLowerCase())).map(c => (
             <label key={c.sku} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem', padding: '6px', borderBottom: '1px solid #f0f0f0', cursor: 'pointer', transition: 'background 0.2s', background: selectedSkus.includes(c.sku) ? '#fde8e8' : 'transparent' }}>
               <input type="checkbox" checked={selectedSkus.includes(c.sku)} onChange={() => handleToggle(c.sku)} style={{ cursor: 'pointer' }} />
               {c.imageUrl && <img src={c.imageUrl} alt={c.name} style={{ width: '40px', height: '40px', objectFit: 'contain', background: '#f8f9fa', borderRadius: '4px', border: '1px solid #e9ecef' }} />}
               <div style={{ display: 'flex', flexDirection: 'column' }}>
                 <span style={{ fontWeight: 700, color: '#333' }}>{c.sku}</span>
                 <span style={{ color: '#666', fontSize: '0.75rem' }}>{c.name}</span>
               </div>
             </label>
           ))
        )}
      </div>

      {selectedSkus.length >= 2 && (
        <div style={{ animation: 'highlightFlash 0.5s ease-out' }}>
          <label>2. Assign Individual Bundle Pricing:</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px', marginTop: '4px', background: '#fde8e8', padding: '10px', borderRadius: '4px' }}>
             {selectedSkus.map(sku => {
                const cat = getFlatCatalog().find(c => c.sku === sku);
                if (!cat) return null;
                return (
                  <div key={sku} style={{ display: 'flex', flexDirection: 'column' }}>
                     <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>{cat.name}</span>
                     <span style={{ fontSize: '0.7rem', color: '#666', marginBottom: '4px' }}>Current D2C price: ${cat.defaultPrice.toLocaleString()}</span>
                     <input type="number" className="chat-input" value={individualPrices[sku]} onChange={(e) => handlePriceChange(sku, Number(e.target.value))} />
                  </div>
                )
             })}
             <div style={{ borderTop: '1px solid #fbcbc9', paddingTop: '8px', marginTop: '4px', fontSize: '0.9rem', fontWeight: 'bold', textAlign: 'right' }}>
                Total Target Bundle Price: ${currentTotal.toLocaleString()}
             </div>
          </div>

          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '12px', background: '#f5f5f5', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}>
             <select className="chat-input" style={{ minWidth: '75px', padding: '6px', fontSize: '0.8rem' }} value={discountType} onChange={e => setDiscountType(e.target.value)}>
               <option value="PERCENT">% Off</option>
               <option value="FIXED">$ Off</option>
             </select>
             <input type="number" className="chat-input" style={{ flex: 1, minWidth: '60px', padding: '6px' }} placeholder="Amount" value={discountValue} onChange={e => setDiscountValue(Number(e.target.value))} />
             <button 
                type="button" 
                style={{ fontSize: '0.75rem', padding: '6px 14px', whiteSpace: 'nowrap', background: 'var(--lg-black)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} 
                onClick={bulkDiscountPrices}
             >
               Apply
             </button>
          </div>

          <div style={{ marginBottom: '12px' }}>
             <label>3. Bundle Name</label>
             <input type="text" className="chat-input" value={bundleName} onChange={e => setBundleName(e.target.value)} placeholder="e.g. Dream Kitchen Combo" />
          </div>

          <div>
             <label>4. Destination Category</label>
             <select className="chat-input" style={{ width: '100%', padding: '6px', fontSize: '0.8rem' }} value={bundleCategory} onChange={e => setBundleCategory(e.target.value)}>
                {Object.keys(FULL_CATALOG).map(cat => <option key={cat} value={cat}>{cat}</option>)}
             </select>
          </div>
          
          <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
            <div style={{ flex: 1 }}>
              <label>Valid From:</label>
              <input type="date" className="chat-input" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <label>Valid To:</label>
              <input type="date" className="chat-input" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
          </div>

          <button 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '16px', background: 'var(--lg-red)' }}
            onClick={(e) => { 
                e.preventDefault(); 
                if(bundleName && currentTotal > 0) {
                    const catalog = getFlatCatalog();
                    const imgs = selectedSkus.map(sku => catalog.find(c => c.sku === sku)?.imageUrl).filter((url): url is string => !!url);
                    onSubmit(bundleName, currentTotal, selectedSkus, bundleCategory, imgs, startDate, endDate); 
                }
            }}
            disabled={!bundleName || currentTotal <= 0}
          >
            Create PTO Combo (${currentTotal.toLocaleString()})
          </button>
        </div>
      )}
      {selectedSkus.length > 0 && selectedSkus.length < 2 && (
        <p style={{ fontSize: '0.8rem', color: '#888' }}>Select at least 2 items to form a bundle.</p>
      )}
    </div>
  );
}

// Promotion Details Toggle Component
function PromotionDetailsButton({ target, count, sku, categoryId }: { target: string, count: number, sku?: string, categoryId?: string }) {
  const [show, setShow] = useState(false);
  const [realSkus, setRealSkus] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (show && target !== 'Specific SKU' && realSkus.length === 0) {
      setIsLoading(true);
      const url = categoryId 
        ? `http://localhost:8080/api/v1/catalog/products?categoryId=${categoryId}&size=${count}`
        : `http://localhost:8080/api/v1/catalog/products?size=${count}`;
      fetch(url)
        .then(res => res.json())
        .then(data => {
           if (data.content) {
             setRealSkus(data.content.map((p: any) => `${p.sku} (${p.name || target})`));
           }
        })
        .catch(err => console.error(err))
        .finally(() => setIsLoading(false));
    }
  }, [show, target, categoryId, count]);

  if (count > 30) {
    const handleDownloadExcel = async () => {
      let products = [];
      if (target !== 'Specific SKU') {
        const url = categoryId 
          ? `http://localhost:8080/api/v1/catalog/products?categoryId=${categoryId}&size=${count}`
          : `http://localhost:8080/api/v1/catalog/products?size=${count}`;
        try {
          const res = await fetch(url);
          const data = await res.json();
          if (data.content) products = data.content;
        } catch (err) {
          console.error(err);
        }
      }

      let csvContent = "data:text/csv;charset=utf-8,SKU,Category,Name\n";
      if (products.length > 0) {
        products.forEach((p: any, idx: number) => {
          csvContent += `${p.sku},${target},${p.name || `Product ${idx+1}`}\n`;
        });
      } else {
        for (let i = 1; i <= count; i++) {
          csvContent += `PRD-${target.replace(/\s+/g, '')}-${i},${target},Product ${i}\n`;
        }
      }

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `affected_products_${target.replace(/\s+/g, '_')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    return (
      <div>
        <button 
          className="btn" 
          style={{ width: '100%', background: '#fff', border: '1px solid #475569', color: '#475569', padding: '8px', fontSize: '0.75rem', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}
          onClick={handleDownloadExcel}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Download Excel List ({count.toLocaleString()})
        </button>
        <button 
          className="btn" 
          style={{ width: '100%', background: 'var(--accent)', border: 'none', color: '#fff', padding: '8px', fontSize: '0.75rem', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', marginTop: '8px' }}
          onClick={() => {
            navigate('/promotions');
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
          View list in Promotion Admin
        </button>
      </div>
    );
  }

  const displaySkus = target === 'Specific SKU' ? [sku || 'OLED65G4'] : (realSkus.length > 0 ? realSkus : (isLoading ? ['Loading real SKUs from DB...'] : ['No SKUs found.']));

  return (
    <div>
      <button 
        className="btn" 
        style={{ width: '100%', background: '#fff', border: '1px solid #bbf7d0', color: '#166534', padding: '8px', fontSize: '0.75rem', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        onClick={() => setShow(!show)}
      >
        <span>Check Product Details ({count})</span>
        <span>{show ? '▲' : '▼'}</span>
      </button>
      {show && (
        <div style={{ marginTop: '8px', background: '#fff', padding: '12px', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '0.8rem', animation: 'fadeIn 0.3s ease', maxHeight: '200px', overflowY: 'auto' }}>
          <strong style={{ color: '#334155' }}>Affected Products:</strong>
          <ul style={{ paddingLeft: '20px', margin: '8px 0 0 0', color: '#475569', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {displaySkus.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

// Rollout Setup Interactive Form
function RolloutSetupForm({ onSubmit, initialData }: { onSubmit: (data: any) => void, initialData?: any }) {
  const [region, setRegion] = useState(initialData?.region || 'ES');
  const [websiteId, setWebsiteId] = useState(initialData?.websiteId || '056');
  const [currency, setCurrency] = useState(initialData?.currency || 'EUR');
  const [language, setLanguage] = useState(initialData?.language || 'es-ES');
  const [catalog, setCatalog] = useState('MASTER_CATALOG');
  const [complianceChecked, setComplianceChecked] = useState(false);
  const userLang = initialData?.userLang || 'en';

  // Dynamic translated labels from Gemini
  const labels = initialData?.labels || {};
  const lblRegion = labels.region || 'Region (Code)';
  const lblWebsiteId = labels.websiteId || 'Website ID (3-digit)';
  const lblCurrency = labels.currency || 'Currency';
  const lblLanguage = labels.language || 'Language Locale';
  const lblCatalog = labels.catalog || 'Base Catalog Template';
  const lblMasterCatalog = labels.masterCatalog || 'Master Catalog (Global Default)';
  const lblCompliance = labels.compliance || 'Confirm regional tax & data privacy compliance checks';
  const lblButton = labels.button || 'Prepare Launch';

  return (
    <div className="chat-form">
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        <div style={{ flex: 1 }}>
          <label>{lblRegion}</label>
          <input type="text" className="chat-input" value={region} onChange={e => setRegion(e.target.value)} />
        </div>
        <div style={{ flex: 1, display: 'none' }}>
          <label>{lblWebsiteId}</label>
          <input type="text" className="chat-input" value={websiteId} onChange={e => setWebsiteId(e.target.value)} />
        </div>
        <div style={{ flex: 1 }}>
          <label>{lblCurrency}</label>
          <input type="text" className="chat-input" value={currency} onChange={e => setCurrency(e.target.value)} />
        </div>
      </div>
      <div style={{ marginBottom: '8px' }}>
        <label>{lblLanguage}</label>
        <input type="text" className="chat-input" value={language} onChange={e => setLanguage(e.target.value)} />
      </div>
      <div style={{ marginBottom: '12px' }}>
        <label>{lblCatalog}</label>
        <select className="chat-input" value={catalog} onChange={e => setCatalog(e.target.value)} disabled>
          <option value="MASTER_CATALOG">{lblMasterCatalog}</option>
        </select>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px', alignItems: 'start', marginBottom: '12px', textAlign: 'left', width: '100%' }}>
        <input type="checkbox" id="compliance-chk" style={{ margin: '4px 0 0 0', cursor: 'pointer' }} checked={complianceChecked} onChange={e => setComplianceChecked(e.target.checked)} />
        <label htmlFor="compliance-chk" style={{ fontSize: '0.8rem', color: '#495057', cursor: 'pointer', lineHeight: '1.4', margin: 0, textAlign: 'left', display: 'block' }}>
          {lblCompliance}
        </label>
      </div>
      <button 
        className="btn btn-primary" 
        style={{ padding: '8px', fontSize: '0.85rem', width: '100%', background: 'var(--lg-red)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        disabled={!complianceChecked}
        onClick={(e) => { e.preventDefault(); onSubmit({ region, websiteId, currency, language, catalog, labels, userLang }); }}
      >
        {lblButton}
      </button>
    </div>
  );
}
