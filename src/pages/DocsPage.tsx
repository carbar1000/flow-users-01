
import React from 'react';
import Header from '@/components/layout/Header';
import PageContainer from '@/components/layout/PageContainer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const DocsPage = () => {
  return (
    <>
      <Header />
      <PageContainer 
        title="Documentação" 
        description="Guia de utilização do sistema de atribuição de respostas"
      >
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Como funciona a atribuição de respostas</CardTitle>
              <CardDescription>Explicação do processo de atribuição</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Visão Geral</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  O sistema de atribuição de respostas distribui automaticamente as respostas do formulário para os utilizadores qualificados,
                  seguindo uma lógica justa baseada na antiguidade dos utilizadores. Isto garante que todos os utilizadores ativos recebam
                  respostas de forma equitativa.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Lógica de Atribuição</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
                  <li>
                    <span className="font-medium">Ordem de Antiguidade:</span> As respostas são atribuídas aos utilizadores por ordem de antiguidade, 
                    começando pelo utilizador mais antigo (com base na data de criação).
                  </li>
                  <li>
                    <span className="font-medium">Rotação Contínua:</span> Quando o último utilizador da fila recebe uma resposta, 
                    o sistema volta ao início da lista (utilizador mais antigo).
                  </li>
                  <li>
                    <span className="font-medium">Utilizadores Ativos:</span> Apenas utilizadores com status "Ativo" estão qualificados 
                    para receber respostas.
                  </li>
                  <li>
                    <span className="font-medium">Mudanças de Status:</span> Quando um utilizador muda para "Não Ativo", ele deixa de receber 
                    respostas. Se voltar a ficar "Ativo", é colocado no final da fila.
                  </li>
                </ol>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Implementação no Supabase</CardTitle>
              <CardDescription>Detalhes técnicos da implementação no banco de dados</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Tabela de Respostas</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  A tabela "respostas" armazena as informações enviadas pelo formulário, incluindo nome, email e as respostas A, B e C.
                </p>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md text-sm">
                  <p><span className="font-semibold">Campos principais:</span> id, csrf_token, timestamp, A, B, C, Nome, Email, user_id</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Tabela de Utilizadores</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  A tabela "users" armazena informações sobre os utilizadores que podem receber respostas, incluindo seu status de atividade.
                </p>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md text-sm">
                  <p><span className="font-semibold">Campos principais:</span> id, name, email, status, created_at, status_updated_at</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Trigger de Atribuição</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  Um trigger PostgreSQL é responsável por atribuir automaticamente cada nova resposta ao próximo utilizador ativo na fila.
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  Este trigger é executado antes da inserção de um novo registro na tabela "respostas" e preenche automaticamente
                  o campo "user_id" com o ID do próximo utilizador qualificado.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Como usar</CardTitle>
              <CardDescription>Instruções para usar o sistema de atribuição</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Dashboard</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  O dashboard mostra estatísticas gerais e as atribuições mais recentes. Você pode usar o botão "Processar Respostas" para
                  atribuir manualmente as respostas não atribuídas aos utilizadores ativos.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Gerenciar Utilizadores</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Na página de Utilizadores, você pode ver todos os utilizadores e alterar seu status entre "Ativo" e "Não Ativo".
                  Lembre-se que esta mudança afeta a ordem de atribuição.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Visualizar Respostas</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Na página de Respostas, você pode ver todas as respostas recebidas, filtrar por atribuídas/não atribuídas,
                  e processar manualmente as respostas não atribuídas.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Configurações</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  A página de Configurações contém o SQL necessário para configurar a função e o trigger no Supabase para
                  automatizar completamente o processo de atribuição.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    </>
  );
};

export default DocsPage;
