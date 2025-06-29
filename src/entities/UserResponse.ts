import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

type UserResponse = Database['public']['Tables']['user_responses']['Row']
type UserResponseInsert = Database['public']['Tables']['user_responses']['Insert']
type UserResponseUpdate = Database['public']['Tables']['user_responses']['Update']

export class UserResponseEntity {
  static async create(data: UserResponseInsert): Promise<UserResponse> {
    const { data: response, error } = await supabase
      .from('user_responses')
      .insert(data)
      .select()
      .single()
    
    if (error) throw error
    return response
  }
  
  static async update(id: string, data: UserResponseUpdate): Promise<UserResponse> {
    const { data: response, error } = await supabase
      .from('user_responses')
      .update(data)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return response
  }
  
  static async findById(id: string): Promise<UserResponse | null> {
    const { data, error } = await supabase
      .from('user_responses')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  }
  
  static async filter(
    filters: Partial<UserResponse>,
    orderBy?: string,
    limit?: number
  ): Promise<UserResponse[]> {
    let query = supabase.from('user_responses').select('*')
    
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value)
    })
    
    if (orderBy) {
      const isDesc = orderBy.startsWith('-')
      const column = isDesc ? orderBy.slice(1) : orderBy
      query = query.order(column, { ascending: !isDesc })
    }
    
    if (limit) {
      query = query.limit(limit)
    }
    
    const { data, error } = await query
    if (error) throw error
    return data || []
  }
  
  static async list(orderBy?: string, limit?: number): Promise<UserResponse[]> {
    return this.filter({}, orderBy, limit)
  }
  
  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('user_responses')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}