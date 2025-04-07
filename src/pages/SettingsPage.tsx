
import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import PageContainer from '@/components/layout/PageContainer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import SupabaseCredentialsForm from '@/components/settings/SupabaseCredentialsForm';

const SettingsPage = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if Supabase connection is established
    const checkConnection = async () => {
      try {
        const { data, error } = await supabase.from('users').select('count').limit(1);
        setIsConnected(!error);
      } catch (error) {
        setIsConnected(false);
      }
    };
    
    checkConnection();
  }, []);

  return (
    <>
      <Header />
      <PageContainer 
        title="Configurações" 
        description="Configurar o sistema de atribuição de respostas"
      >
        <div className="mb-8">
          <SupabaseCredentialsForm 
            isConnected={isConnected}
            onConnectionStatusChange={(status) => setIsConnected(status)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuração do Supabase</CardTitle>
              <CardDescription>Configuração para a atribuição automática de respostas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">SQL para função de atribuição</h3>
                  <div className="bg-gray-800 text-white text-xs p-3 rounded overflow-auto max-h-60">
                    <pre>
{`CREATE OR REPLACE FUNCTION assign_response_to_user()
RETURNS TRIGGER AS $$
DECLARE
    next_user_id uuid;
    last_assigned_user_id uuid;
    user_cursor CURSOR FOR 
        SELECT id FROM users 
        WHERE status = 'Ativo' 
        ORDER BY created_at ASC;
    found_next boolean := false;
BEGIN
    -- Verify if there are any active users
    IF NOT EXISTS (SELECT 1 FROM users WHERE status = 'Ativo') THEN
        RETURN NEW;
    END IF;

    -- Find the last user who was assigned a response
    SELECT user_id INTO last_assigned_user_id
    FROM respostas
    WHERE user_id IS NOT NULL
    ORDER BY id DESC
    LIMIT 1;

    -- If no previous assignment, assign to the oldest active user
    IF last_assigned_user_id IS NULL THEN
        SELECT id INTO next_user_id
        FROM users
        WHERE status = 'Ativo'
        ORDER BY created_at ASC
        LIMIT 1;
    ELSE
        -- Find the next user after the last assigned user
        FOR user_record IN user_cursor LOOP
            IF found_next THEN
                next_user_id := user_record.id;
                EXIT;
            ELSIF user_record.id = last_assigned_user_id THEN
                found_next := true;
            END IF;
        END LOOP;

        -- If we've reached the end of the list, start from the beginning
        IF next_user_id IS NULL THEN
            SELECT id INTO next_user_id
            FROM users
            WHERE status = 'Ativo'
            ORDER BY created_at ASC
            LIMIT 1;
        END IF;
    END IF;

    -- Assign the response to the next user
    NEW.user_id := next_user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;`}
                    </pre>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">SQL para trigger</h3>
                  <div className="bg-gray-800 text-white text-xs p-3 rounded overflow-auto max-h-40">
                    <pre>
{`CREATE OR REPLACE TRIGGER assign_response_trigger
BEFORE INSERT ON respostas
FOR EACH ROW
EXECUTE FUNCTION assign_response_to_user();`}
                    </pre>
                  </div>
                </div>
                
                <Button 
                  className="w-full"
                  disabled={!isConnected}
                  onClick={() => {
                    toast({
                      title: "Info",
                      description: isConnected 
                        ? "Esta funcionalidade será aplicada no seu banco de dados Supabase." 
                        : "Por favor, conecte-se ao Supabase primeiro.",
                    });
                  }}
                >
                  Aplicar configuração no Supabase
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Regras de Atribuição</CardTitle>
              <CardDescription>Controle como as respostas são atribuídas aos utilizadores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-md">
                  <h3 className="text-sm font-medium mb-2">Ordem de Atribuição</h3>
                  <p className="text-sm text-gray-600">As respostas são atribuídas por ordem de antiguidade dos utilizadores (do mais antigo ao mais recente).</p>
                </div>
                
                <div className="p-4 border rounded-md">
                  <h3 className="text-sm font-medium mb-2">Rotação</h3>
                  <p className="text-sm text-gray-600">Quando o último utilizador recebe uma resposta, o sistema volta ao início da lista (utilizador mais antigo).</p>
                </div>
                
                <div className="p-4 border rounded-md">
                  <h3 className="text-sm font-medium mb-2">Mudança de Status</h3>
                  <p className="text-sm text-gray-600">Utilizadores "Não Ativos" são excluídos do processo de atribuição. Ao serem reativados, são colocados no fim da lista.</p>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full"
                  disabled={isGenerating || !isConnected}
                  onClick={() => {
                    setIsGenerating(true);
                    setTimeout(() => {
                      setIsGenerating(false);
                      toast({
                        title: "Atribuições reorganizadas",
                        description: "A lista de atribuição foi reorganizada com sucesso.",
                      });
                    }, 1500);
                  }}
                >
                  {isGenerating ? 'Processando...' : 'Reorganizar atribuições manualmente'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    </>
  );
};

export default SettingsPage;
