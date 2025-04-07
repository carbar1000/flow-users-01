
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { updateSupabaseCredentials } from '@/services/api';

const formSchema = z.object({
  supabaseUrl: z.string().url("URL do Supabase inválida").min(1, "URL do Supabase é obrigatória"),
  supabaseKey: z.string().min(1, "Chave do Supabase é obrigatória"),
});

interface SupabaseCredentialsFormProps {
  isConnected: boolean;
  onConnectionStatusChange: (status: boolean) => void;
}

const SupabaseCredentialsForm: React.FC<SupabaseCredentialsFormProps> = ({ 
  isConnected,
  onConnectionStatusChange 
}) => {
  const [isTesting, setIsTesting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      supabaseUrl: localStorage.getItem('SUPABASE_URL') || '',
      supabaseKey: localStorage.getItem('SUPABASE_KEY') || '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsTesting(true);
      
      // Guarda as credenciais no localStorage
      localStorage.setItem('SUPABASE_URL', values.supabaseUrl);
      localStorage.setItem('SUPABASE_KEY', values.supabaseKey);
      
      // Teste de conexão
      const testSupabase = updateSupabaseCredentials(values.supabaseUrl, values.supabaseKey);
      const { data, error } = await testSupabase
        .from('users')
        .select('count')
        .limit(1);
      
      if (error) {
        throw new Error(`Erro na conexão: ${error.message}`);
      }
      
      toast({
        title: "Sucesso",
        description: "Conectado ao Supabase com sucesso!",
      });
      
      onConnectionStatusChange(true);
    } catch (error: any) {
      console.error('Error testing Supabase connection:', error);
      toast({
        title: "Erro de conexão",
        description: error.message || "Não foi possível conectar ao Supabase. Verifique suas credenciais.",
        variant: "destructive",
      });
      onConnectionStatusChange(false);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Credenciais do Supabase</CardTitle>
        <CardDescription>
          Configure suas credenciais do Supabase para conectar ao banco de dados
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="supabaseUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL do Supabase</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://seu-projeto.supabase.co" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="supabaseKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chave do Supabase (anon key ou service_role key)</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="Sua chave do Supabase" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex items-center gap-2">
              <Button 
                type="submit" 
                disabled={isTesting}
                className="flex-1"
              >
                {isTesting ? 'Testando conexão...' : 'Salvar e testar conexão'}
              </Button>
              
              {isConnected && (
                <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  Conectado
                </div>
              )}
            </div>
            
            <div className="mt-2 text-xs text-gray-500">
              <p>A chave e URL serão salvas apenas no seu navegador. Nenhuma informação sensível é enviada aos nossos servidores.</p>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default SupabaseCredentialsForm;
