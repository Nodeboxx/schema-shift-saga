import { useQRCode } from '@/hooks/useQRCode';

interface QRCodeDisplayProps {
  prescriptionId: string;
  uniqueHash: string;
}

export const QRCodeDisplay = ({ prescriptionId, uniqueHash }: QRCodeDisplayProps) => {
  const verifyUrl = `${window.location.origin}/verify/${uniqueHash}`;
  const qrCodeUrl = useQRCode(verifyUrl);

  if (!qrCodeUrl) return null;

  return (
    <div className="qr-code-container print:block" style={{ textAlign: 'center', marginTop: '10px' }}>
      <img 
        src={qrCodeUrl} 
        alt="Prescription QR Code" 
        style={{ 
          width: '80px', 
          height: '80px',
          display: 'inline-block'
        }} 
      />
      <div style={{ fontSize: '8px', marginTop: '4px', color: '#666' }}>
        Scan to verify
      </div>
    </div>
  );
};
