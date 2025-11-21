import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export const QRScanner = () => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isScanning) return;

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
    };

    scannerRef.current = new Html5QrcodeScanner(
      'qr-reader',
      config,
      false
    );

    scannerRef.current.render(
      (decodedText) => {
        // Successfully scanned
        try {
          // Check if it's a URL
          if (decodedText.includes('/verify/')) {
            const hash = decodedText.split('/verify/')[1];
            if (hash) {
              stopScanning();
              navigate(`/verify/${hash}`);
            }
          } else {
            toast({
              title: 'Invalid QR Code',
              description: 'This QR code is not a valid prescription verification code',
              variant: 'destructive',
            });
          }
        } catch (error) {
          toast({
            title: 'Scan Error',
            description: 'Failed to process QR code',
            variant: 'destructive',
          });
        }
      },
      (errorMessage) => {
        // Scanning errors - mostly ignorable
        console.debug('QR Scan error:', errorMessage);
      }
    );

    return () => {
      stopScanning();
    };
  }, [isScanning, toast, navigate]);

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(console.error);
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const startScanning = async () => {
    try {
      // Request camera permission
      await navigator.mediaDevices.getUserMedia({ video: true });
      setIsScanning(true);
    } catch (error) {
      toast({
        title: 'Camera Access Required',
        description: 'Please allow camera access to scan QR codes',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            QR Code Scanner
          </span>
          {isScanning && (
            <Button variant="ghost" size="sm" onClick={stopScanning}>
              <X className="h-4 w-4 mr-1" />
              Stop
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!isScanning ? (
          <div className="text-center py-12">
            <Camera className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              Scan prescription QR codes to verify and view patient details
            </p>
            <Button onClick={startScanning}>
              <Camera className="h-4 w-4 mr-2" />
              Start Camera
            </Button>
          </div>
        ) : (
          <div>
            <div id="qr-reader" className="w-full"></div>
            <p className="text-sm text-muted-foreground text-center mt-4">
              Position the QR code within the frame to scan
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
