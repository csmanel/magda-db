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

  if (loading) return <div className="text-center py-12 text-gray-600">Loading tables...</div>
  if (error) return <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">{error}</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Your Tables</h2>
        <button
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : '+ Create New Table'}
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Create New Table</h3>
          <form onSubmit={handleCreateTable} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Table Name</label>
              <input
                type="text"
                value={newTable.name}
                onChange={(e) => setNewTable({ ...newTable, name: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              <textarea
                value={newTable.description}
                onChange={(e) => setNewTable({ ...newTable, description: e.target.value })}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Columns</label>
              <div className="space-y-3">
                {newTable.columns.map((col, index) => (
                  <div key={index} className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Column name"
                      value={col.name}
                      onChange={(e) => updateColumn(index, 'name', e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <select
                      value={col.type}
                      onChange={(e) => updateColumn(index, 'type', e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="date">Date</option>
                    </select>
                    {newTable.columns.length > 1 && (
                      <button
                        type="button"
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
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
                className="mt-3 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                onClick={addColumn}
              >
                + Add Column
              </button>
            </div>
            <button
              type="submit"
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Create Table
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tables.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
            <p className="text-gray-500 text-lg">No tables yet. Create your first table to get started!</p>
          </div>
        ) : (
          tables.map((table) => (
            <div key={table.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow border border-gray-200 p-6 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-800">{table.name}</h3>
                <button
                  className="px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
                  onClick={() => handleDeleteTable(table.id)}
                >
                  Delete
                </button>
              </div>
              {table.description && <p className="text-gray-600 mb-4">{table.description}</p>}
              <div className="text-sm text-gray-500 mb-4">
                <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full">
                  {table.schema?.columns?.length || 0} columns
                </span>
              </div>
              <Link
                to={`/tables/${table.id}`}
                className="mt-auto px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-center rounded-lg font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                Open Table
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default TableList
