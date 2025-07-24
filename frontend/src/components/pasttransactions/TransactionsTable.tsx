import React, { useState, useEffect } from 'react';
import styles from './TransactionsTable.module.css';
import axios from 'axios';
import * as XLSX from 'xlsx';

const rowsPerPage = 7;

const TransactionsTable: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/transactions', { withCredentials: true })
      .then(res => {
        setTransactions(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const totalPages = Math.ceil(transactions.length / rowsPerPage);
  const paginatedItems = transactions.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true, day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatStatus = (status: string) => {
    if (status === 'SUCCESS') return 'Successful';
    if (status === 'FAILED') return 'Failed';
    if (status === 'REFUNDED') return 'Refunded';
    return 'Pending';
  };

  const handleDownload = () => {
    // Prepare data for Excel
    const data = transactions.map(tx => ({
      Date: formatDate(tx.createdAt),
      Status: formatStatus(tx.paymentStatus),
      ID: tx.id,
      Amount: tx.amount,
    }));

    // Create worksheet and workbook
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transactions');

    // Generate buffer and trigger download
    XLSX.writeFile(wb, 'transactions.xlsx');
  };

  if (loading) return <div className={styles.tableContainer}><p>Loading...</p></div>;
  if (!transactions.length) return <div className={styles.tableContainer}><p>No transactions found.</p></div>;

  return (
    <div className={styles.tableContainer}>
      <table className={styles.transactionTable}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Status</th>
            <th>ID</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {paginatedItems.map((item, idx) => (
            <tr key={item.id}>
              <td>{formatDate(item.createdAt)}</td>
              <td>
                <span className={styles.statusTag + ' ' + (formatStatus(item.paymentStatus) === 'Successful' ? styles.successful : styles.failed)}>
                  {formatStatus(item.paymentStatus)}
                </span>
              </td>
              <td>{item.id}</td>
              <td className={styles.amount}>
                ₹{item.amount} <span className={styles.currencyIcon}>₹</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className={styles.tableFooter}>
        <div className={styles.footerInfo}>
          <span>{transactions.length} results | Page {currentPage}</span>
          <button
                className={styles.btn + ' ' + styles.btnSecondary}
                onClick={handleDownload}
              >
                <i className="fas fa-download"></i> Download
              </button>
        </div>
        <div className={styles.pagination}>
          <button
            className={styles.btn + ' ' + styles.btnSecondary}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <button
            className={styles.btn + ' ' + styles.btnPrimary}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionsTable; 