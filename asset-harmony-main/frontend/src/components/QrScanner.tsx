import { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Camera, CameraOff } from "lucide-react";

interface QrScannerProps {
  onScan: (decodedText: string) => void;
  scanning: boolean;
  onToggle: () => void;
}

const QrScanner = ({ onScan, scanning, onToggle }: QrScannerProps) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isRunningRef = useRef(false);
  const [error, setError] = useState<string | null>(null);

  const safeStop = useCallback(async () => {
    if (scannerRef.current && isRunningRef.current) {
      isRunningRef.current = false;
      try {
        await scannerRef.current.stop();
      } catch {
        // Already stopped, ignore
      }
    }
  }, []);

  useEffect(() => {
    if (!scanning) {
      safeStop();
      return;
    }

    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = scanner;
    setError(null);

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          isRunningRef.current = false;
          scanner.stop().catch(() => {});
          onScan(decodedText);
          onToggle();
        },
        () => {}
      )
      .then(() => {
        isRunningRef.current = true;
      })
      .catch(() => {
        isRunningRef.current = false;
        setError("Camera access denied or not available. You can type the Asset ID manually.");
        onToggle();
      });

    return () => {
      if (isRunningRef.current) {
        isRunningRef.current = false;
        scanner.stop().catch(() => {});
      }
    };
  }, [scanning]);

  return (
    <div className="space-y-3">
      <Button
        variant={scanning ? "destructive" : "default"}
        onClick={onToggle}
        className="w-full gap-2"
      >
        {scanning ? <CameraOff className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
        {scanning ? "Stop Scanner" : "Open QR Scanner"}
      </Button>

      <div
        id="qr-reader"
        className={`overflow-hidden rounded-xl border-2 border-dashed border-primary/30 bg-muted/50 transition-all ${
          scanning ? "h-64" : "h-0 border-0"
        }`}
      />

      {error && (
        <p className="text-xs text-destructive text-center">{error}</p>
      )}
    </div>
  );
};

export default QrScanner;
