
-- Fix sales INSERT policy: change from restrictive to permissive
DROP POLICY IF EXISTS "Sales and admin can insert sales" ON public.sales;
CREATE POLICY "Sales and admin can insert sales"
ON public.sales
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'manager'::app_role) 
  OR has_role(auth.uid(), 'sales'::app_role)
);

-- Fix products UPDATE policy: change from restrictive to permissive (needed for stock deduction)
DROP POLICY IF EXISTS "Admin and managers can update products" ON public.products;
CREATE POLICY "Admin and managers can update products"
ON public.products
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'manager'::app_role)
  OR has_role(auth.uid(), 'sales'::app_role)
);

-- Also fix SELECT policies to be permissive
DROP POLICY IF EXISTS "All authenticated can read products" ON public.products;
CREATE POLICY "All authenticated can read products"
ON public.products
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "All authenticated can read sales" ON public.sales;
CREATE POLICY "All authenticated can read sales"
ON public.sales
FOR SELECT
TO authenticated
USING (true);
