import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface AssetReorderRequest {
  id: string;
  asset_id: string;
  requested_by: string;
  estimated_cost: number;
  status: string;
  approved_by: string | null;
  rejection_reason: string | null;
  vendor_email_sent: boolean;
  notes: string;
  created_at: string;
  updated_at: string;
}

const API = "http://127.0.0.1:8000";


// -----------------------------
// GET REORDER REQUESTS
// -----------------------------

export const useAssetReorderRequests = () => {
  return useQuery({
    queryKey: ["asset_reorder_requests"],
    queryFn: async () => {
      const res = await fetch(`${API}/reorders`);

      if (!res.ok) {
        throw new Error("Failed to fetch reorder requests");
      }

      const data = await res.json();

      return data as AssetReorderRequest[];
    },
  });
};


// -----------------------------
// CREATE REORDER REQUEST
// -----------------------------

export const useCreateAssetReorder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      requests: {
        asset_id: string;
        estimated_cost: number;
        notes: string;
      }[]
    ) => {

      const res = await fetch(`${API}/reorders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requests),
      });

      if (!res.ok) {
        throw new Error("Failed to create reorder request");
      }

      return res.json();
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["asset_reorder_requests"],
      });
    },
  });
};