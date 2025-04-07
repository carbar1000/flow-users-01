
export interface User {
  id: string;
  name: string;
  email: string;
  brevo_api_key: string | null;
  brevo_sender_name: string | null;
  brevo_sender_email: string | null;
  contact_list_brevo: string | null;
  status: 'Ativo' | 'Não Ativo';
  created_at: string;
  status_updated_at: string;
  ai_provider: 'openai' | 'perplexity' | null;
  ai_api_key: string | null;
}

export interface Response {
  id: number;
  csrf_token: string | null;
  timestamp: string | null;
  A: string | null;
  B: string | null;
  C: string | null;
  Nome: string | null;
  Email: string | null;
  user_id: string | null;
}

export interface Assignment {
  response: Response;
  user: User;
}
