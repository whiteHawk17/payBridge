import React, { useState, useRef, useCallback, useEffect } from 'react';
import { BACKEND_BASE_URL } from '../../api/config';
import styles from './FileUpload.module.css';

interface FileData {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  url: string;
  messageType: string;
}

interface FileUploadProps {
  onFileUpload: (files: FileData[]) => void;
  onClose: () => void;
  roomId: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, onClose, roomId }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Effect to attach stream to video element when it mounts
  useEffect(() => {
    if (cameraStream && videoRef.current) {
      const video = videoRef.current;
      video.srcObject = cameraStream;
      video.play().catch(e => console.error("Error playing video:", e));
    }
  }, [cameraStream]);

  // Effect to get camera devices
  const getCameraDevices = useCallback(async () => {
    try {
      console.log('Getting camera devices...');
      
      // First, ensure permissions are granted by asking for a dummy stream
      // This helps in getting detailed device labels
      try {
        const dummyStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        dummyStream.getTracks().forEach(track => track.stop());
        console.log('Permission granted, got dummy stream');
      } catch (permErr) {
        console.log('Permission denied or error getting dummy stream:', permErr);
      }

      const devices = await navigator.mediaDevices.enumerateDevices();
      console.log('All devices:', devices);
      
      const cameras = devices.filter(device => device.kind === 'videoinput');
      console.log('Camera devices found:', cameras.length, cameras);
      
      setCameraDevices(cameras);
      
      // Set first camera as selected if none selected and cameras available
      if (cameras.length > 0 && !selectedCamera) {
        console.log('Setting first camera as selected:', cameras[0].deviceId);
        setSelectedCamera(cameras[0].deviceId);
      }
    } catch (err) {
      console.error('Could not get camera devices:', err);
      setCameraError('Could not access camera devices');
    }
  }, []); // Remove selectedCamera dependency
  
  useEffect(() => {
    getCameraDevices();
  }, [getCameraDevices]);
  
  // Simplified start camera function
  const startCamera = async () => {
    setCameraLoading(true);
    setCameraError(null);
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
    }
    try {
      const constraints = {
        video: { 
          deviceId: selectedCamera ? { exact: selectedCamera } : undefined,
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setCameraStream(stream);

      // Refresh device list after successfully starting the stream
      await getCameraDevices();

    } catch (err: any) {
      setCameraError(`Failed to start camera: ${err.name}`);
      console.error(err);
    } finally {
      setCameraLoading(false);
    }
  };

  // Simplified stop camera function
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setCapturedImage(null);
    setCameraError(null);
  };
  
  const captureImage = () => {
    if (videoRef.current && canvasRef.current && cameraStream) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (context && video.videoWidth > 0) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            canvas.toBlob((blob) => {
                if (blob) {
                    const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
                    setSelectedFiles(prev => [...prev, file]);
                    setCapturedImage(canvas.toDataURL('image/jpeg'));
                    stopCamera();
                }
            }, 'image/jpeg', 0.9);
        }
    }
  };

  const handleCameraChange = (deviceId: string) => { 
    setSelectedCamera(deviceId); 
    if (cameraStream) { 
      startCamera(); 
    } 
  };

  // Manual refresh camera devices
  const refreshCameraDevices = async () => {
    console.log('Manual refresh of camera devices');
    setCameraError(null);
    await getCameraDevices();
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    const fileArray = Array.from(files);
    setSelectedFiles(prev => [...prev, ...fileArray]);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / k ** i).toFixed(2))} ${['Bytes', 'KB', 'MB', 'GB'][i]}`;
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      selectedFiles.forEach(file => formData.append('files', file));
      const response = await fetch(`${BACKEND_BASE_URL}/upload/multiple`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      if (response.ok) {
        const result = await response.json();
        onFileUpload(result.files);
        onClose();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Upload failed');
      }
    } catch (err) {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>Upload Files</h3>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        <div className={styles.content}>
          <div className={styles.cameraSection}>
            <h4>Camera</h4>
            {!cameraStream ? (
              <div className={styles.cameraStart}>
                {cameraDevices.length > 0 ? (
                  <div className={styles.cameraSelector}>
                    <label>Select Camera:</label>
                    <select value={selectedCamera} onChange={(e) => handleCameraChange(e.target.value)} disabled={cameraLoading}>
                      {cameraDevices.map(device => (
                        <option key={device.deviceId} value={device.deviceId}>
                          {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className={styles.cameraSelector}>
                    <label>No cameras found</label>
                    <p style={{fontSize: '12px', color: '#666', margin: '5px 0'}}>
                      Click "Refresh List" to detect cameras
                    </p>
                  </div>
                )}
                <button className={styles.cameraButton} onClick={startCamera} disabled={cameraLoading || cameraDevices.length === 0}>
                  {cameraLoading ? 'Starting...' : '📷 Open Camera'}
                </button>
                <button onClick={refreshCameraDevices} className={styles.retryButton} style={{marginLeft: '10px'}}>
                  🔄 Refresh List
                </button>
                {cameraError && <div className={styles.cameraError}><p>{cameraError}</p></div>}
              </div>
            ) : (
              <div className={styles.cameraContainer}>
                <video ref={videoRef} className={styles.cameraVideo} autoPlay playsInline muted />
                <div className={styles.cameraControls}>
                  <button onClick={captureImage}>📸 Capture</button>
                  <button onClick={stopCamera}>❌ Close Camera</button>
                </div>
                <canvas ref={canvasRef} style={{ display: 'none' }} />
              </div>
            )}
            {capturedImage && (
              <div className={styles.capturedImage}>
                <img src={capturedImage} alt="Captured" />
                <span>Image captured & added to list!</span>
              </div>
            )}
          </div>
          
          <div className={styles.uploadSection}>
            <h4>Files</h4>
            <div 
              className={`${styles.dropZone} ${dragActive ? styles.dragActive : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className={styles.dropZoneContent}>
                <div className={styles.uploadIcon}>📁</div>
                <p>Click to select files or drag and drop</p>
                <p className={styles.fileTypes}>Images, Videos, Docs (max 50MB)</p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
              onChange={(e) => handleFileSelect(e.target.files)}
              style={{ display: 'none' }}
            />
          </div>

          {selectedFiles.length > 0 && (
            <div className={styles.selectedFiles}>
              <h4>Selected Files ({selectedFiles.length})</h4>
              {selectedFiles.map((file, index) => (
                <div key={`${file.name}-${index}`} className={styles.fileItem}>
                  <div className={styles.fileInfo}>
                    <span className={styles.fileName}>{file.name}</span>
                    <span className={styles.fileSize}>{formatFileSize(file.size)}</span>
                  </div>
                  <button className={styles.removeButton} onClick={() => removeFile(index)}>×</button>
                </div>
              ))}
            </div>
          )}

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.actions}>
            <button 
              className={styles.uploadButton}
              onClick={uploadFiles}
              disabled={selectedFiles.length === 0 || uploading}
            >
              {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} File${selectedFiles.length !== 1 ? 's' : ''}`}
            </button>
            <button className={styles.cancelButton} onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;