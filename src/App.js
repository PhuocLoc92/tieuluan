import React, { createContext, useReducer, useContext, useState } from 'react';
import './index.css';

// Initial state for transactions
const initialState = {
  transactions: [],
};

// Global context and reducer
const GlobalContext = createContext(initialState);

const AppReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TRANSACTION':
      return {
        ...state,
        transactions: [action.payload, ...state.transactions],
      };
    default:
      return state;
  }
};

const GlobalProvider = ({ children }) => {
  const [state, dispatch] = useReducer(AppReducer, initialState);

  const addTransaction = (transaction) => {
    dispatch({
      type: 'ADD_TRANSACTION',
      payload: transaction,
    });
  };

  return (
    <GlobalContext.Provider
      value={{
        transactions: state.transactions,
        addTransaction,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

// Transaction component
const Transaction = ({ transaction }) => {
  const sign = transaction.amount < 0 ? '-' : '+';

  return (
    <li className={`mb-2 p-4 flex justify-between items-center border-l-4 ${
      transaction.amount < 0 ? 'border-red-500' : 'border-green-500'
    } bg-white shadow rounded-lg`}>
      <span className="flex-1">{transaction.text}</span>
      <span className="flex-1 text-center">
        {sign}
        {Math.abs(transaction.amount)} VND
      </span>
    </li>
  );
};

// Expense List component
const ExpenseList = () => {
  const { transactions } = useContext(GlobalContext);

  return (
    <>
      <h3 className="text-xl mb-4 font-semibold text-gray-700">Lịch sử giao dịch</h3>
      <ul className="list-none bg-gray-100 p-4 rounded-lg shadow">
        {transactions.map((transaction) => (
          <Transaction key={transaction.id} transaction={transaction} />
        ))}
      </ul>
    </>
  );
};

// Add Transaction component
const AddTransaction = () => {
  const [text, setText] = useState('');
  const [amount, setAmount] = useState(0);

  const { addTransaction } = useContext(GlobalContext);

  const onSubmit = (e) => {
    e.preventDefault();

    const newTransaction = {
      id: Math.floor(Math.random() * 100000000),
      text,
      amount: +amount,
      date: new Date().toLocaleString(),
    };

    addTransaction(newTransaction);
    setText('');
    setAmount(0);
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow">
      <h3 className="text-xl mb-4 font-semibold text-gray-700">Thêm giao dịch mới</h3>
      <form onSubmit={onSubmit}>
        <div className="mb-4">
          <label htmlFor="text" className="block text-gray-600 font-medium">
            Nội dung
          </label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Nhập nội dung..."
            className="w-full border border-gray-300 p-2 rounded mt-1"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="amount" className="block text-gray-600 font-medium">
            Số tiền (âm: chi, dương: thu)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Nhập số tiền..."
            className="w-full border border-gray-300 p-2 rounded mt-1"
          />
        </div>
        <button className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition">
          Thêm giao dịch
        </button>
      </form>
    </div>
  );
};

// Main App component
function App() {
  return (
    <GlobalProvider>
      <div className="container mx-auto p-4 sm:p-8 max-w-5xl bg-gray-50 min-h-screen">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Quản Lý Thu Chi</h2>
        <div className="grid grid-cols-1 gap-8">
          <div className="col-span-1">
            <AddTransaction />
            <ExpenseList />
          </div>
        </div>
      </div>
    </GlobalProvider>
  );
}

export default App;
