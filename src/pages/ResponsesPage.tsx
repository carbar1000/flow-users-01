
import React, { useEffect, useState } from 'react';
import { Response } from '@/types';
import Header from '@/components/layout/Header';
import PageContainer from '@/components/layout/PageContainer';
import ResponseTable from '@/components/responses/ResponseTable';
import { getResponses } from '@/services/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProcessResponsesButton from '@/components/assignments/ProcessResponsesButton';
import { useToast } from '@/components/ui/use-toast';

const ResponsesPage = () => {
  const [unassignedResponses, setUnassignedResponses] = useState<Response[]>([]);
  const [assignedResponses, setAssignedResponses] = useState<Response[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchResponses = async () => {
    try {
      setIsLoading(true);
      const [unassigned, assigned] = await Promise.all([
        getResponses(false),
        getResponses(true)
      ]);
      setUnassignedResponses(unassigned);
      setAssignedResponses(assigned);
    } catch (error) {
      console.error('Error fetching responses:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao carregar as respostas.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResponses();
  }, []);

  return (
    <>
      <Header />
      <PageContainer 
        title="Respostas" 
        description="Visualize todas as respostas recebidas pelo formulário"
      >
        <div className="mb-6 flex justify-between items-center">
          <div className="flex gap-4">
            <span className="text-sm font-medium text-gray-500">
              Total: {unassignedResponses.length + assignedResponses.length} respostas
            </span>
            <span className="text-sm font-medium text-gray-500">
              Não atribuídas: {unassignedResponses.length} respostas
            </span>
          </div>
          <div className="flex gap-4">
            <button 
              className="text-sm text-brand-600 hover:text-brand-800"
              onClick={fetchResponses}
            >
              Atualizar lista
            </button>
            {unassignedResponses.length > 0 && (
              <ProcessResponsesButton onSuccess={fetchResponses} />
            )}
          </div>
        </div>

        <Tabs defaultValue="unassigned" className="mb-8">
          <TabsList>
            <TabsTrigger value="unassigned">Não Atribuídas ({unassignedResponses.length})</TabsTrigger>
            <TabsTrigger value="assigned">Atribuídas ({assignedResponses.length})</TabsTrigger>
            <TabsTrigger value="all">Todas ({unassignedResponses.length + assignedResponses.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="unassigned">
            <ResponseTable 
              responses={unassignedResponses} 
              isLoading={isLoading} 
            />
          </TabsContent>
          <TabsContent value="assigned">
            <ResponseTable 
              responses={assignedResponses} 
              isLoading={isLoading} 
            />
          </TabsContent>
          <TabsContent value="all">
            <ResponseTable 
              responses={[...unassignedResponses, ...assignedResponses].sort((a, b) => {
                if (!a.timestamp || !b.timestamp) return 0;
                return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
              })} 
              isLoading={isLoading} 
            />
          </TabsContent>
        </Tabs>
      </PageContainer>
    </>
  );
};

export default ResponsesPage;
