import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { tablesAPI, rowsAPI } from '../services/api'

function TableView() {
  const { id } = useParams()
  const [table, setTable] = useState(null)
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingCell, setEditingCell] = useState(null)
  const [editValue, setEditValue] = useState('')

  useEffect(() => {
    fetchTableData()
  }, [id])

  const fetchTableData = async () => {
    try {
      setLoading(true)
      const response = await tablesAPI.getOne(id)
      setTable(response.data)
      setRows(response.data.rows || [])
      setError(null)
    } catch (err) {
      setError('Failed to load table')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddRow = async () => {
    try {
      const emptyData = {}
      table.schema?.columns?.forEach(col => {
        emptyData[col.name] = ''
      })
      const response = await rowsAPI.create(id, { data: emptyData })
      setRows([...rows, response.data])
    } catch (err) {
      setError('Failed to add row')
      console.error(err)
    }
  }

  const handleDeleteRow = async (rowId) => {
    if (!confirm('Delete this row?')) return
    try {
      await rowsAPI.delete(id, rowId)
      setRows(rows.filter(r => r.id !== rowId))
    } catch (err) {
      setError('Failed to delete row')
      console.error(err)
    }
  }

  const handleCellClick = (rowId, columnName, currentValue) => {
    setEditingCell({ rowId, columnName })
    setEditValue(currentValue || '')
  }

  const handleCellBlur = async () => {
    if (!editingCell) return

    const row = rows.find(r => r.id === editingCell.rowId)
    if (!row) return

    const updatedData = { ...row.data, [editingCell.columnName]: editValue }

    try {
      await rowsAPI.update(id, row.id, { data: updatedData })
      setRows(rows.map(r =>
        r.id === row.id ? { ...r, data: updatedData } : r
      ))
    } catch (err) {
      setError('Failed to update cell')
      console.error(err)
    }

    setEditingCell(null)
    setEditValue('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur()
    } else if (e.key === 'Escape') {
      setEditingCell(null)
      setEditValue('')
    }
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-red-400">{error}</div>
      </div>
    )
  }

  if (!table) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-gray-400">Table not found</div>
      </div>
    )
  }

  const columns = table.schema?.columns || []

  return (
    <div className="h-full flex flex-col bg-gray-950">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-white mb-1">{table.name}</h1>
              {table.description && (
                <p className="text-sm text-gray-400">{table.description}</p>
              )}
            </div>
            <button
              onClick={handleAddRow}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Row
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-gray-900 border-b border-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-16">
                #
              </th>
              {columns.map((col, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider min-w-[250px]"
                >
                  <div>{col.name}</div>
                  <div className="text-[10px] text-gray-600 normal-case mt-0.5">{col.type}</div>
                </th>
              ))}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-24">

              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 2}
                  className="px-6 py-16 text-center text-gray-500"
                >
                  No data yet. Click "Add Row" to get started.
                </td>
              </tr>
            ) : (
              rows.map((row, rowIndex) => (
                <tr
                  key={row.id}
                  className="border-b border-gray-800 hover:bg-gray-900 transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                    {rowIndex + 1}
                  </td>
                  {columns.map((col) => {
                    const isEditing =
                      editingCell?.rowId === row.id &&
                      editingCell?.columnName === col.name
                    const value = row.data?.[col.name] || ''

                    return (
                      <td key={col.name} className="px-6 py-4">
                        {isEditing ? (
                          <input
                            type={col.type === 'number' ? 'number' : 'text'}
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={handleCellBlur}
                            onKeyDown={handleKeyDown}
                            autoFocus
                            className="w-full px-3 py-2 bg-gray-800 border border-blue-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <div
                            onClick={() =>
                              handleCellClick(row.id, col.name, value)
                            }
                            className="min-h-[36px] px-3 py-2 text-sm text-gray-300 cursor-pointer hover:bg-gray-800 rounded-lg transition-colors"
                          >
                            {value || (
                              <span className="text-gray-600 italic">
                                Empty
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                    )
                  })}
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDeleteRow(row.id)}
                      className="text-gray-500 hover:text-red-400 transition-colors"
                      title="Delete row"
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default TableView
