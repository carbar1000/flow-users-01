
import React, { useState } from 'react';
import { User } from '@/types';
import { Button } from '@/components/ui/button';
import { updateUserStatus } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';
import { Pencil, Send, UserCheck, UserX } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import EditUserDialog from './EditUserDialog';
import TestApiDialog from './TestApiDialog';

interface UserTableProps {
  users: User[];
  onUsersChange: () => void;
}

const UserTable: React.FC<UserTableProps> = ({ users, onUsersChange }) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [testApiDialogOpen, setTestApiDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleStatusChange = async (userId: string, newStatus: 'Ativo' | 'Não Ativo') => {
    try {
      setLoading(userId);
      await updateUserStatus(userId, newStatus);
      onUsersChange();
      toast({
        title: "Status atualizado",
        description: `O utilizador foi ${newStatus === 'Ativo' ? 'ativado' : 'desativado'} com sucesso.`,
      });
    } catch (error) {
      console.error('Error updating user status:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status do utilizador.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  const handleTestApi = (user: User) => {
    setSelectedUser(user);
    setTestApiDialogOpen(true);
  };

  const hasBrevoConfig = (user: User) => {
    return !!(user.brevo_api_key && user.brevo_sender_name && user.brevo_sender_email);
  };

  const hasAiConfig = (user: User) => {
    return !!(user.ai_provider && user.ai_api_key);
  };

  return (
    <>
      <div className="bg-white shadow rounded-lg overflow-hidden dark:bg-gray-800">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Integrações</TableHead>
                <TableHead>Data de Criação</TableHead>
                <TableHead>Última Atualização</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className={user.status === 'Não Ativo' ? 'bg-gray-50 dark:bg-gray-900/30' : ''}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="text-sm text-gray-500 dark:text-gray-400">{user.email}</TableCell>
                  <TableCell>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.status === 'Ativo' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                    }`}>
                      {user.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {hasBrevoConfig(user) && (
                        <span className="px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                          Brevo
                        </span>
                      )}
                      {hasAiConfig(user) && (
                        <span className="px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">
                          {user.ai_provider === 'openai' ? 'OpenAI' : 'Perplexity'}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(user.created_at)}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(user.status_updated_at)}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(user)}
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Editar
                    </Button>

                    {(hasBrevoConfig(user) || hasAiConfig(user)) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTestApi(user)}
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Testar
                      </Button>
                    )}

                    <Button
                      variant={user.status === 'Ativo' ? 'destructive' : 'secondary'}
                      size="sm"
                      disabled={loading === user.id}
                      onClick={() => handleStatusChange(
                        user.id, 
                        user.status === 'Ativo' ? 'Não Ativo' : 'Ativo'
                      )}
                    >
                      {loading === user.id ? (
                        'Atualizando...'
                      ) : (
                        <>
                          {user.status === 'Ativo' ? (
                            <>
                              <UserX className="h-4 w-4 mr-1" />
                              Desativar
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-4 w-4 mr-1" />
                              Ativar
                            </>
                          )}
                        </>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <EditUserDialog 
        user={selectedUser} 
        open={editDialogOpen} 
        onOpenChange={setEditDialogOpen} 
        onSuccess={onUsersChange}
      />

      <TestApiDialog
        user={selectedUser}
        open={testApiDialogOpen}
        onOpenChange={setTestApiDialogOpen}
      />
    </>
  );
};

export default UserTable;
