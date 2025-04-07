
import React, { useEffect, useState } from 'react';
import { User } from '@/types';
import Header from '@/components/layout/Header';
import PageContainer from '@/components/layout/PageContainer';
import UserTable from '@/components/users/UserTable';
import { getAllUsers } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Settings, Plus, Loader2, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import AddUserDialog from '@/components/users/AddUserDialog';

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setConnectionError(false);
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setConnectionError(true);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao carregar os utilizadores.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-brand-700 dark:text-brand-400" />
        </div>
      );
    }

    if (connectionError) {
      return (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center dark:bg-amber-950/20 dark:border-amber-900">
          <h3 className="text-lg font-semibold text-amber-800 mb-3 dark:text-amber-400">Erro de conexão ao Supabase</h3>
          <p className="text-amber-700 mb-4 dark:text-amber-300">
            Não foi possível conectar ao banco de dados. Por favor, verifique suas credenciais do Supabase.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={fetchUsers} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Tentar novamente
            </Button>
            <Button asChild variant="default">
              <Link to="/settings">
                <Settings className="mr-2 h-4 w-4" />
                Configurar credenciais
              </Link>
            </Button>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="mb-6 flex justify-between items-center">
          <div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total: {users.length} utilizadores
            </span>
            <span className="mx-2 text-gray-300 dark:text-gray-600">|</span>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Ativos: {users.filter(user => user.status === 'Ativo').length} utilizadores
            </span>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline"
              size="sm"
              onClick={fetchUsers}
              className="text-sm"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Atualizar lista
            </Button>
            <Button 
              variant="default"
              size="sm"
              onClick={() => setAddUserDialogOpen(true)}
              className="text-sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Utilizador
            </Button>
          </div>
        </div>
        <UserTable users={users} onUsersChange={fetchUsers} />
      </>
    );
  };

  return (
    <>
      <Header />
      <PageContainer 
        title="Utilizadores" 
        description="Gerencie os utilizadores qualificados para receber respostas"
      >
        {renderContent()}

        {!isLoading && !connectionError && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-8 dark:bg-blue-900/20 dark:border-blue-800">
            <h3 className="font-semibold text-blue-800 mb-2 dark:text-blue-300">Informação sobre status</h3>
            <p className="text-blue-700 text-sm dark:text-blue-400">
              Apenas utilizadores com status "Ativo" recebem respostas. Sempre que um utilizador muda para "Não Ativo", 
              ele é removido da lista de atribuição. Quando um utilizador volta a ser "Ativo", é colocado no fim da lista.
            </p>
          </div>
        )}

        <AddUserDialog 
          open={addUserDialogOpen} 
          onOpenChange={setAddUserDialogOpen} 
          onSuccess={fetchUsers}
        />
      </PageContainer>
    </>
  );
};

export default UsersPage;
