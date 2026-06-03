// hooks/useExportCsv.ts
"use client";

import { useState } from "react";

interface ExportParams {
  search?: string;
  start_date: string;
  end_date: string;
  institution?: string;
  branch_name?: string;
  unit_name?: string;
  store_location?: string;
  store_clerk?: string;
  masked_cid?: string;
  trx_reference?: string;
  points_redeemed?: string;
  order_by?: string;
  page: number;
  per_page: number;
}

export function useExportCsv() {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportCsv = async (params: ExportParams) => {
    setIsExporting(true);
    setError(null);

    try {
      const response = await fetch("/api/transactions/export-csv", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message ?? `Export failed (${response.status})`);
      }

      // Read the filename from the Content-Disposition our route set
      const disposition = response.headers.get("content-disposition") ?? "";
      const match = disposition.match(/filename[^;=\n]*=(['"]?)([^\n;"']+)\1/);
      const filename = match?.[2] ?? "transactions.csv";

      // Create a temporary <a> to trigger the browser download dialog
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setIsExporting(false);
    }
  };

  return { exportCsv, isExporting, error };
}
