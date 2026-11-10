// app/(dashboard)/ajuda/page.tsx
'use client'

import React, { useState } from 'react';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { 
  HelpCircle, 
  MessageSquare, 
  Mail, 
  Phone, 
  Clock, 
  ChevronDown,
  ChevronRight,
  Search,
  FileText,
  BookOpen,
  Video,
  Users,
  Shield,
  Truck,
  Package,
  DollarSign,
  Settings,
  User,
  Lock,
  Bell,
  Globe,
  Server,
  Database,
  Smartphone,
  Laptop,
  Wifi,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  ExternalLink,
  Send,
  RefreshCw,
  LifeBuoy,
  Headphones,
  Bookmark,
  Lightbulb,
  Award,
  Star,
  ThumbsUp,
  ThumbsDown,
  Home
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

// Tipos para FAQ
interface FAQItem {
  id: string;
  pergunta: string;
  resposta: string;
  categoria: string;
}

// Dados mockados de FAQ
const faqData: FAQItem[] = [
  {
    id: 'faq-001',
    categoria: 'geral',
    pergunta: 'Como faço para criar uma nova carga?',
    resposta: 'Para criar uma nova carga, acesse o menu "Cargas" e clique no botão "Nova Carga". Preencha todos os campos obrigatórios como descrição, peso, volume, origem, destino, cliente, transportador, motorista e viatura. Após preencher, clique em "Salvar" para criar a carga.'
  },
  {
    id: 'faq-002',
    categoria: 'geral',
    pergunta: 'Como rastrear uma carga?',
    resposta: 'Para rastrear uma carga, acesse o menu "Cargas" e clique no código de rastreio da carga desejada. Você verá todas as informações da carga, incluindo localização atual, histórico de localizações, status e etapas do transporte.'
  },
  {
    id: 'faq-003',
    categoria: 'cargas',
    pergunta: 'O que significa cada status de carga?',
    resposta: 'Os status de carga indicam a etapa atual do transporte:\n• Registada: Carga criada\n• Em Preparação: Carga sendo preparada\n• Pronta para Transporte: Carga pronta para ser transportada\n• Em Trânsito: Carga em movimento\n• Em Posto de Controlo: Carga em posto de controlo\n• Em Fronteira: Carga na fronteira\n• Em Porto: Carga no porto\n• Em Armazém: Carga em armazém\n• Em Distribuição: Carga em distribuição\n• Entregue: Carga entregue\n• Suspensa: Carga suspensa\n• Cancelada: Carga cancelada'
  },
  {
    id: 'faq-004',
    categoria: 'clientes',
    pergunta: 'Como adicionar um novo cliente?',
    resposta: 'Para adicionar um novo cliente, acesse o menu "Clientes" e clique no botão "Novo Cliente". Preencha as informações como nome, email, telefone, NIF e endereço. Clique em "Salvar" para criar o cliente.'
  },
  {
    id: 'faq-005',
    categoria: 'transportadores',
    pergunta: 'Como cadastrar um transportador?',
    resposta: 'Para cadastrar um transportador, acesse o menu "Transportadores" e clique no botão "Novo Transportador". Preencha as informações como nome, email, telefone, NIF, licença e endereço. Clique em "Salvar" para criar o transportador.'
  },
  {
    id: 'faq-006',
    categoria: 'seguranca',
    pergunta: 'Como alterar minha senha?',
    resposta: 'Para alterar sua senha, acesse o menu "Perfil" e clique na aba "Alterar Senha". Digite sua senha atual, a nova senha e confirme a nova senha. Clique em "Alterar Senha" para salvar as alterações.'
  },
  {
    id: 'faq-007',
    categoria: 'relatorios',
    pergunta: 'Como gerar um relatório?',
    resposta: 'Para gerar um relatório, acesse o menu "Relatórios" e clique no botão "Gerar Relatório". Selecione o tipo de relatório, formato, período e título. Clique em "Gerar" para criar o relatório.'
  },
  {
    id: 'faq-008',
    categoria: 'alertas',
    pergunta: 'O que são os alertas?',
    resposta: 'Os alertas são notificações sobre eventos importantes relacionados às cargas, como atrasos, incidentes, desvios de rota, paragens prolongadas, fronteiras, portos, manutenção, roubo ou danos à carga.'
  },
];

// Categorias de FAQ com ícones
const categoriasFAQ = [
  { id: 'todas', label: 'Todas as Perguntas', icon: HelpCircle },
  { id: 'geral', label: 'Geral', icon: Info },
  { id: 'cargas', label: 'Cargas', icon: Package },
  { id: 'clientes', label: 'Clientes', icon: Users },
  { id: 'transportadores', label: 'Transportadores', icon: Truck },
  { id: 'seguranca', label: 'Segurança', icon: Shield },
  { id: 'relatorios', label: 'Relatórios', icon: FileText },
  { id: 'alertas', label: 'Alertas', icon: Bell },
];

// Tópicos de ajuda
const topicosAjuda = [
  { id: 'primeiros-passos', label: 'Primeiros Passos', icon: BookOpen, description: 'Guia introdutório do sistema' },
  { id: 'tutoriais', label: 'Tutoriais em Vídeo', icon: Video, description: 'Vídeos explicativos' },
  { id: 'documentacao', label: 'Documentação', icon: FileText, description: 'Documentação completa do sistema' },
  { id: 'suporte', label: 'Suporte Técnico', icon: Headphones, description: 'Entre em contato com o suporte' },
];

export default function AjudaPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('todas');
  const [faqAbertas, setFaqAbertas] = useState<Set<string>>(new Set());
  const [mensagem, setMensagem] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [mensagemEnviada, setMensagemEnviada] = useState(false);

  // Filtrar FAQ
  const faqFiltradas = faqData.filter(item => {
    const matchCategoria = categoriaSelecionada === 'todas' || item.categoria === categoriaSelecionada;
    const matchSearch = searchTerm === '' || 
      item.pergunta.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.resposta.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategoria && matchSearch;
  });

  const toggleFaq = (id: string) => {
    setFaqAbertas(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleEnviarMensagem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mensagem.trim()) return;
    
    setEnviando(true);
    setTimeout(() => {
      setEnviando(false);
      setMensagemEnviada(true);
      setMensagem('');
      setTimeout(() => setMensagemEnviada(false), 5000);
    }, 1500);
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gray-100 rounded-full hidden sm:flex">
              <HelpCircle className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800">Central de Ajuda</h1>
              <p className="text-sm text-gray-500 hidden sm:block">
                Tire suas dúvidas e encontre suporte
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setCategoriaSelecionada('todas');
              }}
              className="border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              Limpar Filtros
            </Button>
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-4 sm:hidden">
          Tire suas dúvidas e encontre suporte
        </p>

        {/* Busca */}
        <div className="relative max-w-2xl mx-auto mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Pesquisar na central de ajuda..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 py-3 bg-gray-50 border-gray-200 focus:bg-white text-gray-700 placeholder:text-gray-400 rounded-xl"
          />
        </div>

        {/* Tópicos de Ajuda */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {topicosAjuda.map((topico) => {
            const Icon = topico.icon;
            return (
              <Card key={topico.id} className="border border-gray-100 shadow-sm hover:shadow-md transition-all hover:border-gray-300 cursor-pointer">
                <CardBody className="p-4 text-center">
                  <div className="p-3 bg-gray-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-6 h-6 text-gray-600" />
                  </div>
                  <h3 className="font-medium text-gray-800">{topico.label}</h3>
                  <p className="text-xs text-gray-500 mt-1">{topico.description}</p>
                </CardBody>
              </Card>
            );
          })}
        </div>

        {/* FAQ */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar de categorias */}
          <div className="lg:col-span-1">
            <Card className="border border-gray-100 shadow-sm sticky top-4">
              <CardBody className="p-2">
                <nav className="space-y-1">
                  {categoriasFAQ.map((cat) => {
                    const Icon = cat.icon;
                    const count = faqData.filter(f => cat.id === 'todas' || f.categoria === cat.id).length;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setCategoriaSelecionada(cat.id)}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm',
                          categoriaSelecionada === cat.id
                            ? 'bg-gray-100 text-gray-800 font-medium'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="flex-1 text-left">{cat.label}</span>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </nav>
              </CardBody>
            </Card>
          </div>

          {/* Lista de FAQ */}
          <div className="lg:col-span-3">
            <Card className="border border-gray-100 shadow-sm">
              <CardHeader className="border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">
                      Perguntas Frequentes
                    </h2>
                    <p className="text-sm text-gray-500">
                      {faqFiltradas.length} perguntas encontradas
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardBody className="p-4 md:p-6">
                {faqFiltradas.length === 0 ? (
                  <div className="text-center py-8">
                    <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Nenhuma pergunta encontrada</p>
                    <p className="text-sm text-gray-400">Tente ajustar os filtros ou a busca</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {faqFiltradas.map((item) => {
                      const isOpen = faqAbertas.has(item.id);
                      return (
                        <div
                          key={item.id}
                          className="border border-gray-100 rounded-lg overflow-hidden"
                        >
                          <button
                            onClick={() => toggleFaq(item.id)}
                            className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                          >
                            <span className="text-sm font-medium text-gray-800">
                              {item.pergunta}
                            </span>
                            {isOpen ? (
                              <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            )}
                          </button>
                          {isOpen && (
                            <div className="px-4 pb-3 text-sm text-gray-600 border-t border-gray-100 pt-3 whitespace-pre-wrap">
                              {item.resposta}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Contato de Suporte */}
        <div className="mt-8">
          <Card className="border border-gray-100 shadow-sm">
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Headphones className="w-5 h-5 text-gray-600" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Fale Conosco</h2>
                  <p className="text-sm text-gray-500">
                    Entre em contato com nossa equipe de suporte
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardBody className="p-4 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Email */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm text-gray-800">suporte@rastreio.co.mz</p>
                  </div>
                </div>
                
                {/* Telefone */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Telefone</p>
                    <p className="text-sm text-gray-800">+258 84 123 4567</p>
                  </div>
                </div>
                
                {/* Horário */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Horário</p>
                    <p className="text-sm text-gray-800">Seg-Sex, 8h - 17h</p>
                  </div>
                </div>
              </div>

              {/* Formulário de contato */}
              <form onSubmit={handleEnviarMensagem} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Envie sua mensagem
                  </label>
                  <div className="relative">
                    <textarea
                      value={mensagem}
                      onChange={(e) => setMensagem(e.target.value)}
                      placeholder="Descreva sua dúvida ou problema..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200 min-h-[100px] resize-y"
                    />
                  </div>
                </div>

                {mensagemEnviada && (
                  <Alert variant="success" dismissible>
                    Mensagem enviada com sucesso! Responderemos em breve.
                  </Alert>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={enviando}
                  disabled={!mensagem.trim()}
                  leftIcon={<Send className="w-4 h-4" />}
                  className="bg-gray-800 hover:bg-gray-900 text-white"
                >
                  {enviando ? 'Enviando...' : 'Enviar Mensagem'}
                </Button>
              </form>
            </CardBody>
          </Card>
        </div>

        {/* Links úteis */}
        <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-gray-500">
          <Link href="/perfil" className="hover:text-gray-700 transition-colors flex items-center gap-1">
            <User className="w-4 h-4" />
            Meu Perfil
          </Link>
          <span className="text-gray-300">|</span>
          <Link href="/configuracoes" className="hover:text-gray-700 transition-colors flex items-center gap-1">
            <Settings className="w-4 h-4" />
            Configurações
          </Link>
          <span className="text-gray-300">|</span>
          <Link href="/dashboard" className="hover:text-gray-700 transition-colors flex items-center gap-1">
            <Home className="w-4 h-4" />
            Dashboard
          </Link>
        </div>
      </div>
    </ProtectedRoute>
  );
}