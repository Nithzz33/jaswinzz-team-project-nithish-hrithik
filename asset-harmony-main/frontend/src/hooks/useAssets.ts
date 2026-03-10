import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

const API = "https://asset-harmony-api.onrender.com";

export function useProducts() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch(`${API}/products`)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error(err));
  }, []);

  return { products };
}

export interface DbAsset {
  id: string;
  asset_id: string;
  name: string;
  category: string;
  location: string;
  building: string;
  floor: string;
  room: string;
  department: string;
  vendor: string;
  model: string;
  serial_number: string;
  purchase_date: string | null;
  purchase_price: number;
  condition: string;
  audit_status: string;
  last_audit_date: string | null;
  last_audited_by: string | null;
  created_at: string;
  updated_at: string;
}

export const useAssets = () => {
  return useQuery({
    queryKey: ["assets"],
    queryFn: async () => {
      const res = await fetch(`${API}/assets`);
      if (!res.ok) throw new Error("Failed to fetch assets");
      return res.json() as Promise<DbAsset[]>;
    },
  });
};

export const useUpdateAuditStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ assetId, newStatus, notes }: { assetId: string; newStatus: string; notes?: string }) => {

      const res = await fetch(`${API}/assets/${assetId}/audit`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          audit_status: newStatus,
          notes: notes || "",
        }),
      });

      if (!res.ok) throw new Error("Failed to update audit status");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["assets"] }),
  });
};

export const useAuditLogs = () => {
  return useQuery({
    queryKey: ["audit_logs"],
    queryFn: async () => {
      const res = await fetch(`${API}/audit_logs`);
      if (!res.ok) throw new Error("Failed to fetch audit logs");
      return res.json();
    },
  });
};
export const useDeleteAssets = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const res = await fetch(`${API}/assets/delete-bulk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids }),
      });

      if (!res.ok) {
        throw new Error("Failed to delete assets");
      }

      return res.json();
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
  });
};