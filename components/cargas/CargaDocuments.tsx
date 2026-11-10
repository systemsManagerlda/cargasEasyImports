/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { Documento } from '../../lib/types/carga';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Alert } from '../ui/Alert';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import {
  FileText,
  Upload,
  Download,
  Eye,
  Trash2,
  File,
  Image as ImageIcon,
  FileSpreadsheet,
  FileArchive,
  FileJson,
  File as FileIcon,
  Video,
  Music,
  Search,
  X,
  Plus,
  RefreshCw,
  Clock,
  User,
  Calendar,
  Filter,
} from 'lucide-react';
import { formatDate, formatFileSize } from '../../lib/utils/format';
import { cn } from '../../lib/utils/cn';

interface CargaDocumentsProps {
  documentos: Documento[];
  onUpload?: (files: FileList) => Promise<void>;
  onDelete?: (documentoId: string) => Promise<void>;
  onDownload?: (documento: Documento) => void;
  onRefresh?: () => void;
  loading?: boolean;
  canUpload?: boolean;
  canDelete?: boolean;
  className?: string;
}

const tipoDocumentoOptions = [
  { value: 'todos', label: 'Todos os tipos' },
  { value: 'guia_transporte', label: 'Guia de Transporte' },
  { value: 'conhecimento_embarque', label: 'Conhecimento de Embarque' },
  { value: 'fatura', label: 'Fatura' },
  { value: 'lista_embalagem', label: 'Lista de Embalagem' },
  { value: 'certificado_origem', label: 'Certificado de Origem' },
  { value: 'certificado_seguro', label: 'Certificado de Seguro' },
  { value: 'declaracao_aduaneira', label: 'Declaração Aduaneira' },
  { value: 'licenca_importacao', label: 'Licença de Importação' },
  { value: 'licenca_exportacao', label: 'Licença de Exportação' },
  { value: 'inspecao', label: 'Inspeção' },
  { value: 'outro', label: 'Outro' },
];

