import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

type AnalysisSession = Database['public']['Tables']['analysis_sessions']['Row']
type AnalysisSessionInsert = Database['public']['Tables']['analysis_sessions']['Insert']
type AnalysisSessionUpdate = Database['public']['Tables']['analysis_sessions']['Update']

export class AnalysisSessionEntity {
  static async create(data: AnalysisSessionInsert): Promise<AnalysisSession> {
    const { data: session, error } = await supabase
      .from('analysis_sessions')
      .insert(data)
      .select()
      .single()
    
    if (error) throw error
    return session
  }
  
  static async update(id: string, data: AnalysisSessionUpdate): Promise<AnalysisSession> {
    const { data: session, error } = await supabase
      .from('analysis_sessions')
      .update(data)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return session
  }
  
  static async findById(id: string): Promise<AnalysisSession | null> {
    const { data, error } = await supabase
      .from('analysis_sessions')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  }
  
  static async filter(
    filters: Partial<AnalysisSession>,
    orderBy?: string,
    limit?: number
  ): Promise<AnalysisSession[]> {
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
    if (error) throw error
    return data || []
  }
  
  static async list(orderBy?: string, limit?: number): Promise<AnalysisSession[]> {
    return this.filter({}, orderBy, limit)
  }
  
  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('analysis_sessions')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}