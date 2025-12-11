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
  const [editingTableName, setEditingTableName] = useState(false)
  const [editingTableDesc, setEditingTableDesc] = useState(false)
  const [tableName, setTableName] = useState('')
  const [tableDesc, setTableDesc] = useState('')

  useEffect(() => {
    fetchTableData()
  }, [id])

  const fetchTableData = async () => {
    try {
      setLoading(true)
      const response = await tablesAPI.getOne(id)
      setTable(response.data)
      setRows(response.data.rows || [])
      setTableName(response.data.name)
      setTableDesc(response.data.description || '')
      setError(null)
    } catch (err) {
      setError('Failed to load table')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleTableNameBlur = async () => {
    if (!tableName.trim() || tableName === table.name) {
      setTableName(table.name)
      setEditingTableName(false)
      return
    }

    try {
      await tablesAPI.update(id, {
        name: tableName,
        description: table.description,
        schema: table.schema
      })
      setTable({ ...table, name: tableName })
      setEditingTableName(false)
    } catch (err) {
      setError('Failed to update table name')
      console.error(err)
      setTableName(table.name)
      setEditingTableName(false)
    }
  }

  const handleTableDescBlur = async () => {
    if (tableDesc === (table.description || '')) {
      setEditingTableDesc(false)
      return
    }

    try {
      await tablesAPI.update(id, {
        name: table.name,
        description: tableDesc,
        schema: table.schema
      })
      setTable({ ...table, description: tableDesc })
      setEditingTableDesc(false)
    } catch (err) {
      setError('Failed to update table description')
      console.error(err)
      setTableDesc(table.description || '')
      setEditingTableDesc(false)
    }
  }

  const handleAddColumn = async () => {
    const columnName = prompt('Enter column name:')
    if (!columnName || !columnName.trim()) return

    const newSchema = {
      columns: [...(table.schema?.columns || []), { name: columnName.trim(), type: 'text' }]
    }

    try {
      await tablesAPI.update(id, {
        name: table.name,
        description: table.description,
        schema: newSchema
      })
      setTable({ ...table, schema: newSchema })
    } catch (err) {
      setError('Failed to add column')
      console.error(err)
    }
  }

  const handleRemoveColumn = async (columnName) => {
    if (!confirm(`Remove column "${columnName}"? This will delete all data in this column.`)) return

    const newSchema = {
      columns: table.schema.columns.filter(col => col.name !== columnName)
    }

    // Remove column data from all rows
    const updatedRows = rows.map(row => {
      const newData = { ...row.data }
      delete newData[columnName]
      return { ...row, data: newData }
    })

    try {
      await tablesAPI.update(id, {
        name: table.name,
        description: table.description,
        schema: newSchema
      })

      // Update all rows to remove the column data
      for (const row of updatedRows) {
        await rowsAPI.update(id, row.id, { data: row.data })
      }

      setTable({ ...table, schema: newSchema })
      setRows(updatedRows)
    } catch (err) {
      setError('Failed to remove column')
      console.error(err)
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
    <div className="h-full flex flex-col bg-gray-950 p-6">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 mr-4">
            {editingTableName ? (
              <input
                type="text"
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                onBlur={handleTableNameBlur}
                onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
                autoFocus
                className="text-xl font-semibold bg-gray-800 border border-gray-600 rounded px-2 py-1 text-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-500"
              />
            ) : (
              <h1
                onClick={() => setEditingTableName(true)}
                className="text-xl font-semibold text-gray-100 cursor-pointer hover:text-gray-300 transition-colors"
              >
                {table.name}
              </h1>
            )}
            {editingTableDesc ? (
              <input
                type="text"
                value={tableDesc}
                onChange={(e) => setTableDesc(e.target.value)}
                onBlur={handleTableDescBlur}
                onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
                autoFocus
                className="text-xs bg-gray-800 border border-gray-600 rounded px-2 py-1 text-gray-400 mt-0.5 focus:outline-none focus:ring-1 focus:ring-gray-500 w-full max-w-md"
                placeholder="Add description..."
              />
            ) : (
              <p
                onClick={() => setEditingTableDesc(true)}
                className="text-xs text-gray-400 mt-0.5 cursor-pointer hover:text-gray-300 transition-colors"
              >
                {table.description || 'Add description...'}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddColumn}
              className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-100 rounded-md text-sm font-medium transition-colors"
            >
              + Add Column
            </button>
            <button
              onClick={handleAddRow}
              className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-100 rounded-md text-sm font-medium transition-colors"
            >
              + Add Row
            </button>
          </div>
        </div>
      </div>

      {/* Table - Floating */}
      <div className="flex-1 overflow-auto">
        <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg overflow-hidden">
          <table className="w-full border-collapse">
            <thead className="bg-gray-800 border-b border-gray-700">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase border-r border-gray-700 w-12">
                  #
                </th>
                {columns.map((col, index) => (
                  <th
                    key={index}
                    className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase border-r border-gray-700 min-w-[180px]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span>{col.name}</span>
                      <button
                        onClick={() => handleRemoveColumn(col.name)}
                        className="text-gray-500 hover:text-gray-300 transition-colors text-base"
                        title="Remove column"
                      >
                        ×
                      </button>
                    </div>
                  </th>
                ))}
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase w-16">

                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + 2}
                    className="px-4 py-8 text-center text-sm text-gray-500"
                  >
                    No data yet. Click "Add Row" to get started.
                  </td>
                </tr>
              ) : (
                rows.map((row, rowIndex) => (
                  <tr key={row.id}>
                    <td className="px-4 py-2.5 text-sm text-gray-500 border-r border-gray-800">
                      {rowIndex + 1}
                    </td>
                    {columns.map((col) => {
                      const isEditing =
                        editingCell?.rowId === row.id &&
                        editingCell?.columnName === col.name
                      const value = row.data?.[col.name] || ''

                      return (
                        <td key={col.name} className="px-4 py-2.5 border-r border-gray-800">
                          {isEditing ? (
                            <input
                              type={col.type === 'number' ? 'number' : 'text'}
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={handleCellBlur}
                              onKeyDown={handleKeyDown}
                              autoFocus
                              className="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-gray-100 text-sm focus:outline-none focus:ring-1 focus:ring-gray-500"
                            />
                          ) : (
                            <div
                              onClick={() =>
                                handleCellClick(row.id, col.name, value)
                              }
                              className="text-sm text-gray-300 cursor-pointer bg-gray-900 hover:bg-gray-800 px-2 py-1 rounded transition-colors -mx-2 -my-1"
                            >
                              {value || (
                                <span className="text-gray-600 italic text-xs">
                                  Empty
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                      )
                    })}
                    <td className="px-4 py-2.5">
                      <button
                        onClick={() => handleDeleteRow(row.id)}
                        className="text-gray-500 hover:text-gray-300 transition-colors text-lg"
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
      </div>
    </div>
  )
}

export default TableView
