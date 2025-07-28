import React, { useState, useRef, useEffect } from 'react';
import styles from './CameraTest.module.css';

const CameraTest: React.FC = () => {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState<string>('unknown');
  const [videoInfo, setVideoInfo] = useState<{width: number, height: number} | null>(null);
  const [activeDeviceId, setActiveDeviceId] = useState<string>('');
  
  const videoRef = useRef<HTMLVideoElement>(null);

  // Check camera permissions
  useEffect(() => {
    checkPermissions();
    getDevices();
  }, []);

  // Auto-start camera when device selection changes
  useEffect(() => {
    if (selectedDevice && devices.length > 0) {
      console.log('Selected device changed to:', selectedDevice);
      // If camera is already running, restart it with new device
      if (stream) {
        console.log('Restarting camera with new device');
        stopCamera();
        setTimeout(() => {
          startCamera();
        }, 300);
      }
    }
  }, [selectedDevice]);

  const checkPermissions = async () => {
    try {
      const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
      setPermissions(result.state);
      
      result.onchange = () => {
        setPermissions(result.state);
      };
    } catch (err) {
      console.log('Permissions API not supported');
    }
  };

  const getDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(device => device.kind === 'videoinput');
      setDevices(cameras);
      
      if (cameras.length > 0) {
        setSelectedDevice(cameras[0].deviceId);
      }
    } catch (err) {
      console.error('Error getting devices:', err);
      setError('Could not access camera devices');
    }
  };

  const startCamera = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Stop existing stream
      if (stream) {
        stopCamera();
      }

      console.log('Starting camera with device:', selectedDevice);
      
      // Try multiple constraint configurations
      const constraintConfigs = [
        // Configuration 1: With specific device selection (highest priority)
        {
          video: {
            deviceId: selectedDevice ? { exact: selectedDevice } : undefined,
            width: { ideal: 640, min: 320 },
            height: { ideal: 480, min: 240 },
            frameRate: { ideal: 30, min: 10 }
          },
          audio: false
        },
        // Configuration 2: Basic constraints with device selection
        {
          video: {
            deviceId: selectedDevice ? { exact: selectedDevice } : undefined,
            width: { ideal: 640, min: 320 },
            height: { ideal: 480, min: 240 }
          },
          audio: false
        },
        // Configuration 3: Minimal constraints with device selection
        {
          video: {
            deviceId: selectedDevice ? { exact: selectedDevice } : undefined
          },
          audio: false
        },
        // Configuration 4: Fallback - any camera
        {
          video: {
            width: { ideal: 640, min: 320 },
            height: { ideal: 480, min: 240 },
            frameRate: { ideal: 30, min: 10 }
          },
          audio: false
        },
        // Configuration 5: Minimal fallback
        {
          video: true,
          audio: false
        }
      ];

      let newStream = null;
      let lastError = null;

      // Try each configuration until one works
      for (const constraints of constraintConfigs) {
        try {
          console.log('Trying camera constraints:', constraints);
          newStream = await navigator.mediaDevices.getUserMedia(constraints);
          console.log('Camera stream obtained successfully');
          break;
        } catch (err: any) {
          console.log('Camera constraint failed:', err.name, err.message);
          lastError = err;
          continue;
        }
      }

      if (!newStream) {
        throw lastError || new Error('Could not access camera with any configuration');
      }
      
      console.log('Stream obtained:', newStream);
      setStream(newStream);
      
      // Track which device is actually being used
      const videoTrack = newStream.getVideoTracks()[0];
      if (videoTrack) {
        const settings = videoTrack.getSettings();
        console.log('Active camera settings:', settings);
        // Note: deviceId might not be available in all browsers due to privacy restrictions
      }
      setActiveDeviceId(selectedDevice);
      
      if (videoRef.current) {
        const video = videoRef.current;
        
        // Clear any existing srcObject
        video.srcObject = null;
        
        // Set new stream
        video.srcObject = newStream;
        
        // Ensure video element is visible and properly sized
        video.style.display = 'block';
        video.style.width = '100%';
        video.style.height = '300px';
        video.style.backgroundColor = '#000';
        video.style.objectFit = 'cover';
        
        // Set video attributes
        video.autoplay = true;
        video.playsInline = true;
        video.muted = true;
        
        // Wait for video to be ready
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Video loading timeout'));
          }, 10000); // 10 second timeout
          
          video.onloadedmetadata = () => {
            console.log('Video metadata loaded:', video.videoWidth, 'x', video.videoHeight);
            setVideoInfo({ width: video.videoWidth, height: video.videoHeight });
            clearTimeout(timeout);
            resolve(true);
          };
          
          video.onerror = (e) => {
            console.error('Video error:', e);
            clearTimeout(timeout);
            reject(new Error('Video stream error'));
          };
          
          video.oncanplay = () => {
            console.log('Video can play');
          };
          
          video.onplaying = () => {
            console.log('Video is playing');
          };
        });
        
        // Start playing
        try {
          await video.play();
          console.log('Video started playing');
        } catch (playError) {
          console.error('Error playing video:', playError);
          // Try to play without await
          video.play().catch(e => console.error('Non-awaited play failed:', e));
        }
      }
      
      setLoading(false);
      setError(null);
      
    } catch (err: any) {
      console.error('Camera error:', err);
      setLoading(false);
      
      if (err.name === 'NotAllowedError') {
        setError('Camera permission denied. Please allow camera access in your browser settings.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found. Please check if your camera is connected and not in use by another application.');
      } else if (err.name === 'NotReadableError') {
        setError('Camera is already in use by another application. Please close other apps using the camera (FaceTime, Zoom, etc.).');
      } else if (err.name === 'OverconstrainedError') {
        setError('Camera does not support the requested settings.');
      } else if (err.message === 'Video loading timeout') {
        setError('Camera took too long to start. Please try again or check your camera permissions.');
      } else {
        setError(`Camera error: ${err.message || 'Unknown error'}. Please try refreshing the page.`);
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        console.log('Track stopped:', track.label);
      });
      setStream(null);
      setVideoInfo(null);
      setActiveDeviceId('');
    }
  };

  const handleDeviceChange = (deviceId: string) => {
    console.log('Switching to camera:', deviceId);
    setSelectedDevice(deviceId);
  };

  const requestPermissions = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      await getDevices();
      setPermissions('granted');
    } catch (err) {
      console.error('Permission request failed:', err);
      setPermissions('denied');
    }
  };

  return (
    <div className={styles.container}>
      <h2>Camera Test - macOS Debug</h2>
      
      <div className={styles.section}>
        <h3>Permissions Status</h3>
        <p>Camera Permission: <span className={styles.status}>{permissions}</span></p>
        {permissions === 'denied' && (
          <button onClick={requestPermissions} className={styles.permissionButton}>
            Request Camera Permission
          </button>
        )}
      </div>

      <div className={styles.section}>
        <h3>Available Cameras</h3>
        {devices.length > 0 ? (
          <div className={styles.deviceList}>
            {devices.map(device => (
              <div key={device.deviceId} className={styles.deviceItem}>
                <input
                  type="radio"
                  id={device.deviceId}
                  name="camera"
                  value={device.deviceId}
                  checked={selectedDevice === device.deviceId}
                  onChange={(e) => handleDeviceChange(e.target.value)}
                />
                <label htmlFor={device.deviceId}>
                  {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
                  {activeDeviceId === device.deviceId && stream && (
                    <span style={{ color: 'green', marginLeft: '8px' }}>● Active</span>
                  )}
                </label>
              </div>
            ))}
          </div>
        ) : (
          <p>No cameras found</p>
        )}
      </div>

      <div className={styles.section}>
        <h3>Camera Test</h3>
        <div className={styles.controls}>
          <button 
            onClick={startCamera} 
            disabled={loading || !selectedDevice}
            className={styles.startButton}
          >
            {loading ? 'Starting...' : 'Start Camera'}
          </button>
          <button 
            onClick={stopCamera} 
            disabled={!stream}
            className={styles.stopButton}
          >
            Stop Camera
          </button>
        </div>

        {error && (
          <div className={styles.error}>
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className={styles.videoContainer}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={styles.video}
          />
          {loading && (
            <div className={styles.loading}>
              <p>Starting camera...</p>
            </div>
          )}
          {videoInfo && (
            <div className={styles.videoInfo}>
              <p>Video Resolution: {videoInfo.width} x {videoInfo.height}</p>
            </div>
          )}
        </div>
      </div>

      <div className={styles.section}>
        <h3>Debug Information</h3>
        <div className={styles.debug}>
          <p><strong>User Agent:</strong> {navigator.userAgent}</p>
          <p><strong>Platform:</strong> {navigator.platform}</p>
          <p><strong>MediaDevices Support:</strong> {navigator.mediaDevices ? 'Yes' : 'No'}</p>
          <p><strong>GetUserMedia Support:</strong> {typeof navigator.mediaDevices?.getUserMedia === 'function' ? 'Yes' : 'No'}</p>
          <p><strong>Selected Device:</strong> {selectedDevice || 'None'}</p>
          <p><strong>Stream Active:</strong> {stream ? 'Yes' : 'No'}</p>
          <p><strong>Stream Tracks:</strong> {stream ? stream.getTracks().length : 0}</p>
          {stream && stream.getTracks().map((track, index) => (
            <p key={index}><strong>Track {index + 1}:</strong> {track.kind} - {track.label}</p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CameraTest; 