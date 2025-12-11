import { supabase } from '../lib/supabase'

export const tablesAPI = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('tables')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data }
  },

  getOne: async (id) => {
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
    const { data, error } = await supabase
      .from('rows')
      .select('*')
      .eq('table_id', tableId)

    if (error) throw error
    return { data }
  },

  getOne: async (tableId, rowId) => {
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
    const { error } = await supabase
      .from('rows')
      .delete()
      .eq('id', rowId)
      .eq('table_id', tableId)

    if (error) throw error
    return { data: { success: true } }
  },
}
