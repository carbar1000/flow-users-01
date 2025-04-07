
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createUser } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const userSchema = z.object({
  name: z.string().min(2, { message: 'O nome deve ter pelo menos 2 caracteres' }),
  email: z.string().email({ message: 'Email inválido' }),
  brevo_api_key: z.string().optional(),
  brevo_sender_name: z.string().optional(),
  brevo_sender_email: z.string().email({ message: 'Email do remetente inválido' }).optional(),
  contact_list_brevo: z.string().optional(),
  ai_provider: z.enum(['nenhum', 'openai', 'perplexity']).default('nenhum'),
  ai_api_key: z.string().optional(),
});

type FormValues = z.infer<typeof userSchema>;

const AddUserDialog: React.FC<AddUserDialogProps> = ({ open, onOpenChange, onSuccess }) => {
  const { toast } = useToast();
  const form = useForm<FormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      brevo_api_key: '',
      brevo_sender_name: '',
      brevo_sender_email: '',
      contact_list_brevo: '',
      ai_provider: 'nenhum',
      ai_api_key: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      await createUser({
        name: data.name,
        email: data.email,
        brevo_api_key: data.brevo_api_key || null,
        brevo_sender_name: data.brevo_sender_name || null,
        brevo_sender_email: data.brevo_sender_email || null,
        contact_list_brevo: data.contact_list_brevo || null,
        status: 'Ativo',
        ai_provider: data.ai_provider === 'nenhum' ? null : data.ai_provider,
        ai_api_key: data.ai_provider === 'nenhum' ? null : data.ai_api_key || null,
      });

      toast({
        title: "Utilizador criado",
        description: "O utilizador foi criado com sucesso.",
      });

      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Erro ao criar utilizador:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao criar o utilizador.",
        variant: "destructive",
      });
    }
  };

  const aiProvider = form.watch('ai_provider');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Utilizador</DialogTitle>
          <DialogDescription>
            Preencha os dados para adicionar um novo utilizador ao sistema.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do utilizador" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="email@exemplo.com" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-md dark:bg-gray-800">
              <h3 className="text-sm font-medium mb-3 text-gray-800 dark:text-gray-200">Configuração do Brevo</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="brevo_api_key"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>API Key Brevo</FormLabel>
                      <FormControl>
                        <Input placeholder="chave-api-brevo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="brevo_sender_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Remetente</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome da Empresa" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="brevo_sender_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email do Remetente</FormLabel>
                      <FormControl>
                        <Input placeholder="contato@empresa.com" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contact_list_brevo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ID da Lista de Contatos</FormLabel>
                      <FormControl>
                        <Input placeholder="ID da lista no Brevo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-md dark:bg-gray-800">
              <h3 className="text-sm font-medium mb-3 text-gray-800 dark:text-gray-200">Integração com IA</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="ai_provider"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Provedor de IA</FormLabel>
                      <FormControl>
                        <select 
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                        >
                          <option value="nenhum">Nenhum</option>
                          <option value="openai">OpenAI</option>
                          <option value="perplexity">Perplexity</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {aiProvider !== 'nenhum' && (
                  <FormField
                    control={form.control}
                    name="ai_api_key"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>API Key {aiProvider === 'openai' ? 'OpenAI' : 'Perplexity'}</FormLabel>
                        <FormControl>
                          <Input placeholder={`Chave API ${aiProvider}`} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">Adicionar Utilizador</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserDialog;
