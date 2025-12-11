import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { tablesAPI } from '../services/api';
import mBone from '../assets/m-bone.png';

function Layout({ children }) {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTable, setNewTable] = useState({
    name: '',
    description: '',
    columns: [{ name: '', type: 'text' }],
  });
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const response = await tablesAPI.getAll();
      setTables(response.data);
    } catch (err) {
      console.error('Failed to load tables:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTable = async (e) => {
    e.preventDefault();
    try {
      const schema = {
        columns: newTable.columns.filter((col) => col.name.trim() !== ''),
      };
      const response = await tablesAPI.create({
        name: newTable.name,
        description: newTable.description,
        schema,
      });
      setNewTable({
        name: '',
        description: '',
        columns: [{ name: '', type: 'text' }],
      });
      setShowCreateModal(false);
      await fetchTables();
      navigate(`/tables/${response.data.id}`);
    } catch (err) {
      console.error('Failed to create table:', err);
    }
  };

  const handleDeleteTable = async (tableId) => {
    if (!confirm('Delete this table?')) return;
    try {
      await tablesAPI.delete(tableId);
      await fetchTables();
      if (id === tableId.toString()) {
        navigate('/');
      }
    } catch (err) {
      console.error('Failed to delete table:', err);
    }
  };

  const addColumn = () => {
    setNewTable({
      ...newTable,
      columns: [...newTable.columns, { name: '', type: 'text' }],
    });
  };

  const updateColumn = (index, field, value) => {
    const updatedColumns = [...newTable.columns];
    updatedColumns[index][field] = value;
    setNewTable({ ...newTable, columns: updatedColumns });
  };

  const removeColumn = (index) => {
    const updatedColumns = newTable.columns.filter((_, i) => i !== index);
    setNewTable({ ...newTable, columns: updatedColumns });
  };

  return (
    <div className="flex h-screen bg-neutral-950 text-neutral-100">
      {/* Sidebar */}
      <aside className="w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col">
        <div className="p-6 border-b border-neutral-800">
          <Link to="/" className="flex space-x-2">
            <div className="w-8 h-8 bg-stone-700 rounded-lg flex items-center justify-center">
              <img
                src={mBone}
                alt="Magda DB Logo"
                className="w-full h-full object-contain p-1"
              />
            </div>
            <span className="text-xl font-semibold">magda-db</span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Tables
            </span>
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-stone-600 hover:text-stone-500 transition-colors"
              title="Create new table"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
          </div>

          {loading ? (
            <div className="text-sm text-gray-500">Loading...</div>
          ) : tables.length === 0 ? (
            <div className="text-sm text-gray-500">No tables yet</div>
          ) : (
            <nav className="space-y-1">
              {tables.map((table) => (
                <div key={table.id} className="group relative">
                  <Link
                    to={`/tables/${table.id}`}
                    className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                      id === table.id.toString()
                        ? 'bg-stone-700 text-white'
                        : 'text-neutral-300 hover:bg-neutral-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">{table.name}</span>
                      <span className="text-xs text-gray-500 ml-2">
                        {table.schema?.columns?.length || 0}
                      </span>
                    </div>
                  </Link>
                  <button
                    onClick={() => handleDeleteTable(table.id)}
                    className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 transition-all"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </nav>
          )}
        </div>

        <div className="p-4 border-t border-neutral-800">
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full px-4 py-2 bg-stone-700 hover:bg-stone-800 text-white rounded-lg text-sm font-medium transition-colors"
          >
            + New Table
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">{children}</main>

      {/* Create Table Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-neutral-800">
            <div className="sticky top-0 bg-neutral-900 border-b border-neutral-800 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Create New Table</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-300"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateTable} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Table Name
                </label>
                <input
                  type="text"
                  value={newTable.name}
                  onChange={(e) =>
                    setNewTable({ ...newTable, name: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:ring-2 focus:ring-stone-600 focus:border-transparent text-white"
                  placeholder="e.g., Contacts, Projects..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={newTable.description}
                  onChange={(e) =>
                    setNewTable({ ...newTable, description: e.target.value })
                  }
                  rows="2"
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:ring-2 focus:ring-stone-600 focus:border-transparent text-white"
                  placeholder="What is this table for?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Columns
                </label>
                <div className="space-y-2">
                  {newTable.columns.map((col, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Column name"
                        value={col.name}
                        onChange={(e) =>
                          updateColumn(index, 'name', e.target.value)
                        }
                        className="flex-1 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:ring-2 focus:ring-stone-600 focus:border-transparent text-white text-sm"
                      />
                      <select
                        value={col.type}
                        onChange={(e) =>
                          updateColumn(index, 'type', e.target.value)
                        }
                        className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:ring-2 focus:ring-stone-600 focus:border-transparent text-white text-sm"
                      >
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="date">Date</option>
                      </select>
                      {newTable.columns.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeColumn(index)}
                          className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addColumn}
                  className="mt-3 text-sm text-stone-600 hover:text-stone-500 transition-colors"
                >
                  + Add Column
                </button>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-stone-700 hover:bg-stone-800 text-white rounded-lg font-medium transition-colors"
                >
                  Create Table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Layout;
