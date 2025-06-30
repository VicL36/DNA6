import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

type UserResponse = Database['public']['Tables']['user_responses']['Row']
type UserResponseInsert = Database['public']['Tables']['user_responses']['Insert']
type UserResponseUpdate = Database['public']['Tables']['user_responses']['Update']

export class UserResponseEntity {
  static async create(data: UserResponseInsert): Promise<UserResponse> {
    console.log('Criando resposta do usuário:', data)
    
    const { data: response, error } = await supabase
      .from('user_responses')
      .insert(data)
      .select()
      .single()
    
    if (error) {
      console.error('Erro ao criar resposta:', error)
      throw error
    }
    
    console.log('Resposta criada com sucesso:', response)
    return response
  }
  
  static async update(id: string, data: UserResponseUpdate): Promise<UserResponse> {
    console.log('Atualizando resposta:', id, data)
    
    const { data: response, error } = await supabase
      .from('user_responses')
      .update(data)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Erro ao atualizar resposta:', error)
      throw error
    }
    
    console.log('Resposta atualizada:', response)
    return response
  }
  
  static async findById(id: string): Promise<UserResponse | null> {
    console.log('Buscando resposta por ID:', id)
    
    const { data, error } = await supabase
      .from('user_responses')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error && error.code !== 'PGRST116') {
      console.error('Erro ao buscar resposta:', error)
      throw error
    }
    
    console.log('Resposta encontrada:', data)
    return data
  }
  
  static async filter(
    filters: Partial<UserResponse>,
    orderBy?: string,
    limit?: number
  ): Promise<UserResponse[]> {
    console.log('Filtrando respostas:', filters, orderBy, limit)
    
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
    
    if (error) {
      console.error('Erro ao filtrar respostas:', error)
      throw error
    }
    
    console.log('Respostas filtradas:', data?.length || 0)
    return data || []
  }
  
  static async list(orderBy?: string, limit?: number): Promise<UserResponse[]> {
    return this.filter({}, orderBy, limit)
  }
  
  static async delete(id: string): Promise<void> {
    console.log('Deletando resposta:', id)
    
    const { error } = await supabase
      .from('user_responses')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Erro ao deletar resposta:', error)
      throw error
    }
    
    console.log('Resposta deletada com sucesso')
  }
}