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
  const [isStopping, setIsStopping] = useState(false);

  // Efeito para buscar câmeras ao montar
  useEffect(() => {
    let mounted = true;

    const initCameras = async () => {
      try {
        const devices = await Html5Qrcode.getCameras();
        if (!mounted) return;

        if (devices && devices.length > 0) {
          setCameras(devices);
          // Preferir câmera traseira se disponível
          const backCamera = devices.find(d => d.label.toLowerCase().includes('back'));
          setSelectedCamera(backCamera?.id || devices[0].id);
        } else {
          setError('Nenhuma câmera encontrada no dispositivo.');
        }
      } catch (err) {
        if (mounted) {
          console.error('Erro ao buscar câmeras:', err);
          setError('Não foi possível acessar as câmeras do dispositivo.');
        }
      }
    };

    initCameras();

    return () => {
      mounted = false;
      // Cleanup de emergência se desmontar enquanto escaneia
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  // Efeito paara iniciar scanner quando selecionar câmera
  useEffect(() => {
    let mounted = true;

    const start = async () => {
      if (!selectedCamera || isScanning || isStopping) return;

      try {
        // Garantir que a instância anterior foi limpa
        if (scannerRef.current) {
          await scannerRef.current.clear();
        }

        const scanner = new Html5Qrcode('barcode-reader');
        scannerRef.current = scanner;

        await scanner.start(
          selectedCamera,
          {
            fps: 10,
            qrbox: { width: 250, height: 150 },
            aspectRatio: 1.777778
          },
          async (decodedText) => {
            if (!mounted) return;
            // Código de barras detectado
            await handleStopAndClose(decodedText);
          },
          () => {
            // Erro silencioso durante scan frame
          }
        );

        if (mounted) {
          setIsScanning(true);
          setError(null);
        }
      } catch (err: any) {
        if (mounted) {
          console.error('Erro ao iniciar scanner:', err);
          setError(err.message || 'Erro ao iniciar a câmera.');
          setIsScanning(false);
        }
      }
    };

    start();

    return () => {
      mounted = false;
    };
  }, [selectedCamera]);

  const handleStopAndClose = async (scannedCode?: string) => {
    if (isStopping || !scannerRef.current) return;

    setIsStopping(true);

    try {
      if (scannerRef.current.isScanning) {
        await scannerRef.current.stop();
      }
      await scannerRef.current.clear();
      scannerRef.current = null;
    } catch (err) {
      console.error('Erro ao parar scanner:', err);
    } finally {
      setIsScanning(false);
      setIsStopping(false);
      if (scannedCode) {
        onScan(scannedCode);
      }
      onClose();
    }
  };

  const handleCameraChange = async (cameraId: string) => {
    if (isStopping) return;
    setIsStopping(true);

    try {
      if (scannerRef.current && scannerRef.current.isScanning) {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      }
      scannerRef.current = null;
      setIsScanning(false);
      setSelectedCamera(cameraId);
    } catch (err) {
      console.error('Erro ao trocar câmera:', err);
    } finally {
      setIsStopping(false);
    }
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
          onClick={() => handleStopAndClose()}
          disabled={isStopping}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-2)',
            color: 'white',
            cursor: isStopping ? 'wait' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            opacity: isStopping ? 0.5 : 1
          }}
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
            disabled={isStopping}
            style={{
              width: '100%',
              padding: 'var(--space-3)',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              fontSize: 'var(--text-sm)',
              cursor: isStopping ? 'wait' : 'pointer'
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
        boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
        position: 'relative',
        minHeight: '300px'
      }}>
        <div id="barcode-reader" style={{ width: '100%' }}></div>
        {isStopping && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
          }}>
            <span className="loading-spinner"></span>
            <span style={{ marginLeft: '10px' }}>Finalizando...</span>
          </div>
        )}
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
