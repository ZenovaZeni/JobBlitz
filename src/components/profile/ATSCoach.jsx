import React, { useMemo } from 'react';

/**
 * ATS Coach MVP
 * Combines rule-based analysis with AI Deep Dive findings.
 */
export const ATSCoach = ({ profile, onDeepDive, aiFindings, isAnalyzing, onClose }) => {
  const localFindings = useMemo(() => {
    if (!profile) return [];
    
    const results = [];
    
    // 1. Core Structure (Critical & Warnings)
    if (!profile?.name?.trim()) {
      results.push({ type: 'critical', title: 'Missing Identity', detail: 'Recruiters need your full name at the top.', section: 'Header', icon: 'person' });
    }
    
    if (!profile?.summary?.trim()) {
      results.push({ type: 'warning', title: 'No Summary', detail: 'A professional hook is essential for ATS scanning and human context.', section: 'Summary', icon: 'short_text' });
    } else if (profile?.summary?.length > 400) {
      results.push({ type: 'warning', title: 'Dense Summary', detail: 'Your summary is getting long. Keep it under 4 sentences for human readability.', section: 'Summary', icon: 'history_edu' });
    }

    if (!profile?.experience || profile?.experience?.length === 0) {
      results.push({ type: 'critical', title: 'Work History Missing', detail: 'Chronological history is the most important section for any ATS.', section: 'Experience', icon: 'work' });
    } else if (profile?.experience?.every(e => !e?.description && !e?.bullets)) {
      results.push({ type: 'warning', title: 'Empty Bullets', detail: 'Experience entries are missing descriptions. Use action verbs and metrics.', section: 'Experience', icon: 'format_list_bulleted' });
    }

    if (!profile?.skills || profile?.skills?.length === 0) {
      results.push({ type: 'critical', title: 'Skills Cloud Empty', detail: 'ATS keywords live here. Add core hard and soft skills.', section: 'Skills', icon: 'magic_button' });
    } else if (profile?.skills?.length < 5) {
      results.push({ type: 'info', title: 'Low Keyword Density', detail: 'List at least 10–12 skills to maximize ATS discoverability.', section: 'Skills', icon: 'grid_view' });
    }

    // 2. Readability & Success States
    if (profile?.summary && profile?.skills?.length >= 10 && profile?.experience?.length > 0) {
       results.push({ type: 'success', title: 'Solid Structure', detail: 'Your resume structure looks solid and ready for indexing.', icon: 'check_circle' });
    }
    const items = [];
    
    // 1. Critical Sections Check
    if (!profile.name?.trim()) items.push({ type: 'critical', title: 'Name Missing', detail: 'Your name is the most important element of your brand.', section: 'header', icon: 'person_off' });
    if (!profile.summary?.trim()) items.push({ type: 'warning', title: 'Weak Summary', detail: 'A missing summary is a missed opportunity to hook the recruiter.', section: 'summary', icon: 'description' });
    
    // 2. Metric Density (Hiring Outcomes)
    const experienceText = (profile.experience || []).map(exp => exp.bullets?.join(' ') || '').join(' ');
    const hasMetrics = /[\$\%]|(\d+)|(increased|improved|reduced|saved|grew|managed)/i.test(experienceText);
    
    if (profile.experience?.length > 0 && !hasMetrics) {
      items.push({ 
        type: 'warning', 
        title: 'Outcome Gaps', 
        detail: 'Description focuses on "tasks" rather than "results". Add numbers ($ or %) to prove impact.', 
        section: 'experience' 
      });
    }

    // 3. Skills Coverage
    if (!profile.skills || profile.skills.length < 5) {
      items.push({ 
        type: 'info', 
        title: 'Sparse Skills', 
        detail: 'Aim for 8-12 core skills to improve keyword matching in ATS systems.', 
        section: 'skills' 
      });
    }

    // 4. Contact & Links
    if (!profile.linkedin) {
      items.push({ 
        type: 'info', 
        title: 'LinkedIn Missing', 
        detail: '95% of recruiters cross-reference LinkedIn profiles.', 
        section: 'header' 
      });
    }

    return items;
  }, [profile]);

  // Merge AI findings if they exist
  const findings = useMemo(() => {
    if (aiFindings) {
      const merged = [];
      
      // Map AI Critical Missing
      if (aiFindings.critical_missing?.length > 0) {
        aiFindings.critical_missing.forEach(item => {
          merged.push({ type: 'critical', title: `Missing: ${item}`, detail: 'The AI identifies this as a critical gap for your target roles.', icon: 'error' });
        });
      }

      // Map AI Feedback
      if (aiFindings.quality_feedback) {
        Object.entries(aiFindings.quality_feedback).forEach(([section, data]) => {
          if (data.rating === 'weak' || data.metric_density < 50) {
            merged.push({ 
              type: 'warning', 
              title: `${section.charAt(0).toUpperCase() + section.slice(1)} Quality`, 
              detail: data.advice,
              icon: 'analytics'
            });
          }
        });
      }

      // Map AI Next Steps
      if (aiFindings.next_steps?.length > 0) {
        aiFindings.next_steps.forEach(step => {
          merged.push({ type: 'info', title: 'Next Step', detail: step, icon: 'keyboard_double_arrow_right' });
        });
      }

      return merged.length > 0 ? merged : localFindings;
    }
    return localFindings;
  }, [localFindings, aiFindings]);

  const score = useMemo(() => {
    if (aiFindings?.readiness_score) return aiFindings.readiness_score;
    
    // Heuristic fallback score
    let base = 30;
    if (profile?.name) base += 10;
    if (profile?.summary) base += 10;
    if (profile?.experience?.length > 0) base += 20;
    if (profile?.skills?.length >= 5) base += 15;
    if (profile?.education?.length > 0) base += 15;
    
    return Math.min(base, 100);
  }, [profile, aiFindings]);

  const expertTip = aiFindings?.quality_feedback?.summary?.advice || "ATS Tip: Focus on measurable outcomes and clear typography to ensure ranking success.";

  const getTypeStyle = (type) => {
    switch (type) {
      case 'critical': return { bg: '#fff1f2', border: '#ffe4e6', color: '#be123c', icon: 'error' };
      case 'warning': return { bg: '#fff9e6', border: '#ffecb3', color: '#664d03', icon: 'warning' };
      case 'success': return { bg: '#f0fff4', border: '#dcfce7', color: '#198754', icon: 'check_circle' };
      case 'info': return { bg: '#f0f4ff', border: '#dbe4ff', color: '#0e0099', icon: 'info' };
      default: return { bg: '#f8fafc', border: '#e2e8f0', color: '#64748b', icon: 'info' };
    }
  };

  return (
    <div className="flex flex-col h-full bg-white animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-6 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-[#0e0099]">psychology</span>
          <h3 className="font-bold text-[#031631]">ATS Coach</h3>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-[#f2f4f6] rounded-full transition-colors">
          <span className="material-symbols-outlined text-[#8293b4]">close</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {/* Score Card */}
        <div className="flex items-center gap-4 p-5 bg-[#031631] text-white rounded-2xl shadow-xl shadow-blue-900/10 border border-blue-800/10">
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center border-2 border-white/20 relative ${isAnalyzing ? 'animate-pulse' : ''}`}>
            <span className="text-lg font-black">{isAnalyzing ? '--' : score}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-0.5">Readiness Score</div>
            <div className="text-sm font-semibold truncate leading-tight">
              {isAnalyzing ? 'Analyzing deep patterns...' : score >= 90 ? 'Built for High Impact.' : score >= 70 ? 'Professional & Clear.' : 'Needs Narrative Focus.'}
            </div>
          </div>
        </div>

        {/* AI Deep Dive Button */}
        <button 
          onClick={onDeepDive}
          disabled={isAnalyzing}
          className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all shadow-lg active:scale-[0.98] ${
            isAnalyzing ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'ai-glow-btn text-white'
          }`}
        >
          <span className={`material-symbols-outlined text-[18px] ${isAnalyzing ? 'animate-spin' : ''}`}>
            {isAnalyzing ? 'progress_activity' : 'auto_awesome'}
          </span>
          {isAnalyzing ? 'Running Neural Scan...' : 'AI Deep Dive'}
        </button>

        {/* Findings List */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <span className="material-symbols-outlined text-[14px] text-[#8293b4]">track_changes</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8293b4]">Strategic Analysis</span>
          </div>

          <div className="space-y-3">
            {isAnalyzing ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse flex gap-3 h-16 bg-slate-50 rounded-xl" />
                ))}
              </div>
            ) : (findings.length === 0) ? (
               <div className="flex flex-col items-center justify-center py-8 text-center opacity-50">
                  <span className="material-symbols-outlined text-[32px] mb-2">stars</span>
                  <p className="text-xs font-bold">No issues found!</p>
               </div>
            ) : findings.map((f, i) => {
              const styles = getTypeStyle(f.type);
              return (
                <div 
                  key={i} 
                  className="p-3.5 rounded-xl border flex gap-3 animate-slide-in"
                  style={{ backgroundColor: styles.bg, borderColor: styles.border, animationDelay: `${i * 50}ms` }}
                >
                  <span className="material-symbols-outlined text-[18px] shrink-0" style={{ color: styles.color }}>{f.icon || styles.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className="text-[13px] font-bold leading-none truncate" style={{ color: styles.color }}>{f.title}</h4>
                      {f.section && (
                        <span className="text-[9px] font-black uppercase" style={{ color: styles.color + 'aa' }}>{f.section}</span>
                      )}
                    </div>
                    <p className="text-[11px] leading-snug font-medium" style={{ color: styles.color }}>{f.detail || f.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer / Tip */}
      <div className="p-5 bg-[#f8fafc] border-t border-slate-100">
         <div className="flex gap-2">
            <span className="material-symbols-outlined text-[16px] text-[#0e0099] font-bold">lightbulb</span>
            <div className="text-[10px] leading-normal text-[#031631] font-bold">
              {aiFindings?.expert_tip ? (
                <span>{aiFindings.expert_tip}</span>
              ) : (
                <span><strong>Pro Tip:</strong> ATS systems love action verbs like "Spearhandled" or "Pioneered". Use them to start every bullet!</span>
              )}
            </div>
         </div>
      </div>
    </div>
  );
};
