import React, { createContext, useReducer, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import './index.css';

// Initial State
const initialState = {
  transactions: []
};

// Reducer
const AppReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TRANSACTION':
      return {
        ...state,
        transactions: [...state.transactions, action.payload]
      };
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map(transaction =>
          transaction.id === action.payload.id
            ? { ...transaction, ...action.payload }
            : transaction
        )
      };
    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter(
          transaction => transaction.id !== action.payload.id
        )
      };
    case 'SET_TRANSACTIONS':
      return {
        ...state,
        transactions: action.payload
      };
    default:
      return state;
  }
};

// Create Context
const GlobalContext = createContext(initialState);

// Provider Component
const GlobalProvider = ({ children }) => {
  const [state, dispatch] = useReducer(AppReducer, initialState);

  // Actions
  function addTransaction(transaction) {
    dispatch({
      type: 'ADD_TRANSACTION',
      payload: transaction
    });
  }

  function updateTransaction(updatedTransaction) {
    dispatch({
      type: 'UPDATE_TRANSACTION',
      payload: updatedTransaction
    });
  }

  function deleteTransaction(id) {
    dispatch({
      type: 'DELETE_TRANSACTION',
      payload: { id }
    });
  }

  function setTransactions(transactions) {
    dispatch({
      type: 'SET_TRANSACTIONS',
      payload: transactions
    });
  }

  return (
    <GlobalContext.Provider
      value={{
        transactions: state.transactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        setTransactions
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

// Balance Component
const Balance = () => {
  const { transactions } = useContext(GlobalContext);
  const total = transactions.reduce((acc, transaction) => acc + transaction.amount, 0).toFixed(2);

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <h3 className="text-xl font-semibold text-gray-700">Tổng số dư</h3>
      <h2 className="text-2xl font-bold">{total} VND</h2>
    </div>
  );
};

// IncomeExpenses Component
const IncomeExpenses = () => {
  const { transactions } = useContext(GlobalContext);

  const income = transactions
    .filter(transaction => transaction.amount > 0)
    .reduce((acc, transaction) => acc + transaction.amount, 0)
    .toFixed(2);

  const expense = transactions
    .filter(transaction => transaction.amount < 0)
    .reduce((acc, transaction) => acc + Math.abs(transaction.amount), 0)
    .toFixed(2);

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <div className="flex justify-between">
        <div>
          <h4 className="text-lg font-semibold text-green-700">Thu nhập</h4>
          <p className="text-2xl font-bold text-green-700">{income} VND</p>
        </div>
        <div>
          <h4 className="text-lg font-semibold text-red-700">Chi tiêu</h4>
          <p className="text-2xl font-bold text-red-700">{expense} VND</p>
        </div>
      </div>
    </div>
  );
};

// AddTransaction Component
const AddTransaction = ({ currentTransaction, onClose }) => {
  const { addTransaction, updateTransaction } = useContext(GlobalContext);
  const [text, setText] = useState(currentTransaction ? currentTransaction.text : '');
  const [amount, setAmount] = useState(currentTransaction ? currentTransaction.amount : 0);

  const onSubmit = e => {
    e.preventDefault();

    const newTransaction = {
      id: currentTransaction ? currentTransaction.id : Math.floor(Math.random() * 100000000),
      text,
      amount: +amount,
      date: new Date().toLocaleDateString('vi-VN')
    };

    if (currentTransaction) {
      updateTransaction(newTransaction);
    } else {
      addTransaction(newTransaction);
    }
    setText('');
    setAmount(0);
    if (typeof onClose === 'function') {
      onClose(); // Hide form after update or add
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <h3 className="text-xl font-semibold text-gray-700">{currentTransaction ? 'Cập nhật giao dịch' : 'Thêm giao dịch mới'}</h3>
      <form onSubmit={onSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700">Mô tả</label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded"
            placeholder="Nhập mô tả..."
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">
            Số tiền (âm - chi tiêu, dương - thu nhập)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded"
            placeholder="Nhập số tiền..."
          />
        </div>
        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
          {currentTransaction ? 'Cập nhật giao dịch' : 'Thêm giao dịch'}
        </button>
      </form>
    </div>
  );
};

// ExpenseList Component
const ExpenseList = () => {
  const { transactions, deleteTransaction } = useContext(GlobalContext);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const handleDelete = (id) => {
    deleteTransaction(id);
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
  };

  const handleCloseEditForm = () => {
    setEditingTransaction(null);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <h3 className="text-xl font-semibold text-gray-700">Lịch sử giao dịch</h3>
      <ul>
        {transactions.map(transaction => (
          <li key={transaction.id} className={`mb-2 p-2 rounded ${transaction.amount < 0 ? 'bg-red-100' : 'bg-green-100'}`}>
            {transaction.text} <span>{transaction.amount} VND</span>
            <button onClick={() => handleEdit(transaction)} className="ml-4 text-blue-600 hover:text-blue-800">
              Sửa
            </button>
            <button onClick={() => handleDelete(transaction.id)} className="ml-4 text-red-600 hover:text-red-800">
              Xóa
            </button>
          </li>
        ))}
      </ul>
      {editingTransaction && (
        <AddTransaction currentTransaction={editingTransaction} onClose={handleCloseEditForm} />
      )}
    </div>
  );
};

// ImportExport Components
const ExportExcel = () => {
  const { transactions } = useContext(GlobalContext);

  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(transactions);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
    XLSX.writeFile(workbook, 'danhsachthuchi.xlsx');
  };

  return (
    <button
      onClick={handleExport}
      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition w-full max-w-xs"
    >
      Xuất Excel
    </button>
  );
};

const ImportExcel = () => {
  const { setTransactions } = useContext(GlobalContext);

  const handleImport = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const data = event.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet);
      setTransactions(json);
    };

    reader.readAsBinaryString(file);
  };

  return (
    <div className="w-full max-w-xs">
      <input type="file" onChange={handleImport} className="hidden" id="file-upload" />
      <label
        htmlFor="file-upload"
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition cursor-pointer block text-center"
      >
        Nhập Excel
      </label>
    </div>
  );
};

