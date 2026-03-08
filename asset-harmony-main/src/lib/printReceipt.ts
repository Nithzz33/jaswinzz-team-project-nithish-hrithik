const formatCurrency = (n: number) => `₹${n.toLocaleString("en-IN")}`;

interface ReceiptData {
  id: string;
  assetName: string;
  assetId: string;
  vendor: string;
  category: string;
  location: string;
  cost: number;
  status: string;
  date: string;
  notes: string;
}

export function printReceipt(data: ReceiptData) {
  const win = window.open("", "_blank", "width=420,height=600");
  if (!win) return;

  const statusLabel =
    data.status === "approved" || data.status === "auto_approved"
      ? "Approved"
      : data.status === "rejected"
        ? "Rejected"
        : "Pending";

  win.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>Reorder Receipt</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', system-ui, sans-serif; padding: 32px; color: #1a1a1a; max-width: 400px; margin: 0 auto; }
    .header { text-align: center; border-bottom: 2px solid #1a1a1a; padding-bottom: 16px; margin-bottom: 20px; }
    .header h1 { font-size: 18px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }
    .header p { font-size: 11px; color: #666; margin-top: 4px; }
    .ref { text-align: center; font-family: monospace; font-size: 11px; color: #666; margin-bottom: 20px; }
    .row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; }
    .row .label { color: #666; }
    .row .value { font-weight: 500; text-align: right; max-width: 55%; }
    .divider { border-top: 1px dashed #ccc; margin: 12px 0; }
    .total { display: flex; justify-content: space-between; padding: 10px 0; font-size: 16px; font-weight: 700; border-top: 2px solid #1a1a1a; margin-top: 12px; }
    .status { display: inline-block; padding: 2px 10px; border-radius: 4px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    .status-approved { background: #dcfce7; color: #166534; }
    .status-rejected { background: #fef2f2; color: #991b1b; }
    .status-pending { background: #fef9c3; color: #854d0e; }
    .notes { font-size: 12px; color: #666; margin-top: 8px; font-style: italic; }
    .footer { text-align: center; margin-top: 28px; font-size: 10px; color: #999; }
    @media print { body { padding: 16px; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>Reorder Receipt</h1>
    <p>Asset Replacement Request</p>
  </div>
  <div class="ref">REF: ${data.id.slice(0, 8).toUpperCase()}</div>

  <div class="row"><span class="label">Asset</span><span class="value">${data.assetName}</span></div>
  <div class="row"><span class="label">Asset ID</span><span class="value" style="font-family:monospace">${data.assetId}</span></div>
  <div class="row"><span class="label">Category</span><span class="value">${data.category}</span></div>
  <div class="row"><span class="label">Vendor</span><span class="value">${data.vendor || "—"}</span></div>
  <div class="row"><span class="label">Location</span><span class="value">${data.location || "—"}</span></div>

  <div class="divider"></div>

  <div class="row"><span class="label">Date</span><span class="value">${data.date}</span></div>
  <div class="row"><span class="label">Status</span><span class="value"><span class="status status-${statusLabel.toLowerCase()}">${statusLabel}</span></span></div>
  ${data.notes ? `<div class="notes">"${data.notes}"</div>` : ""}

  <div class="total"><span>Total Cost</span><span>${formatCurrency(data.cost)}</span></div>

  <div class="footer">
    <p>Generated on ${new Date().toLocaleString()}</p>
    <p style="margin-top: 4px;">This is a system-generated receipt.</p>
  </div>

  <script>window.onload = function() { window.print(); }</script>
</body>
</html>`);
  win.document.close();
}
