import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { tablesAPI } from '../services/api'

function TableList() {
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newTable, setNewTable] = useState({
    name: '',
    description: '',
    columns: [{ name: '', type: 'text' }]
  })

  useEffect(() => {
    fetchTables()
  }, [])

  const fetchTables = async () => {
    try {
      setLoading(true)
      const response = await tablesAPI.getAll()
      setTables(response.data)
      setError(null)
    } catch (err) {
      setError('Failed to load tables')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTable = async (e) => {
    e.preventDefault()
    try {
      const schema = {
        columns: newTable.columns.filter(col => col.name.trim() !== '')
      }
      await tablesAPI.create({
        name: newTable.name,
        description: newTable.description,
        schema
      })
      setNewTable({ name: '', description: '', columns: [{ name: '', type: 'text' }] })
      setShowCreateForm(false)
      fetchTables()
    } catch (err) {
      setError('Failed to create table')
      console.error(err)
    }
  }

  const handleDeleteTable = async (id) => {
    if (!confirm('Are you sure you want to delete this table?')) return
    try {
      await tablesAPI.delete(id)
      fetchTables()
    } catch (err) {
      setError('Failed to delete table')
      console.error(err)
    }
  }

  const addColumn = () => {
    setNewTable({
      ...newTable,
      columns: [...newTable.columns, { name: '', type: 'text' }]
    })
  }

  const updateColumn = (index, field, value) => {
    const updatedColumns = [...newTable.columns]
    updatedColumns[index][field] = value
    setNewTable({ ...newTable, columns: updatedColumns })
  }

  const removeColumn = (index) => {
    const updatedColumns = newTable.columns.filter((_, i) => i !== index)
    setNewTable({ ...newTable, columns: updatedColumns })
  }

  if (loading) return <div className="text-center py-8 text-sm text-gray-400">Loading tables...</div>
  if (error) return <div className="bg-neutral-900 border border-neutral-700 text-gray-300 px-3 py-2 rounded-lg text-sm">{error}</div>

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-100">Your Tables</h2>
        <button
          className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-100 rounded-md text-sm font-medium transition-colors"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : '+ New Table'}
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg shadow-lg p-4 mb-4">
          <h3 className="text-base font-semibold text-gray-100 mb-3">Create New Table</h3>
          <form onSubmit={handleCreateTable} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Table Name</label>
              <input
                type="text"
                value={newTable.name}
                onChange={(e) => setNewTable({ ...newTable, name: e.target.value })}
                required
                className="w-full px-2.5 py-1.5 bg-neutral-800 border border-neutral-700 rounded text-gray-100 text-sm focus:outline-none focus:ring-1 focus:ring-gray-600"
                placeholder="e.g., Contacts"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Description</label>
              <textarea
                value={newTable.description}
                onChange={(e) => setNewTable({ ...newTable, description: e.target.value })}
                rows="2"
                className="w-full px-2.5 py-1.5 bg-neutral-800 border border-neutral-700 rounded text-gray-100 text-sm focus:outline-none focus:ring-1 focus:ring-gray-600"
                placeholder="What is this table for?"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">Columns</label>
              <div className="space-y-1.5">
                {newTable.columns.map((col, index) => (
                  <div key={index} className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="Column name"
                      value={col.name}
                      onChange={(e) => updateColumn(index, 'name', e.target.value)}
                      className="flex-1 px-2.5 py-1.5 bg-neutral-800 border border-neutral-700 rounded text-gray-100 text-sm focus:outline-none focus:ring-1 focus:ring-gray-600"
                    />
                    <select
                      value={col.type}
                      onChange={(e) => updateColumn(index, 'type', e.target.value)}
                      className="px-2.5 py-1.5 bg-neutral-800 border border-neutral-700 rounded text-gray-100 text-sm focus:outline-none focus:ring-1 focus:ring-gray-600"
                    >
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="date">Date</option>
                    </select>
                    {newTable.columns.length > 1 && (
                      <button
                        type="button"
                        className="px-2.5 py-1.5 bg-gray-700 text-gray-300 text-sm rounded hover:bg-gray-600 transition-colors"
                        onClick={() => removeColumn(index)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="mt-1.5 text-xs text-gray-400 hover:text-gray-300"
                onClick={addColumn}
              >
                + Add Column
              </button>
            </div>
            <button
              type="submit"
              className="w-full px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-100 rounded text-sm font-medium transition-colors"
            >
              Create Table
            </button>
          </form>
        </div>
      )}

      <div className="bg-neutral-900 border border-neutral-800 rounded-lg shadow-lg overflow-hidden">
        {tables.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-gray-500">
            No tables yet. Create your first table to get started!
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead className="bg-neutral-800 border-b border-neutral-700">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Description</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase w-20">Columns</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {tables.map((table) => (
                <tr key={table.id}>
                  <td className="px-4 py-2.5 text-sm font-medium text-gray-200">{table.name}</td>
                  <td className="px-4 py-2.5 text-sm text-gray-400">
                    {table.description || '-'}
                  </td>
                  <td className="px-4 py-2.5 text-sm text-gray-400">
                    {table.schema?.columns?.length || 0}
                  </td>
                  <td className="px-4 py-2.5 text-sm">
                    <Link
                      to={`/tables/${table.id}`}
                      className="text-gray-300 hover:text-gray-100 font-medium mr-3 transition-colors"
                    >
                      Open
                    </Link>
                    <button
                      className="text-gray-500 hover:text-gray-300 font-medium transition-colors"
                      onClick={() => handleDeleteTable(table.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default TableList
