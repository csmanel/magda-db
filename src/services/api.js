import { supabase } from '../lib/supabase'

// Mock data storage for when Supabase is not configured
const useMockData = !supabase

const mockStorage = {
  getTables: () => JSON.parse(localStorage.getItem('mockTables') || '[]'),
  saveTables: (tables) => localStorage.setItem('mockTables', JSON.stringify(tables)),
  getRows: () => JSON.parse(localStorage.getItem('mockRows') || '[]'),
  saveRows: (rows) => localStorage.setItem('mockRows', JSON.stringify(rows)),
}

// Initialize with sample data if empty
if (useMockData && mockStorage.getTables().length === 0) {
  mockStorage.saveTables([
    {
      id: '1',
      name: 'Contacts',
      description: 'My contact list',
      schema: { columns: [
        { name: 'Name', type: 'text' },
        { name: 'Email', type: 'text' },
        { name: 'Phone', type: 'text' }
      ]},
      created_at: new Date().toISOString()
    }
  ])
  mockStorage.saveRows([
    { id: '1', table_id: '1', data: { Name: 'John Doe', Email: 'john@example.com', Phone: '555-0100' }},
    { id: '2', table_id: '1', data: { Name: 'Jane Smith', Email: 'jane@example.com', Phone: '555-0101' }}
  ])
}

export const tablesAPI = {
  getAll: async () => {
    if (useMockData) {
      return { data: mockStorage.getTables() }
    }
    const { data, error } = await supabase
      .from('tables')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data }
  },

  getOne: async (id) => {
    if (useMockData) {
      const tables = mockStorage.getTables()
      const table = tables.find(t => t.id === id)
      if (!table) throw new Error('Table not found')

      const allRows = mockStorage.getRows()
      const rows = allRows.filter(r => r.table_id === id)

      return { data: { ...table, rows } }
    }

    const { data: table, error: tableError } = await supabase
      .from('tables')
      .select('*')
      .eq('id', id)
      .single()

    if (tableError) throw tableError

    const { data: rows, error: rowsError } = await supabase
      .from('rows')
      .select('*')
      .eq('table_id', id)

    if (rowsError) throw rowsError

    return { data: { ...table, rows } }
  },

  create: async (tableData) => {
    if (useMockData) {
      const tables = mockStorage.getTables()
      const newTable = {
        id: String(Date.now()),
        name: tableData.name,
        description: tableData.description,
        schema: tableData.schema,
        created_at: new Date().toISOString()
      }
      tables.push(newTable)
      mockStorage.saveTables(tables)
      return { data: newTable }
    }

    const { data, error } = await supabase
      .from('tables')
      .insert([{
        name: tableData.name,
        description: tableData.description,
        schema: tableData.schema
      }])
      .select()
      .single()

    if (error) throw error
    return { data }
  },

  update: async (id, tableData) => {
    if (useMockData) {
      const tables = mockStorage.getTables()
      const index = tables.findIndex(t => t.id === id)
      if (index === -1) throw new Error('Table not found')

      tables[index] = {
        ...tables[index],
        name: tableData.name,
        description: tableData.description,
        schema: tableData.schema
      }
      mockStorage.saveTables(tables)
      return { data: tables[index] }
    }

    const { data, error } = await supabase
      .from('tables')
      .update({
        name: tableData.name,
        description: tableData.description,
        schema: tableData.schema
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return { data }
  },

  delete: async (id) => {
    if (useMockData) {
      const tables = mockStorage.getTables()
      const filteredTables = tables.filter(t => t.id !== id)
      mockStorage.saveTables(filteredTables)

      // Also delete associated rows
      const rows = mockStorage.getRows()
      const filteredRows = rows.filter(r => r.table_id !== id)
      mockStorage.saveRows(filteredRows)

      return { data: { success: true } }
    }

    const { error } = await supabase
      .from('tables')
      .delete()
      .eq('id', id)

    if (error) throw error
    return { data: { success: true } }
  },
}

export const rowsAPI = {
  getAll: async (tableId) => {
    if (useMockData) {
      const rows = mockStorage.getRows()
      const filteredRows = rows.filter(r => r.table_id === tableId)
      return { data: filteredRows }
    }

    const { data, error } = await supabase
      .from('rows')
      .select('*')
      .eq('table_id', tableId)

    if (error) throw error
    return { data }
  },

  getOne: async (tableId, rowId) => {
    if (useMockData) {
      const rows = mockStorage.getRows()
      const row = rows.find(r => r.id === rowId && r.table_id === tableId)
      if (!row) throw new Error('Row not found')
      return { data: row }
    }

    const { data, error } = await supabase
      .from('rows')
      .select('*')
      .eq('table_id', tableId)
      .eq('id', rowId)
      .single()

    if (error) throw error
    return { data }
  },

  create: async (tableId, rowData) => {
    if (useMockData) {
      const rows = mockStorage.getRows()
      const newRow = {
        id: String(Date.now()),
        table_id: tableId,
        data: rowData.data
      }
      rows.push(newRow)
      mockStorage.saveRows(rows)
      return { data: newRow }
    }

    const { data, error } = await supabase
      .from('rows')
      .insert([{
        table_id: tableId,
        data: rowData.data
      }])
      .select()
      .single()

    if (error) throw error
    return { data }
  },

  update: async (tableId, rowId, rowData) => {
    if (useMockData) {
      const rows = mockStorage.getRows()
      const index = rows.findIndex(r => r.id === rowId && r.table_id === tableId)
      if (index === -1) throw new Error('Row not found')

      rows[index] = {
        ...rows[index],
        data: rowData.data
      }
      mockStorage.saveRows(rows)
      return { data: rows[index] }
    }

    const { data, error } = await supabase
      .from('rows')
      .update({
        data: rowData.data
      })
      .eq('id', rowId)
      .eq('table_id', tableId)
      .select()
      .single()

    if (error) throw error
    return { data }
  },

  delete: async (tableId, rowId) => {
    if (useMockData) {
      const rows = mockStorage.getRows()
      const filteredRows = rows.filter(r => !(r.id === rowId && r.table_id === tableId))
      mockStorage.saveRows(filteredRows)
      return { data: { success: true } }
    }

    const { error } = await supabase
      .from('rows')
      .delete()
      .eq('id', rowId)
      .eq('table_id', tableId)

    if (error) throw error
    return { data: { success: true } }
  },
}
