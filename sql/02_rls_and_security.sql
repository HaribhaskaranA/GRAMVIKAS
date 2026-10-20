-- ==============================================================================
-- GRAMVIKAS AI - ROW LEVEL SECURITY (RLS) & ACCESS CONTROL POLICIES
-- Migration 02: Supabase RLS Enablement and Role Policies
-- ==============================================================================

-- 1. Enable RLS on core tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE citizen_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE official_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheme_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE citizen_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 2. SCHEMES & CRITERIA POLICIES (Public read, Admin manage)
CREATE POLICY "Public read active schemes" 
    ON schemes FOR SELECT 
    USING (is_active = TRUE);

CREATE POLICY "Admin manage schemes" 
    ON schemes FOR ALL 
    USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Public read scheme criteria" 
    ON scheme_criteria FOR SELECT 
    USING (TRUE);

-- 3. SAVED SCHEMES (Owner access only)
CREATE POLICY "Users read own saved schemes" 
    ON saved_schemes FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users insert own saved schemes" 
    ON saved_schemes FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own saved schemes" 
    ON saved_schemes FOR DELETE 
    USING (auth.uid() = user_id);

-- 4. PROJECTS & MILESTONES (Public read, Verified Officials & Admin manage)
CREATE POLICY "Public read projects" 
    ON projects FOR SELECT 
    USING (TRUE);

CREATE POLICY "Officials and Admins update projects" 
    ON projects FOR UPDATE 
    USING (
        auth.jwt() ->> 'role' IN ('official', 'admin')
    );

CREATE POLICY "Public read project milestones" 
    ON project_milestones FOR SELECT 
    USING (TRUE);

CREATE POLICY "Public read project updates" 
    ON project_updates FOR SELECT 
    USING (TRUE);

CREATE POLICY "Officials insert project updates" 
    ON project_updates FOR INSERT 
    WITH CHECK (
        auth.jwt() ->> 'role' IN ('official', 'admin')
    );

-- 5. CITIZEN REPORTS & TIMELINE
CREATE POLICY "Public read reports" 
    ON citizen_reports FOR SELECT 
    USING (is_public = TRUE OR auth.uid() = citizen_id OR auth.jwt() ->> 'role' IN ('official', 'admin'));

CREATE POLICY "Citizens create reports" 
    ON citizen_reports FOR INSERT 
    WITH CHECK (auth.uid() = citizen_id);

CREATE POLICY "Officials and Admins update reports" 
    ON citizen_reports FOR UPDATE 
    USING (auth.jwt() ->> 'role' IN ('official', 'admin'));

CREATE POLICY "Public read report timeline" 
    ON report_timeline FOR SELECT 
    USING (TRUE);

CREATE POLICY "Officials insert timeline events" 
    ON report_timeline FOR INSERT 
    WITH CHECK (auth.jwt() ->> 'role' IN ('official', 'admin'));

-- 6. ANNOUNCEMENTS (Public read verified, Officials/Admins create)
CREATE POLICY "Public read verified announcements" 
    ON announcements FOR SELECT 
    USING (is_verified = TRUE);

CREATE POLICY "Officials publish announcements" 
    ON announcements FOR INSERT 
    WITH CHECK (auth.jwt() ->> 'role' IN ('official', 'admin'));

-- 7. VOICE SUBSCRIPTIONS (Strict privacy)
CREATE POLICY "Subscribers manage own subscription" 
    ON voice_subscriptions FOR ALL 
    USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins manage voice campaigns" 
    ON voice_campaigns FOR ALL 
    USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins read call logs" 
    ON voice_call_logs FOR SELECT 
    USING (auth.jwt() ->> 'role' = 'admin');

-- 8. AUDIT LOGS (Admin read only)
CREATE POLICY "Admins read audit logs" 
    ON audit_logs FOR SELECT 
    USING (auth.jwt() ->> 'role' = 'admin');