// IncomeExpenseChart Component
const IncomeExpenseChart = () => {
  const { transactions } = useContext(GlobalContext);

  const dates = transactions.map((transaction) => transaction.date);
  const incomeData = transactions.map((transaction) => (transaction.amount > 0 ? transaction.amount : 0));
  const expenseData = transactions.map((transaction) => (transaction.amount < 0 ? Math.abs(transaction.amount) : 0));

  const data = {
    labels: dates,
    datasets: [
      {
        label: 'Thu nhập',
        data: incomeData,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      },
      {
        label: 'Chi tiêu',
        data: expenseData,
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      },
    ],
  };

  const options = {
    scales: {
      x: {
        beginAtZero: true,
      },
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mt-4">
      <h3 className="text-xl mb-4 font-semibold text-gray-700">Biểu đồ thu chi</h3>
      <Bar data={data} options={options} />
    </div>
  );
};

// CurrencyRates Component
const CurrencyRates = () => {
  const [rates, setRates] = useState({});
  const [amount, setAmount] = useState(1);
  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [targetCurrency, setTargetCurrency] = useState('VND');
  const [convertedAmount, setConvertedAmount] = useState(null);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`);
        setRates(response.data.rates);
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu tỷ giá tiền tệ:', error);
      }
    };

    fetchRates();
  }, [baseCurrency]);

  const handleConvert = () => {
    if (rates[targetCurrency]) {
      setConvertedAmount((amount * rates[targetCurrency]).toFixed(2));
    } else {
      setConvertedAmount('Không thể chuyển đổi');
    }
  };

  return (
    <div className="bg-blue-100 p-4 rounded-lg shadow mb-4">
      <h3 className="text-xl font-semibold text-blue-700 mb-2">Quy đổi tiền tệ</h3>
      <div className="flex flex-col mb-4">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full border border-blue-300 p-2 rounded mb-2"
          placeholder="Nhập số tiền..."
        />
        <div className="flex mb-2">
          <select
            value={baseCurrency}
            onChange={(e) => setBaseCurrency(e.target.value)}
            className="border border-blue-300 p-2 rounded mr-2"
          >
            {Object.keys(rates).map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
          <span className="mx-2">đổi sang</span>
          <select
            value={targetCurrency}
            onChange={(e) => setTargetCurrency(e.target.value)}
            className="border border-blue-300 p-2 rounded"
          >
            {Object.keys(rates).map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleConvert}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          Chuyển đổi
        </button>
      </div>
      {convertedAmount && (
        <p className="text-lg text-blue-900">
          {amount} {baseCurrency} = {convertedAmount} {targetCurrency}
        </p>
      )}
    </div>
  );
};

// App Component
const App = () => {
  return (
    <GlobalProvider>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold text-center mb-8">ỨNG DỤNG QUẢN LÝ TÀI CHÍNH</h1>
        <div className="flex flex-col md:flex-row md:space-x-4">
          <div className="w-full md:w-1/2">
            <Balance />
            <IncomeExpenses />
            <AddTransaction />
            <ExpenseList />
            <div className="flex space-x-4 mt-4">
              <ExportExcel />
              <ImportExcel />
            </div>
          </div>
          <div className="w-full md:w-1/2">
            <CurrencyRates />
            <IncomeExpenseChart />
          </div>
        </div>
      </div>
    </GlobalProvider>
  );
};

export default App;
