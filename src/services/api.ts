
import { supabase, createSupabaseClient } from '@/lib/supabase';
import { User, Response } from '@/types';

export function updateSupabaseCredentials(url: string, key: string) {
  return createSupabaseClient(url, key);
}

export async function getActiveUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('status', 'Ativo')
    .order('created_at', { ascending: true });
  
  if (error) {
    console.error('Error fetching active users:', error);
    throw error;
  }
  
  return data || [];
}

export async function getAllUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: true });
  
  if (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
  
  return data || [];
}

export async function updateUserStatus(userId: string, status: 'Ativo' | 'Não Ativo'): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({ 
      status, 
      status_updated_at: new Date().toISOString() 
    })
    .eq('id', userId);
  
  if (error) {
    console.error('Error updating user status:', error);
    throw error;
  }
}

export async function createUser(userData: Omit<User, 'id' | 'created_at' | 'status_updated_at'>): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .insert([{
      ...userData,
      created_at: new Date().toISOString(),
      status_updated_at: new Date().toISOString()
    }])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating user:', error);
    throw error;
  }
  
  return data;
}

export async function updateUser(userId: string, userData: Partial<User>): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({
      ...userData,
      status_updated_at: userData.status ? new Date().toISOString() : undefined
    })
    .eq('id', userId);
  
  if (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

export async function getResponses(assigned: boolean = false): Promise<Response[]> {
  let query = supabase
    .from('respostas')
    .select('*');
  
  if (assigned) {
    query = query.not('user_id', 'is', null);
  } else {
    query = query.is('user_id', null);
  }
  
  const { data, error } = await query.order('timestamp', { ascending: true });
  
  if (error) {
    console.error('Error fetching responses:', error);
    throw error;
  }
  
  return data || [];
}

export async function getAssignments(): Promise<any[]> {
  const { data, error } = await supabase
    .from('respostas')
    .select(`
      *,
      users:user_id (
        id,
        name,
        email,
        status,
        created_at
      )
    `)
    .not('user_id', 'is', null)
    .order('timestamp', { ascending: false });
  
  if (error) {
    console.error('Error fetching assignments:', error);
    throw error;
  }
  
  return data || [];
}

export async function assignResponse(responseId: number, userId: string): Promise<void> {
  const { error } = await supabase
    .from('respostas')
    .update({ user_id: userId })
    .eq('id', responseId);
  
  if (error) {
    console.error('Error assigning response:', error);
    throw error;
  }
}

export async function manuallyProcessUnassignedResponses(): Promise<void> {
  try {
    // Get unassigned responses
    const unassignedResponses = await getResponses(false);
    if (unassignedResponses.length === 0) {
      return;
    }
    
    // Get active users sorted by created_at (oldest first)
    const activeUsers = await getActiveUsers();
    if (activeUsers.length === 0) {
      return;
    }
    
    // Get the last assigned user to determine who is next
    const lastAssignment = await supabase
      .from('respostas')
      .select('user_id')
      .not('user_id', 'is', null)
      .order('id', { ascending: false })
      .limit(1)
      .single();
    
    let nextUserIndex = 0;
    
    if (!lastAssignment.error && lastAssignment.data) {
      const lastUserId = lastAssignment.data.user_id;
      const lastUserIndex = activeUsers.findIndex(user => user.id === lastUserId);
      
      // If found, start with the next user
      if (lastUserIndex >= 0) {
        nextUserIndex = (lastUserIndex + 1) % activeUsers.length;
      }
    }
    
    // Assign each unassigned response to the next user in rotation
    for (const response of unassignedResponses) {
      const userToAssign = activeUsers[nextUserIndex];
      await assignResponse(response.id, userToAssign.id);
      
      // Move to the next user for the next response
      nextUserIndex = (nextUserIndex + 1) % activeUsers.length;
    }
  } catch (error) {
    console.error('Error in manually processing unassigned responses:', error);
    throw error;
  }
}

export async function sendBrevoEmail(apiKey: string, senderId: string, senderEmail: string, recipientEmail: string, subject: string, content: string): Promise<any> {
  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: {
          name: senderId,
          email: senderEmail
        },
        to: [
          {
            email: recipientEmail
          }
        ],
        subject: subject,
        htmlContent: content
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error sending email: ${errorData.message || 'Unknown error'}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending Brevo email:', error);
    throw error;
  }
}

export async function testAIIntegration(provider: string, apiKey: string, prompt: string): Promise<string> {
  try {
    let response;
    
    if (provider === 'openai') {
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 500
        })
      });
    } else if (provider === 'perplexity') {
      response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 500
        })
      });
    } else {
      throw new Error('Provedor de IA não suportado');
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erro na API de IA: ${errorData.error?.message || 'Erro desconhecido'}`);
    }

    const data = await response.json();
    return provider === 'openai' ? data.choices[0].message.content : data.choices[0].message.content;
  } catch (error) {
    console.error('Erro no teste de integração com IA:', error);
    throw error;
  }
}
