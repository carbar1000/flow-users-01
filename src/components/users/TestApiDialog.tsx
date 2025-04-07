
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { sendBrevoEmail, testAIIntegration } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';
import { User } from '@/types';
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
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TestApiDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const brevoSchema = z.object({
  recipientEmail: z.string().email({ message: 'Email inválido' }),
  subject: z.string().min(1, { message: 'Assunto é obrigatório' }),
  content: z.string().min(1, { message: 'Conteúdo é obrigatório' }),
});

const aiSchema = z.object({
  prompt: z.string().min(1, { message: 'Prompt é obrigatório' }),
});

type BrevoFormValues = z.infer<typeof brevoSchema>;
type AIFormValues = z.infer<typeof aiSchema>;

const TestApiDialog: React.FC<TestApiDialogProps> = ({ user, open, onOpenChange }) => {
  const { toast } = useToast();
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('brevo');

  const brevoForm = useForm<BrevoFormValues>({
    resolver: zodResolver(brevoSchema),
    defaultValues: {
      recipientEmail: '',
      subject: 'Teste de integração Brevo',
      content: '<p>Este é um email de teste enviado através da integração com o Brevo.</p>',
    },
  });

  const aiForm = useForm<AIFormValues>({
    resolver: zodResolver(aiSchema),
    defaultValues: {
      prompt: 'Explique brevemente o que é uma API de IA.',
    },
  });

  const testBrevo = async (data: BrevoFormValues) => {
    if (!user || !user.brevo_api_key || !user.brevo_sender_name || !user.brevo_sender_email) {
      toast({
        title: "Configuração incompleta",
        description: "O utilizador não tem as credenciais do Brevo configuradas.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setTestResult(null);

    try {
      await sendBrevoEmail(
        user.brevo_api_key,
        user.brevo_sender_name,
        user.brevo_sender_email,
        data.recipientEmail,
        data.subject,
        data.content
      );

      setTestResult('Email enviado com sucesso. Verifique a caixa de entrada do destinatário.');
      toast({
        title: "Teste concluído",
        description: "Email enviado com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao testar Brevo:', error);
      setTestResult(`Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      toast({
        title: "Erro",
        description: "Falha ao enviar email de teste.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testAI = async (data: AIFormValues) => {
    if (!user || !user.ai_provider || !user.ai_api_key) {
      toast({
        title: "Configuração incompleta",
        description: "O utilizador não tem as credenciais da IA configuradas.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setTestResult(null);

    try {
      const result = await testAIIntegration(
        user.ai_provider,
        user.ai_api_key,
        data.prompt
      );

      setTestResult(result);
      toast({
        title: "Teste concluído",
        description: "Resposta da IA recebida com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao testar IA:', error);
      setTestResult(`Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      toast({
        title: "Erro",
        description: "Falha ao testar a integração com IA.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Testar Integrações API</DialogTitle>
          <DialogDescription>
            Teste as integrações configuradas para {user?.name}.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="brevo" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="brevo">Brevo (Email)</TabsTrigger>
            <TabsTrigger 
              value="ai"
              disabled={!user?.ai_provider}
            >
              {user?.ai_provider === 'openai' ? 'OpenAI' : user?.ai_provider === 'perplexity' ? 'Perplexity' : 'IA'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="brevo" className="mt-4">
            <Form {...brevoForm}>
              <form onSubmit={brevoForm.handleSubmit(testBrevo)} className="space-y-4">
                <FormField
                  control={brevoForm.control}
                  name="recipientEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email do Destinatário</FormLabel>
                      <FormControl>
                        <Input placeholder="destinatario@exemplo.com" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={brevoForm.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assunto</FormLabel>
                      <FormControl>
                        <Input placeholder="Assunto do email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={brevoForm.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Conteúdo (HTML)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Conteúdo HTML do email" 
                          className="min-h-[100px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => onOpenChange(false)}
                  >
                    Fechar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isLoading || !user?.brevo_api_key}
                  >
                    {isLoading ? 'Enviando...' : 'Enviar Email de Teste'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="ai" className="mt-4">
            <Form {...aiForm}>
              <form onSubmit={aiForm.handleSubmit(testAI)} className="space-y-4">
                <FormField
                  control={aiForm.control}
                  name="prompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prompt para IA</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Digite seu prompt aqui..." 
                          className="min-h-[100px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => onOpenChange(false)}
                  >
                    Fechar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isLoading || !user?.ai_api_key}
                  >
                    {isLoading ? 'Processando...' : 'Testar IA'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>
        </Tabs>

        {testResult && (
          <div className={`mt-4 p-4 rounded-md ${testResult.startsWith('Erro') ? 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300' : 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300'}`}>
            <h4 className="font-medium mb-2">Resultado do Teste:</h4>
            <div className="text-sm whitespace-pre-wrap">{testResult}</div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TestApiDialog;
