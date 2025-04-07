
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { manuallyProcessUnassignedResponses } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';

interface ProcessResponsesButtonProps {
  onSuccess?: () => void;
}

const ProcessResponsesButton: React.FC<ProcessResponsesButtonProps> = ({ onSuccess }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleProcessResponses = async () => {
    try {
      setIsProcessing(true);
      await manuallyProcessUnassignedResponses();
      toast({
        title: "Sucesso",
        description: "As respostas foram processadas e atribuídas com sucesso.",
      });
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error processing responses:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao processar as respostas.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Button
      className="bg-brand-600 hover:bg-brand-700"
      disabled={isProcessing}
      onClick={handleProcessResponses}
    >
      {isProcessing ? 'Processando...' : 'Processar Respostas Não Atribuídas'}
    </Button>
  );
};

export default ProcessResponsesButton;
