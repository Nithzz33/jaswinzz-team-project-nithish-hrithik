
CREATE TABLE public.asset_reorder_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL,
  estimated_cost NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending_approval',
  approved_by UUID,
  rejection_reason TEXT,
  vendor_email_sent BOOLEAN NOT NULL DEFAULT false,
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.asset_reorder_requests ENABLE ROW LEVEL SECURITY;

-- All authenticated can read
CREATE POLICY "Authenticated users can read asset reorder requests"
  ON public.asset_reorder_requests FOR SELECT
  TO authenticated
  USING (true);

-- Managers and admins can create requests
CREATE POLICY "Managers and admins can insert asset reorder requests"
  ON public.asset_reorder_requests FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update (approve/reject)
CREATE POLICY "Admins can update asset reorder requests"
  ON public.asset_reorder_requests FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
