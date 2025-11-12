import { useState } from 'react';
import { Target, Plus, Calendar, DollarSign, Users, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

export function MediaPlanView() {
  const [isCreating, setIsCreating] = useState(false);

  return (
    <div className="flex-1 bg-stone-25 p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-stone-900 mb-3">Criação de Planos de Mídia</h1>
            <p className="text-stone-600 text-lg">Sistema inteligente para planejamento estratégico de mídia</p>
          </div>
          
          <Button 
            onClick={() => setIsCreating(true)}
            className="bg-stone-900 hover:bg-stone-800 text-white"
          >
            <Plus size={16} className="mr-2" />
            Criar Novo Plano
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-stone-600">Planos Ativos</CardTitle>
                <Target className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-stone-900">12</div>
                <p className="text-xs text-stone-500">+2 este mês</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-stone-600">Budget Total</CardTitle>
                <DollarSign className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-stone-900">R$ 2.4M</div>
                <p className="text-xs text-stone-500">Planejado para Q4</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-stone-600">Campanhas Ativas</CardTitle>
                <Calendar className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-stone-900">8</div>
                <p className="text-xs text-stone-500">Em execução</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-stone-600">ROI Médio</CardTitle>
                <TrendingUp className="h-4 w-4 text-amber-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-stone-900">3.2x</div>
                <p className="text-xs text-stone-500">Últimos 6 meses</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Placeholder Content */}
        <Card>
          <CardHeader>
            <CardTitle>Sistema de Criação de Planos de Mídia</CardTitle>
            <CardDescription>
              Integre aqui o código do seu micro sistema existente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Target size={64} className="mx-auto text-stone-400 mb-4" />
              <h3 className="text-stone-700 mb-2">Pronto para Integração</h3>
              <p className="text-stone-500 mb-6">
                Cole o código do seu sistema de criação de planos de mídia aqui para integrar com o DreamFlow.
              </p>
              <div className="space-y-2 text-sm text-stone-600">
                <p><strong>Próximos passos:</strong></p>
                <ol className="list-decimal list-inside space-y-1 text-left max-w-md mx-auto">
                  <li>Compartilhe o código do seu sistema</li>
                  <li>Realizaremos a integração com o design do DreamFlow</li>
                  <li>Manteremos toda a funcionalidade existente</li>
                  <li>Adicionaremos melhorias de UX conforme necessário</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}