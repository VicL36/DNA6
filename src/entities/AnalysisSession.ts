import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

type AnalysisSession = Database['public']['Tables']['analysis_sessions']['Row']
type AnalysisSessionInsert = Database['public']['Tables']['analysis_sessions']['Insert']
type AnalysisSessionUpdate = Database['public']['Tables']['analysis_sessions']['Update']

export class AnalysisSessionEntity {
  static async create(data: AnalysisSessionInsert): Promise<AnalysisSession> {
    console.log('Criando sessão de análise:', data)
    
    const { data: session, error } = await supabase
      .from('analysis_sessions')
      .insert(data)
      .select()
      .single()
    
    if (error) {
      console.error('Erro ao criar sessão:', error)
      throw error
    }
    
    console.log('Sessão criada com sucesso:', session)
    return session
  }
  
  static async update(id: string, data: AnalysisSessionUpdate): Promise<AnalysisSession> {
    console.log('Atualizando sessão:', id, data)
    
    const { data: session, error } = await supabase
      .from('analysis_sessions')
      .update(data)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Erro ao atualizar sessão:', error)
      throw error
    }
    
    console.log('Sessão atualizada:', session)
    return session
  }
  
  static async findById(id: string): Promise<AnalysisSession | null> {
    console.log('Buscando sessão por ID:', id)
    
    const { data, error } = await supabase
      .from('analysis_sessions')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error && error.code !== 'PGRST116') {
      console.error('Erro ao buscar sessão:', error)
      throw error
    }
    
    console.log('Sessão encontrada:', data)
    return data
  }
  
  static async filter(
    filters: Partial<AnalysisSession>,
    orderBy?: string,
    limit?: number
  ): Promise<AnalysisSession[]> {
    console.log('Filtrando sessões:', filters, orderBy, limit)
    
    let query = supabase.from('analysis_sessions').select('*')
    
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
      console.error('Erro ao filtrar sessões:', error)
      throw error
    }
    
    console.log('Sessões filtradas:', data?.length || 0)
    return data || []
  }
  
  static async list(orderBy?: string, limit?: number): Promise<AnalysisSession[]> {
    return this.filter({}, orderBy, limit)
  }
  
  static async delete(id: string): Promise<void> {
    console.log('Deletando sessão:', id)
    
    const { error } = await supabase
      .from('analysis_sessions')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Erro ao deletar sessão:', error)
      throw error
    }
    
    console.log('Sessão deletada com sucesso')
  }
}