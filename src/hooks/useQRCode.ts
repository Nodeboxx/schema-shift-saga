import { useState, useEffect } from 'react';
import QRCode from 'qrcode';

export const useQRCode = (data: string) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    if (!data) return;

    const generateQR = async () => {
      try {
        const url = await QRCode.toDataURL(data, {
          width: 200,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        });
        setQrCodeUrl(url);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };

    generateQR();
  }, [data]);

  return qrCodeUrl;
};
