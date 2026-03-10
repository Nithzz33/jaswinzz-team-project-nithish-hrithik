
-- Update assets UPDATE policies to include admin
DROP POLICY IF EXISTS "Auditors can update audit fields" ON public.assets;
CREATE POLICY "Auditors can update audit fields" ON public.assets
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'auditor'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Update audit_logs INSERT policy to include admin
DROP POLICY IF EXISTS "Auditors can insert audit logs" ON public.audit_logs;
CREATE POLICY "Auditors can insert audit logs" ON public.audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'auditor'::app_role) OR has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role));
