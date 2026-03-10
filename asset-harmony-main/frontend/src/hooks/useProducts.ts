import { useEffect, useState } from "react";

const API = "https://asset-harmony-api.onrender.com";

/* ---------------- API HELPER ---------------- */

async function apiFetch(url: string, options?: RequestInit) {
  const res = await fetch(url, options);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "API request failed");
  }

  return res.json();
}

/* ---------------- PRODUCTS ---------------- */

export function useProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setLoading] = useState(true);

  const loadProducts = async () => {
    try {
      const data = await apiFetch(`${API}/products`);
      setProducts(data);
    } catch (err) {
      console.error("Products API error:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return { data: products, isLoading, reload: loadProducts };
}

export function useAddProduct() {
  const mutateAsync = async (product: any) => {
    return apiFetch(`${API}/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(product),
    });
  };

  return { mutateAsync, isPending: false };
}

export function useDeleteProduct() {
  const mutateAsync = async (productId: string) => {
    return apiFetch(`${API}/products/${productId}`, {
      method: "DELETE",
    });
  };

  return { mutateAsync, isPending: false };
}

/* ---------------- SALES ---------------- */

export function useSales() {
  const [sales, setSales] = useState<any[]>([]);
  const [isLoading, setLoading] = useState(true);

  const loadSales = async () => {
    try {
      const data = await apiFetch(`${API}/sales`);
      setSales(data);
    } catch (err) {
      console.error("Sales API error:", err);
      setSales([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSales();
  }, []);

  return { data: sales, isLoading, reload: loadSales };
}

export function useRecordSale(
  reloadSales?: () => void,
  reloadProducts?: () => void
) {
  const mutateAsync = async ({
    productId,
    quantity,
    unitPrice,
    customerName,
    notes,
    soldBy,
  }: {
    productId: string;
    quantity: number;
    unitPrice: number;
    customerName: string;
    notes?: string;
    soldBy: string;
  }) => {
    const data = await apiFetch(`${API}/sales`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_id: productId,
        quantity,
        unit_price: unitPrice,
        total_price: quantity * unitPrice,
        customer_name: customerName,
        notes: notes || "",
        sold_by: soldBy,
      }),
    });

    reloadSales?.();
    reloadProducts?.();

    return data;
  };

  return { mutateAsync, isPending: false };
}

/* ---------------- LOW STOCK ---------------- */

export function useLowStockProducts() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    apiFetch(`${API}/products`)
      .then((data) => {
        const lowStock = data.filter(
          (p: any) => p.quantity <= p.reorder_point
        );
        setProducts(lowStock);
      })
      .catch((err) => console.error(err));
  }, []);

  return { data: products };
}

/* ---------------- REORDER REQUESTS ---------------- */

export function useReorderRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setLoading] = useState(true);

  const loadRequests = async () => {
    try {
      const data = await apiFetch(`${API}/reorders`);
      setRequests(data);
    } catch (err) {
      console.error("Reorders API error:", err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  return { data: requests, isLoading, reload: loadRequests };
}

export function useCreateReorderRequest() {
  const mutateAsync = async (req: any) => {
    return apiFetch(`${API}/reorders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req),
    });
  };

  return { mutateAsync, isPending: false };
}

/* ---------------- AUDIT LOGS ---------------- */

export function useAuditLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setLoading] = useState(true);

  const loadLogs = async () => {
    try {
      const data = await apiFetch(`${API}/audit-logs`);
      setLogs(data);
    } catch (err) {
      console.error("Audit logs API error:", err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  return { data: logs, isLoading, reload: loadLogs };
}