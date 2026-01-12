import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, AlertCircle } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan, onClose }) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameras, setCameras] = useState<any[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');

  useEffect(() => {
    // Buscar câmeras disponíveis
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length > 0) {
          setCameras(devices);
          // Preferir câmera traseira se disponível
          const backCamera = devices.find(d => d.label.toLowerCase().includes('back'));
          setSelectedCamera(backCamera?.id || devices[0].id);
        } else {
          setError('Nenhuma câmera encontrada no dispositivo.');
        }
      })
      .catch((err) => {
        console.error('Erro ao buscar câmeras:', err);
        setError('Não foi possível acessar as câmeras do dispositivo.');
      });

    return () => {
      stopScanning();
    };
  }, []);

  useEffect(() => {
    if (selectedCamera && !isScanning) {
      startScanning();
    }
  }, [selectedCamera]);

  const startScanning = async () => {
    if (!selectedCamera || isScanning) return;

    try {
      const scanner = new Html5Qrcode('barcode-reader');
      scannerRef.current = scanner;

      await scanner.start(
        selectedCamera,
        {
          fps: 10,
          qrbox: { width: 250, height: 150 },
          aspectRatio: 1.777778
        },
        (decodedText) => {
          // Código de barras detectado com sucesso
          onScan(decodedText);
          stopScanning();
          onClose();
        },
        () => {
          // Erro durante a leitura (normal enquanto procura código)
          // Não exibir erro aqui
        }
      );

      setIsScanning(true);
      setError(null);
    } catch (err: any) {
      console.error('Erro ao iniciar scanner:', err);
      setError(err.message || 'Erro ao iniciar a câmera.');
      setIsScanning(false);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
        setIsScanning(false);
      } catch (err) {
        console.error('Erro ao parar scanner:', err);
      }
    }
  };

  const handleClose = async () => {
    await stopScanning();
    onClose();
  };

  const handleCameraChange = async (cameraId: string) => {
    await stopScanning();
    setSelectedCamera(cameraId);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-4)'
    }}>
      {/* Header */}
      <div style={{
        width: '100%',
        maxWidth: '600px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 'var(--space-6)',
        color: 'white'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <Camera size={24} />
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)' }}>
            Scanner de Código de Barras
          </h2>
        </div>
        <button
          onClick={handleClose}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-2)',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
        >
          <X size={24} />
        </button>
      </div>

      {/* Camera Selector */}
      {cameras.length > 1 && (
        <div style={{
          width: '100%',
          maxWidth: '600px',
          marginBottom: 'var(--space-4)'
        }}>
          <select
            value={selectedCamera}
            onChange={(e) => handleCameraChange(e.target.value)}
            style={{
              width: '100%',
              padding: 'var(--space-3)',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              fontSize: 'var(--text-sm)',
              cursor: 'pointer'
            }}
          >
            {cameras.map((camera) => (
              <option key={camera.id} value={camera.id}>
                {camera.label || `Câmera ${camera.id}`}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Scanner Container */}
      <div style={{
        width: '100%',
        maxWidth: '600px',
        backgroundColor: 'black',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        border: '2px solid var(--accent-primary)',
        boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)'
      }}>
        <div id="barcode-reader" style={{ width: '100%' }}></div>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          width: '100%',
          maxWidth: '600px',
          marginTop: 'var(--space-4)',
          padding: 'var(--space-4)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 'var(--radius-md)',
          color: 'white',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 'var(--space-3)'
        }}>
          <AlertCircle size={20} color="#ef4444" />
          <div>
            <h4 style={{ fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-1)' }}>
              Erro ao acessar câmera
            </h4>
            <p style={{ fontSize: 'var(--text-sm)', opacity: 0.9 }}>
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div style={{
        width: '100%',
        maxWidth: '600px',
        marginTop: 'var(--space-6)',
        padding: 'var(--space-4)',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 'var(--radius-md)',
        color: 'white',
        textAlign: 'center'
      }}>
        <p style={{ fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>
          Posicione o código de barras dentro da área destacada.
          <br />
          A leitura será feita automaticamente quando o código for detectado.
        </p>
      </div>
    </div>
  );
};

export default BarcodeScanner;
