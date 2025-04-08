
import React, { useEffect, useState } from 'react';
import { User, Response } from '@/types';
import Header from '@/components/layout/Header';
import PageContainer from '@/components/layout/PageContainer';
import StatCard from '@/components/dashboard/StatCard';
import { getActiveUsers, getAllUsers, getResponses, getAssignments } from '@/services/api';
import ProcessResponsesButton from '@/components/assignments/ProcessResponsesButton';
import AssignmentTable from '@/components/assignments/AssignmentTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { UserIcon, MessageSquareIcon, CheckCircleIcon, AlertCircleIcon } from 'lucide-react';

const Dashboard = () => {
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [unassignedResponses, setUnassignedResponses] = useState<Response[]>([]);
  const [assignedResponses, setAssignedResponses] = useState<Response[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [activeUsersData, allUsersData, unassignedResponsesData, assignedResponsesData, assignmentsData] = await Promise.all([
        getActiveUsers(),
        getAllUsers(),
        getResponses(false),
        getResponses(true),
        getAssignments()
      ]);
      
      setActiveUsers(activeUsersData);
      setAllUsers(allUsersData);
      setUnassignedResponses(unassignedResponsesData);
      setAssignedResponses(assignedResponsesData);
      setAssignments(assignmentsData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao carregar os dados do dashboard.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <Header />
      <PageContainer 
        title="Dashboard" 
        description="Visão geral do sistema de atribuição de respostas"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard 
            title="Utilizadores Ativos" 
            value={activeUsers.length} 
            icon={<UserIcon className="h-4 w-4" />}
            description="Qualificados para receber respostas"
          />
          <StatCard 
            title="Total de Utilizadores" 
            value={allUsers.length} 
            icon={<UserIcon className="h-4 w-4" />}
          />
          <StatCard 
            title="Respostas Atribuídas" 
            value={assignedResponses.length} 
            icon={<CheckCircleIcon className="h-4 w-4" />}
          />
          <StatCard 
            title="Respostas Não Atribuídas" 
            value={unassignedResponses.length} 
            icon={<AlertCircleIcon className="h-4 w-4" />}
            description={unassignedResponses.length > 0 ? "Necessitam processamento" : "Tudo processado"}
          />
        </div>

        <div className="flex bg-yellow justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Atribuição de Respostas</h2>
          <ProcessResponsesButton onSuccess={fetchData} />
        </div>

        <Tabs defaultValue="recent" className="mb-8">
          <TabsList>
            <TabsTrigger value="recent">Atribuições Recentes</TabsTrigger>
            <TabsTrigger value="all">Todas as Atribuições</TabsTrigger>
          </TabsList>
          <TabsContent value="recent">
            <AssignmentTable 
              assignments={assignments.slice(0, 10)} 
              isLoading={isLoading} 
            />
          </TabsContent>
          <TabsContent value="all">
            <AssignmentTable 
              assignments={assignments} 
              isLoading={isLoading} 
            />
          </TabsContent>
        </Tabs>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-8">
          <h3 className="font-semibold text-blue-800 mb-2">Como funciona a atribuição</h3>
          <p className="text-blue-700 text-sm">
            As respostas são atribuídas aos utilizadores ativos em ordem de antiguidade (do mais antigo ao mais recente).
            Quando o último utilizador recebe uma resposta, o sistema volta ao início da lista.
            Utilizadores que mudam para "Não Ativo" deixam de receber respostas, e utilizadores que voltam a ficar "Ativo" 
            são colocados no final da lista.
          </p>
        </div>
      </PageContainer>
    </>
  );
};

export default Dashboard;
