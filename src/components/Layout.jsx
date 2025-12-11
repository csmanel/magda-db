import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { tablesAPI, rowsAPI } from '../services/api';
import mBone from '../assets/m-bone.png';

function Layout({ children }) {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [newTable, setNewTable] = useState({
    name: '',
    description: '',
    columns: [{ name: '', type: 'text' }],
    rows: [],
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
        rows: [],
      });
      setShowCreateModal(false);

      // Create initial rows if any data was provided
      if (newTable.rows.length > 0) {
        for (const rowData of newTable.rows) {
          await rowsAPI.create(response.data.id, { data: rowData });
        }
      }

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
    const columnName = newTable.columns[index].name;
    const updatedColumns = newTable.columns.filter((_, i) => i !== index);
    const updatedRows = newTable.rows.map((row) => {
      const newData = { ...row };
      delete newData[columnName];
      return newData;
    });
    setNewTable({ ...newTable, columns: updatedColumns, rows: updatedRows });
  };

  const addRow = () => {
    const emptyRow = {};
    newTable.columns.forEach((col) => {
      emptyRow[col.name] = '';
    });
    setNewTable({ ...newTable, rows: [...newTable.rows, emptyRow] });
  };

  const removeRow = (index) => {
    const updatedRows = newTable.rows.filter((_, i) => i !== index);
    setNewTable({ ...newTable, rows: updatedRows });
  };

  const updateCell = (rowIndex, columnName, value) => {
    const updatedRows = [...newTable.rows];
    updatedRows[rowIndex] = { ...updatedRows[rowIndex], [columnName]: value };
    setNewTable({ ...newTable, rows: updatedRows });
  };

  return (
    <div className="flex h-screen bg-neutral-950 text-neutral-100">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-stone-700 rounded-lg text-white"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Overlay */}
      {showSidebar && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col
        fixed md:relative inset-y-0 left-0 z-40
        transform transition-transform duration-300 ease-in-out
        ${showSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
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
      <main className="flex-1 overflow-hidden w-full md:w-auto">{children}</main>

      {/* Create Table Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-neutral-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-neutral-800">
            <div className="sticky top-0 bg-neutral-900 border-b border-neutral-800 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
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

            <form onSubmit={handleCreateTable} className="p-4 sm:p-6 space-y-4">
              {/* Table Header */}
              <div>
                <input
                  type="text"
                  value={newTable.name}
                  onChange={(e) =>
                    setNewTable({ ...newTable, name: e.target.value })
                  }
                  required
                  className="text-lg sm:text-xl font-semibold bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-neutral-100 focus:outline-none focus:ring-1 focus:ring-stone-600 w-full"
                  placeholder="Table name..."
                />
                <textarea
                  value={newTable.description}
                  onChange={(e) =>
                    setNewTable({ ...newTable, description: e.target.value })
                  }
                  rows="1"
                  className="text-xs bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-neutral-400 mt-2 focus:outline-none focus:ring-1 focus:ring-stone-600 w-full resize-none"
                  placeholder="Description (optional)..."
                />
              </div>

              {/* Table Preview */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg shadow-lg overflow-hidden">
                <div className="overflow-auto max-h-[360px]">
                  <table className="w-full border-collapse">
                    <thead className="bg-neutral-800 border-b border-neutral-700 sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-neutral-400 uppercase border-r border-neutral-700 w-12">
                          #
                        </th>
                        {newTable.columns.map((col, index) => (
                          <th
                            key={index}
                            className="px-4 py-2 text-left text-xs font-medium text-neutral-300 uppercase border-r border-neutral-700 min-w-[180px]"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <input
                                type="text"
                                value={col.name}
                                onChange={(e) =>
                                  updateColumn(index, 'name', e.target.value)
                                }
                                placeholder="Column name..."
                                className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-neutral-300 placeholder-neutral-600 text-xs font-medium uppercase"
                              />
                              <button
                                type="button"
                                onClick={() => removeColumn(index)}
                                className="text-neutral-500 hover:text-neutral-300 transition-colors text-base"
                                title="Remove column"
                              >
                                ×
                              </button>
                            </div>
                          </th>
                        ))}
                        <th className="px-4 py-2 text-left text-xs font-medium text-neutral-400 uppercase w-16">

                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800">
                      {newTable.rows.length === 0 ? (
                        <tr>
                          <td
                            colSpan={newTable.columns.length + 2}
                            className="px-4 py-8 text-center text-sm text-neutral-500"
                          >
                            No rows yet. Click "+ Add Row" to add data.
                          </td>
                        </tr>
                      ) : (
                        newTable.rows.map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            <td className="px-4 py-2.5 text-sm text-neutral-500 border-r border-neutral-800 w-12">
                              {rowIndex + 1}
                            </td>
                            {newTable.columns.map((col) => (
                              <td
                                key={col.name}
                                className="px-4 py-2.5 border-r border-neutral-800 min-w-[180px]"
                              >
                                <input
                                  type="text"
                                  value={row[col.name] || ''}
                                  onChange={(e) =>
                                    updateCell(rowIndex, col.name, e.target.value)
                                  }
                                  className="w-full px-2 py-1 bg-neutral-800 border border-neutral-700 rounded text-neutral-100 text-sm focus:outline-none focus:ring-1 focus:ring-stone-600"
                                  placeholder="Enter value..."
                                />
                              </td>
                            ))}
                            <td className="px-4 py-2.5 w-16">
                              <button
                                type="button"
                                onClick={() => removeRow(rowIndex)}
                                className="text-neutral-500 hover:text-neutral-300 transition-colors text-lg"
                                title="Delete row"
                              >
                                ×
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="border-t border-neutral-800 px-4 py-2 bg-neutral-800">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={addColumn}
                      className="px-3 py-1.5 bg-neutral-700 hover:bg-neutral-600 text-neutral-100 rounded-md text-sm font-medium transition-colors"
                    >
                      + Add Column
                    </button>
                    <button
                      type="button"
                      onClick={addRow}
                      className="px-3 py-1.5 bg-neutral-700 hover:bg-neutral-600 text-neutral-100 rounded-md text-sm font-medium transition-colors"
                    >
                      + Add Row
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2.5 sm:py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 sm:py-2 bg-stone-700 hover:bg-stone-800 text-white rounded-lg font-medium transition-colors"
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