export const CargaDocuments: React.FC<CargaDocumentsProps> = ({
  documentos,
  onUpload,
  onDelete,
  onDownload,
  onRefresh,
  loading = false,
  canUpload = true,
  canDelete = true,
  className,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('todos');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Documento | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const getFileIcon = (tipo?: string, formato?: string) => {
    // Mapeamento por tipo
    if (tipo) {
      const iconMap: Record<string, React.ReactNode> = {
        'guia_transporte': <FileText className="w-5 h-5 text-blue-500" />,
        'conhecimento_embarque': <FileText className="w-5 h-5 text-indigo-500" />,
        'fatura': <FileSpreadsheet className="w-5 h-5 text-green-500" />,
        'lista_embalagem': <FileText className="w-5 h-5 text-purple-500" />,
        'certificado_origem': <FileText className="w-5 h-5 text-orange-500" />,
        'certificado_seguro': <FileText className="w-5 h-5 text-red-500" />,
        'declaracao_aduaneira': <FileText className="w-5 h-5 text-yellow-500" />,
        'licenca_importacao': <FileText className="w-5 h-5 text-teal-500" />,
        'licenca_exportacao': <FileText className="w-5 h-5 text-cyan-500" />,
        'inspecao': <FileText className="w-5 h-5 text-pink-500" />,
      };
      return iconMap[tipo] || <File className="w-5 h-5 text-gray-500" />;
    }

    // Mapeamento por formato
    if (formato) {
      const formatMap: Record<string, React.ReactNode> = {
        'pdf': <FileText className="w-5 h-5 text-red-500" />,
        'jpg': <ImageIcon className="w-5 h-5 text-blue-500" />,
        'jpeg': <ImageIcon className="w-5 h-5 text-blue-500" />,
        'png': <ImageIcon className="w-5 h-5 text-blue-500" />,
        'gif': <ImageIcon className="w-5 h-5 text-blue-500" />,
        'webp': <ImageIcon className="w-5 h-5 text-blue-500" />,
        'mp4': <Video className="w-5 h-5 text-purple-500" />,
        'mp3': <Music className="w-5 h-5 text-green-500" />,
        'xlsx': <FileSpreadsheet className="w-5 h-5 text-green-500" />,
        'xls': <FileSpreadsheet className="w-5 h-5 text-green-500" />,
        'docx': <FileText className="w-5 h-5 text-blue-500" />,
        'doc': <FileText className="w-5 h-5 text-blue-500" />,
        'zip': <FileArchive className="w-5 h-5 text-yellow-500" />,
        'rar': <FileArchive className="w-5 h-5 text-yellow-500" />,
        'json': <FileJson className="w-5 h-5 text-orange-500" />,
      };
      return formatMap[formato.toLowerCase()] || <File className="w-5 h-5 text-gray-500" />;
    }

    return <File className="w-5 h-5 text-gray-500" />;
  };

  const getTipoLabel = (tipo?: string) => {
    const option = tipoDocumentoOptions.find(opt => opt.value === tipo);
    return option ? option.label : tipo || 'Documento';
  };

  const filteredDocuments = documentos.filter(doc => {
    const matchSearch = doc.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.descricao && doc.descricao.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchTipo = filterTipo === 'todos' || doc.tipo === filterTipo;
    return matchSearch && matchTipo;
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(e.target.files);
      setUploadError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFiles || !onUpload) return;

    setUploading(true);
    setUploadError(null);

    try {
      await onUpload(selectedFiles);
      setShowUploadModal(false);
      setSelectedFiles(null);
      if (onRefresh) onRefresh();
    } catch (error: any) {
      setUploadError(error.message || 'Erro ao fazer upload dos documentos');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (documentoId: string) => {
    if (!onDelete) return;
    if (!confirm('Tem certeza que deseja excluir este documento?')) return;

    try {
      await onDelete(documentoId);
      if (onRefresh) onRefresh();
    } catch (error: any) {
      alert('Erro ao excluir documento: ' + error.message);
    }
  };

  const handlePreview = (doc: Documento) => {
    setSelectedDocument(doc);
    setShowPreview(true);
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="mt-2 text-sm text-gray-500">Carregando documentos...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                Documentos
                <Badge variant="gray" size="sm">
                  {documentos.length}
                </Badge>
              </CardTitle>
              <CardDescription>
                Documentos anexados à carga
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {canUpload && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowUploadModal(true)}
                  leftIcon={<Upload className="w-4 h-4" />}
                >
                  Upload
                </Button>
              )}
              {onRefresh && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRefresh}
                  disabled={loading}
                >
                  <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Barra de busca e filtros */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder="Buscar documentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-gray-400" />}
                rightIcon={
                  searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )
                }
                className="pl-10 pr-10"
              />
            </div>
            <div className="w-full sm:w-48">
              <Select
                options={tipoDocumentoOptions}
                value={filterTipo}
                onChange={(e) => setFilterTipo(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          {filteredDocuments.length === 0 ? (
            <div className="text-center py-8">
              {documentos.length === 0 ? (
                <>
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 font-medium">Nenhum documento anexado</p>
                  <p className="text-sm text-gray-400 mt-1">
                    {canUpload ? 'Clique em "Upload" para adicionar documentos' : 'Nenhum documento disponível'}
                  </p>
                </>
              ) : (
                <>
                  <Search className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 font-medium">Nenhum documento encontrado</p>
                  <p className="text-sm text-gray-400 mt-1">Tente ajustar os filtros de busca</p>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredDocuments.map((doc) => (
                <div
                  key={doc.documentoId}
                  className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200 group"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getFileIcon(doc.tipo, doc.formato)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 truncate">
                          {doc.nome}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <Badge variant="gray" size="sm">
                            {getTipoLabel(doc.tipo)}
                          </Badge>
                          {doc.formato && (
                            <Badge variant="gray" size="sm" className="uppercase">
                              {doc.formato}
                            </Badge>
                          )}
                          {doc.tamanhoKB && (
                            <span className="text-xs text-gray-500">
                              {formatFileSize(doc.tamanhoKB)}
                            </span>
                          )}
                        </div>
                        {doc.descricao && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {doc.descricao}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(doc.dataUpload)}
                          </span>
                          {doc.uploadPor?.nome && (
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {doc.uploadPor.nome}
                            </span>
                          )}
                          {doc.versao && doc.versao > 1 && (
                            <Badge variant="gray" size="sm">
                              v{doc.versao}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex items-start gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePreview(doc)}
                      className="p-1 h-8 w-8"
                      // title="Visualizar"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    {onDownload && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDownload(doc)}
                        className="p-1 h-8 w-8"
                        // title="Baixar"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                    {canDelete && onDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(doc.documentoId)}
                        className="p-1 h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                        // title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Upload */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Upload de Documentos
                </h3>
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setSelectedFiles(null);
                    setUploadError(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {uploadError && (
                <Alert variant="danger" className="mb-4">
                  {uploadError}
                </Alert>
              )}

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">
                  {selectedFiles ? `${selectedFiles.length} arquivo(s) selecionado(s)` : 'Arraste ou clique para selecionar arquivos'}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Suporta PDF, JPG, PNG, DOC, XLS, e outros
                </p>
                <Input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Selecionar Arquivos
                </Button>
                {selectedFiles && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 ml-2"
                    onClick={() => setSelectedFiles(null)}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Limpar
                  </Button>
                )}
              </div>

              {selectedFiles && (
                <div className="mt-4 max-h-40 overflow-y-auto">
                  {Array.from(selectedFiles).map((file, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 text-sm">
                      <span className="truncate flex-1">{file.name}</span>
                      <span className="text-gray-400 ml-2">{formatFileSize(file.size / 1024)}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3 justify-end mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowUploadModal(false);
                    setSelectedFiles(null);
                    setUploadError(null);
                  }}
                  disabled={uploading}
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  onClick={handleUpload}
                  disabled={!selectedFiles || uploading}
                  loading={uploading}
                >
                  {uploading ? 'Enviando...' : 'Enviar Documentos'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Preview */}
      {showPreview && selectedDocument && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh]">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedDocument.nome}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {getTipoLabel(selectedDocument.tipo)}
                    {selectedDocument.formato && ` • ${selectedDocument.formato.toUpperCase()}`}
                    {selectedDocument.tamanhoKB && ` • ${formatFileSize(selectedDocument.tamanhoKB)}`}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowPreview(false);
                    setSelectedDocument(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-center min-h-[200px] max-h-[50vh] overflow-auto">
                {selectedDocument.formato?.toLowerCase() === 'pdf' ? (
                  <iframe
                    src={selectedDocument.url}
                    className="w-full h-[400px] rounded-lg"
                    title={selectedDocument.nome}
                  />
                ) : selectedDocument.formato?.toLowerCase().match(/jpg|jpeg|png|gif|webp/) ? (
                  <img
                    src={selectedDocument.url}
                    alt={selectedDocument.nome}
                    className="max-w-full max-h-[400px] object-contain"
                  />
                ) : (
                  <div className="text-center">
                    {getFileIcon(selectedDocument.tipo, selectedDocument.formato)}
                    <p className="mt-2 text-gray-500">
                      Pré-visualização não disponível para este formato
                    </p>
                    {onDownload && (
                      <Button
                        variant="primary"
                        size="sm"
                        className="mt-4"
                        onClick={() => onDownload(selectedDocument)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Baixar Arquivo
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {selectedDocument.descricao && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{selectedDocument.descricao}</p>
                </div>
              )}

              <div className="flex gap-3 justify-end mt-4">
                {onDownload && (
                  <Button
                    variant="outline"
                    onClick={() => onDownload(selectedDocument)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Baixar
                  </Button>
                )}
                <Button
                  variant="primary"
                  onClick={() => {
                    setShowPreview(false);
                    setSelectedDocument(null);
                  }}
                >
                  Fechar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};