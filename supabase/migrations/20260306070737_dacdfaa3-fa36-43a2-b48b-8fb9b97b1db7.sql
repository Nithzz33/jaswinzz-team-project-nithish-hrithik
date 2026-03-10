
-- Create products table for warehouse inventory
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sku TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 0,
  reorder_point INTEGER NOT NULL DEFAULT 10,
  location TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sales table
CREATE TABLE public.sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL,
  total_price NUMERIC(10,2) NOT NULL,
  sold_by UUID NOT NULL,
  customer_name TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reorder_requests table
CREATE TABLE public.reorder_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  requested_quantity INTEGER NOT NULL,
  requested_by UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reorder_requests ENABLE ROW LEVEL SECURITY;

-- Products RLS: all authenticated can read, admin+manager can modify
CREATE POLICY "All authenticated can read products" ON public.products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin and managers can insert products" ON public.products FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));
CREATE POLICY "Admin and managers can update products" ON public.products FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));
CREATE POLICY "Admin can delete products" ON public.products FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Sales RLS: sales+admin+manager can insert, all authenticated can read
CREATE POLICY "All authenticated can read sales" ON public.sales FOR SELECT TO authenticated USING (true);
CREATE POLICY "Sales and admin can insert sales" ON public.sales FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager') OR has_role(auth.uid(), 'sales'));

-- Reorder requests RLS
CREATE POLICY "All authenticated can read reorder requests" ON public.reorder_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manager and admin can manage reorder requests" ON public.reorder_requests FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));
CREATE POLICY "Manager and admin can update reorder requests" ON public.reorder_requests FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

-- Enable realtime for sales
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sales;
