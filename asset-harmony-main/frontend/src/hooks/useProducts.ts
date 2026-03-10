import { useEffect, useState } from "react";

const API = "https://asset-harmony-api.onrender.com";

/* ---------------- PRODUCTS ---------------- */

export function useProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setLoading] = useState(true);

  const loadProducts = async () => {
    try {
      const res = await fetch(`${API}/products`);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
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
    const res = await fetch(`${API}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });

    return res.json();
  };

  return { mutateAsync, isPending: false };
}

export function useDeleteProduct() {
  const mutateAsync = async (productId: string) => {
    const res = await fetch(`${API}/products/${productId}`, {
      method: "DELETE",
    });

    return res.json();
  };

  return { mutateAsync, isPending: false };
}

/* ---------------- SALES ---------------- */

export function useSales() {
  const [sales, setSales] = useState<any[]>([]);
  const [isLoading, setLoading] = useState(true);

  const loadSales = async () => {
    try {
      const res = await fetch(`${API}/sales`);
      const data = await res.json();
      setSales(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSales();
  }, []);

  return { data: sales, isLoading, reload: loadSales };
}

export function useRecordSale(reloadSales?: () => void, reloadProducts?: () => void) {
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

    const res = await fetch(`${API}/sales`, {
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

    const data = await res.json();

    // 🔄 reload data after sale
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
    fetch(`${API}/products`)
      .then((res) => res.json())
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
      const res = await fetch(`${API}/reorders`);
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      console.error(err);
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
    const res = await fetch(`${API}/reorders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req),
    });

    return res.json();
  };

  return { mutateAsync, isPending: false };
}