import React, { useState, useEffect } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import { BACKEND_BASE_URL } from '../../api/config';
import styles from './WorkStatusPanel.module.css';

interface WorkUpdate {
  updateId: string;
  message: string;
  attachments: Array<{
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    path: string;
    url: string;
  }>;
  timestamp: Date;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DISPUTED';
}

interface BuyerResponse {
  responseId: string;
  updateId: string;
  action: 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES' | 'DISPUTE';
  message?: string;
  attachments: Array<{
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    path: string;
    url: string;
  }>;
  timestamp: Date;
}

interface WorkStatusPanelProps {
  roomId: string;
  currentUserId: string;
  userRole: 'buyer' | 'seller';
  roomStatus: any;
}

const WorkStatusPanel: React.FC<WorkStatusPanelProps> = ({ 
  roomId, 
  currentUserId, 
  userRole, 
  roomStatus 
}) => {
  const { socket } = useSocket();
  const [workStatus, setWorkStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [selectedUpdateId, setSelectedUpdateId] = useState<string>('');
  const [updateMessage, setUpdateMessage] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  const [responseAction, setResponseAction] = useState<'APPROVE' | 'REJECT' | 'REQUEST_CHANGES' | 'DISPUTE'>('APPROVE');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  useEffect(() => {
    console.log('WorkStatusPanel - userRole:', userRole);
    console.log('WorkStatusPanel - currentUserId:', currentUserId);
    fetchWorkStatus();
  }, [roomId, userRole]);

  const fetchWorkStatus = async () => {
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/rooms/${roomId}/work-status`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setWorkStatus(data);
      }
    } catch (error) {
      console.error('Failed to fetch work status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedFiles(Array.from(e.target.files));
    }
  };

  const submitWorkUpdate = async () => {
    if (!updateMessage.trim()) return;

    try {
      const formData = new FormData();
      formData.append('message', updateMessage);
      uploadedFiles.forEach(file => {
        formData.append('attachments', file);
      });

      const response = await fetch(`${BACKEND_BASE_URL}/rooms/${roomId}/work-update`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (response.ok) {
        setUpdateMessage('');
        setUploadedFiles([]);
        setShowUpdateForm(false);
        fetchWorkStatus();
        
        // Emit socket event
        socket?.emit('work_update', { roomId, message: updateMessage });
      }
    } catch (error) {
      console.error('Failed to submit work update:', error);
    }
  };

  const submitBuyerResponse = async () => {
    if (!selectedUpdateId) return;

    try {
      const formData = new FormData();
      formData.append('updateId', selectedUpdateId);
      formData.append('action', responseAction);
      if (responseMessage) {
        formData.append('message', responseMessage);
      }
      uploadedFiles.forEach(file => {
        formData.append('attachments', file);
      });

      const response = await fetch(`${BACKEND_BASE_URL}/rooms/${roomId}/buyer-response`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (response.ok) {
        setResponseMessage('');
        setResponseAction('APPROVE');
        setUploadedFiles([]);
        setShowResponseForm(false);
        setSelectedUpdateId('');
        fetchWorkStatus();
        
        // Emit socket event
        socket?.emit('buyer_response', { roomId, action: responseAction });
      }
    } catch (error) {
      console.error('Failed to submit buyer response:', error);
    }
  };

  const initiateDispute = async () => {
    try {
      const formData = new FormData();
      formData.append('reason', 'Work quality dispute');
      uploadedFiles.forEach(file => {
        formData.append('evidence', file);
      });

      const response = await fetch(`${BACKEND_BASE_URL}/rooms/${roomId}/initiate-dispute`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (response.ok) {
        setUploadedFiles([]);
        fetchWorkStatus();
        
        // Emit socket event
        socket?.emit('dispute_initiated', { roomId });
      }
    } catch (error) {
      console.error('Failed to initiate dispute:', error);
    }
  };

  const startWork = async () => {
    try {
      const formData = new FormData();
      formData.append('message', 'Work has been started');
      
      const response = await fetch(`${BACKEND_BASE_URL}/rooms/${roomId}/work-update`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (response.ok) {
        fetchWorkStatus();
        socket?.emit('work_update', { roomId, message: 'Work has been started' });
      }
    } catch (error) {
      console.error('Failed to start work:', error);
    }
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'NOT_STARTED': return '#6b7280';
      case 'IN_PROGRESS': return '#3b82f6';
      case 'COMPLETED': return '#10b981';
      case 'UNDER_REVIEW': return '#f59e0b';
      case 'APPROVED': return '#10b981';
      case 'REJECTED': return '#ef4444';
      case 'DISPUTED': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getPhaseIcon = (phase: string) => {
    switch (phase) {
      case 'NOT_STARTED': return '⏳';
      case 'IN_PROGRESS': return '🔄';
      case 'COMPLETED': return '✅';
      case 'UNDER_REVIEW': return '👀';
      case 'APPROVED': return '✅';
      case 'REJECTED': return '❌';
      case 'DISPUTED': return '⚠️';
      default: return '⏳';
    }
  };

  if (loading) {
    return (
      <div className={styles.workStatusPanel}>
        <div className={styles.loading}>Loading work status...</div>
      </div>
    );
  }

  return (
    <div className={styles.workStatusPanel}>
      <div className={styles.header}>
        <h3>📊 Work Progress</h3>
        <div className={styles.phaseIndicator}>
          <span className={styles.phaseIcon}>
            {getPhaseIcon(workStatus?.currentPhase || 'NOT_STARTED')}
          </span>
          <span 
            className={styles.phaseText}
            style={{ color: getPhaseColor(workStatus?.currentPhase || 'NOT_STARTED') }}
          >
            {workStatus?.currentPhase?.replace('_', ' ') || 'NOT STARTED'}
          </span>
        </div>
      </div>

      {/* Progress Timeline */}
      <div className={styles.timeline}>
        {workStatus?.sellerUpdates && workStatus.sellerUpdates.length > 0 ? (
          workStatus.sellerUpdates.map((update: WorkUpdate, index: number) => (
          <div key={update.updateId} className={styles.timelineItem}>
            <div className={styles.timelineHeader}>
              <span className={styles.updateNumber}>Update #{index + 1}</span>
              <span className={styles.timestamp}>
                {new Date(update.timestamp).toLocaleString()}
              </span>
              <span className={`${styles.status} ${styles[update.status.toLowerCase()]}`}>
                {update.status}
              </span>
            </div>
            
            <div className={styles.updateContent}>
              <p>{update.message}</p>
              
              {update.attachments && update.attachments.length > 0 && (
                <div className={styles.attachments}>
                  {update.attachments.map((file, fileIndex) => (
                    <div key={fileIndex} className={styles.attachment}>
                      <span className={styles.fileIcon}>📎</span>
                      <span className={styles.fileName}>{file.originalName}</span>
                      <a 
                        href={`${BACKEND_BASE_URL}${file.url}`} 
                        download 
                        className={styles.downloadLink}
                      >
                        📥
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Buyer Response */}
            {workStatus?.buyerResponses?.filter((resp: BuyerResponse) => resp.updateId === update.updateId).map((response: BuyerResponse) => (
              <div key={response.responseId} className={styles.buyerResponse}>
                <div className={styles.responseHeader}>
                  <span className={styles.responseAction}>{response.action}</span>
                  <span className={styles.timestamp}>
                    {new Date(response.timestamp).toLocaleString()}
                  </span>
                </div>
                {response.message && <p>{response.message}</p>}
                
                {response.attachments && response.attachments.length > 0 && (
                  <div className={styles.attachments}>
                    {response.attachments.map((file, fileIndex) => (
                      <div key={fileIndex} className={styles.attachment}>
                        <span className={styles.fileIcon}>📎</span>
                        <span className={styles.fileName}>{file.originalName}</span>
                        <a 
                          href={`${BACKEND_BASE_URL}${file.url}`} 
                          download 
                          className={styles.downloadLink}
                        >
                          📥
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Action Buttons for Buyer */}
            {userRole === 'buyer' && update.status === 'PENDING' && (
              <div className={styles.actionButtons}>
                <button 
                  className={`${styles.actionBtn} ${styles.approveBtn}`}
                  onClick={() => {
                    setSelectedUpdateId(update.updateId);
                    setResponseAction('APPROVE');
                    setShowResponseForm(true);
                  }}
                >
                  ✅ Approve
                </button>
                <button 
                  className={`${styles.actionBtn} ${styles.rejectBtn}`}
                  onClick={() => {
                    setSelectedUpdateId(update.updateId);
                    setResponseAction('REJECT');
                    setShowResponseForm(true);
                  }}
                >
                  ❌ Reject
                </button>
                <button 
                  className={`${styles.actionBtn} ${styles.disputeBtn}`}
                  onClick={() => {
                    setSelectedUpdateId(update.updateId);
                    setResponseAction('DISPUTE');
                    setShowResponseForm(true);
                  }}
                >
                  ⚠️ Dispute
                </button>
              </div>
            )}
          </div>
        ))
        ) : (
          <div className={styles.emptyState}>
            <h4>No Work Updates Yet</h4>
            <p>Work progress will appear here once the seller starts working on the project.</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className={styles.actionSection}>
        {userRole === 'seller' && workStatus?.currentPhase === 'NOT_STARTED' && (
          <button 
            className={styles.primaryBtn}
            onClick={startWork}
          >
            🚀 Start Work
          </button>
        )}

        {userRole === 'seller' && workStatus?.currentPhase !== 'NOT_STARTED' && (
          <button 
            className={styles.primaryBtn}
            onClick={() => setShowUpdateForm(true)}
          >
            📝 Add Work Update
          </button>
        )}

        {userRole === 'buyer' && workStatus?.currentPhase === 'NOT_STARTED' && (
          <div style={{ 
            padding: '12px', 
            background: '#f0f9ff', 
            border: '1px solid #0ea5e9', 
            borderRadius: '8px', 
            color: '#0c4a6e',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            ⏳ Waiting for seller to start work...
          </div>
        )}



        {workStatus?.currentPhase === 'DISPUTED' && (
          <button 
            className={styles.disputeBtn}
            onClick={initiateDispute}
          >
            🤖 AI Dispute Resolution
          </button>
        )}
        
                {/* Debug info */}
        <div className={styles.debugInfo}>
          <div><strong>Status:</strong></div>
          <div>Role: {userRole}</div>
          <div>Phase: {workStatus?.currentPhase || 'NOT_STARTED'}</div>
          <div>Updates: {workStatus?.sellerUpdates?.length || 0}</div>
          <div>Responses: {workStatus?.buyerResponses?.length || 0}</div>
        </div>
      </div>

      {/* Work Update Form */}
      {showUpdateForm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h4>Add Work Update</h4>
            <textarea
              value={updateMessage}
              onChange={(e) => setUpdateMessage(e.target.value)}
              placeholder="Describe your work progress..."
              className={styles.textarea}
            />
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              className={styles.fileInput}
            />
            <div className={styles.modalActions}>
              <button onClick={submitWorkUpdate} className={styles.primaryBtn}>
                Submit Update
              </button>
              <button onClick={() => setShowUpdateForm(false)} className={styles.secondaryBtn}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Buyer Response Form */}
      {showResponseForm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h4>Respond to Work Update</h4>
            <select
              value={responseAction}
              onChange={(e) => setResponseAction(e.target.value as any)}
              className={styles.select}
            >
              <option value="APPROVE">Approve</option>
              <option value="REJECT">Reject</option>
              <option value="REQUEST_CHANGES">Request Changes</option>
              <option value="DISPUTE">Dispute</option>
            </select>
            <textarea
              value={responseMessage}
              onChange={(e) => setResponseMessage(e.target.value)}
              placeholder="Add your response (optional)..."
              className={styles.textarea}
            />
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              className={styles.fileInput}
            />
            <div className={styles.modalActions}>
              <button onClick={submitBuyerResponse} className={styles.primaryBtn}>
                Submit Response
              </button>
              <button onClick={() => setShowResponseForm(false)} className={styles.secondaryBtn}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkStatusPanel; 