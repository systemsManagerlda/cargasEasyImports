/* eslint-disable @typescript-eslint/no-explicit-any */
// components/cargas/CargaMap.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Navigation, RefreshCw, ZoomIn, ZoomOut, Maximize, Minimize } from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils/cn';
import { formatDate } from '../../lib/utils/format';

// Importar Leaflet apenas no cliente
import dynamic from 'next/dynamic';

// Importar CSS do Leaflet
import 'leaflet/dist/leaflet.css';

// Importar dinamicamente os componentes do React-Leaflet
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

const Polyline = dynamic(
  () => import('react-leaflet').then((mod) => mod.Polyline),
  { ssr: false }
);

const Circle = dynamic(
  () => import('react-leaflet').then((mod) => mod.Circle),
  { ssr: false }
);

// Corrigir ícones do Leaflet
import L from 'leaflet';

// Ícones personalizados
const createIcon = (color: string, label: string, bgColor: string = 'white') => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${bgColor}; width: 32px; height: 32px; border-radius: 50%; border: 3px solid ${color}; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; color: ${color};">${label}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

// Ícones predefinidos
const ICONS = {
  current: L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: #3b82f6; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -8],
  }),
  origin: createIcon('#22c55e', 'O', '#22c55e20'),
  destino: createIcon('#ef4444', 'D', '#ef444420'),
  routePoint: L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: #eab308; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
    popupAnchor: [0, -6],
  }),
  history: L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: #9ca3af; width: 10px; height: 10px; border-radius: 50%; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.2);"></div>`,
    iconSize: [10, 10],
    iconAnchor: [5, 5],
    popupAnchor: [0, -5],
  }),
};

interface Coordenadas {
  latitude: number;
  longitude: number;
}

interface Localizacao {
  latitude: number;
  longitude: number;
  altitude?: number;
  velocidade?: number;
  direcao?: number;
  precisao?: number;
  endereco?: string;
  cidade?: string;
  pais?: string;
  dataHora: string;
  fonte: 'gps' | 'manual' | 'sistema' | 'transportador';
}

interface CargaMapProps {
  localizacaoAtual: Localizacao | null;
  historicoLocalizacoes?: Localizacao[];
  origem?: {
    endereco: string;
    cidade: string;
    pais: string;
    coordenadas?: Coordenadas;
  };
  destino?: {
    endereco: string;
    cidade: string;
    pais: string;
    coordenadas?: Coordenadas;
  };
  rota?: {
    distanciaTotalKm?: number;
    tempoEstimadoHoras?: number;
    pontosPassagem?: Array<{ ordem: number; nome: string; cidade: string; pais: string; coordenadas?: Coordenadas; tempoEstimadoChegada?: string; tempoRealChegada?: string; observacao?: string }>;
    coordenadasRota?: Array<{ latitude: number; longitude: number; timestamp?: string; velocidade?: number; altitude?: number }>;
    desvioPermitidoKm?: number;
    rotaOtimizada?: boolean;
    rotaAlternativa?: Array<{ descricao: string; distanciaKm: number; tempoEstimadoHoras: number; motivo: string }>;
  };
  onRefresh?: () => void;
  loading?: boolean;
  className?: string;
  height?: string | number;
}

export const CargaMap: React.FC<CargaMapProps> = ({
  localizacaoAtual,
  historicoLocalizacoes = [],
  origem,
  destino,
  rota,
  onRefresh,
  loading = false,
  className,
  height = '450px',
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapInstance, setMapInstance] = useState<any>(null);


  // Determinar o centro do mapa
  const getMapCenter = (): [number, number] => {
    if (localizacaoAtual) {
      return [localizacaoAtual.latitude, localizacaoAtual.longitude];
    }
    if (origem?.coordenadas) {
      return [origem.coordenadas.latitude, origem.coordenadas.longitude];
    }
    if (destino?.coordenadas) {
      return [destino.coordenadas.latitude, destino.coordenadas.longitude];
    }
    return [-25.969248, 32.573174]; // Maputo
  };

  // Determinar o nível de zoom
  const getMapZoom = (): number => {
    if (localizacaoAtual || origem?.coordenadas || destino?.coordenadas) {
      return 13;
    }
    return 10;
  };

  // Criar rota (linha) entre os pontos
  const getRoutePoints = (): [number, number][] => {
    if (rota?.coordenadasRota && rota.coordenadasRota.length > 1) {
      return rota.coordenadasRota.map(p => [p.latitude, p.longitude]);
    }
    const passagens = (rota?.pontosPassagem || [])
      .filter(p => p.coordenadas)
      .sort((a,b) => a.ordem - b.ordem)
      .map(p => [p.coordenadas!.latitude, p.coordenadas!.longitude] as [number, number]);
    const points: [number, number][] = [];
    if (origem?.coordenadas) points.push([origem.coordenadas.latitude, origem.coordenadas.longitude]);
    points.push(...passagens);
    if (localizacaoAtual) points.push([localizacaoAtual.latitude, localizacaoAtual.longitude]);
    if (destino?.coordenadas) points.push([destino.coordenadas.latitude, destino.coordenadas.longitude]);
    return points;
  };

  // Criar histórico (linha) entre as localizações
  const getHistoricoPoints = (): [number, number][] => {
    if (historicoLocalizacoes.length < 2) {
      return [];
    }
    return historicoLocalizacoes.map(loc => [loc.latitude, loc.longitude]);
  };

  useEffect(() => {
    if (!mapInstance) return;
    const points = getRoutePoints();
    if (points.length > 1) {
      mapInstance.fitBounds(points, { padding: [32, 32], maxZoom: 13 });
    }
  }, [mapInstance, localizacaoAtual?.latitude, localizacaoAtual?.longitude, rota?.coordenadasRota?.length, rota?.pontosPassagem?.length, origem?.coordenadas?.latitude, origem?.coordenadas?.longitude, destino?.coordenadas?.latitude, destino?.coordenadas?.longitude]);

  // Se não estiver montado ou em loading, mostrar loading
  if (loading) {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-gray-700 flex items-center gap-2">
            <Navigation className="w-5 h-5 text-blue-500" />
            Mapa de Localização
          </CardTitle>
          <CardDescription>Carregando mapa...</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex items-center justify-center" style={{ height }}>
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="mt-4 text-gray-500">Carregando mapa...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="text-gray-700 flex items-center gap-2">
              <Navigation className="w-5 h-5 text-blue-500" />
              Mapa de Localização
              {rota?.distanciaTotalKm != null && (
                <span className="text-xs text-gray-500">{rota.distanciaTotalKm.toFixed(0)} km</span>
              )}
              {localizacaoAtual && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                  Ao Vivo
                </span>
              )}
            </CardTitle>
            <CardDescription className='text-gray-700'>
              {localizacaoAtual 
                ? `Última atualização: ${formatDate(localizacaoAtual.dataHora)}`
                : 'Aguardando dados de localização'
              }
            </CardDescription>
          </div>
          <div className="flex gap-2">
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div 
          className={cn(
            'relative w-full transition-all duration-300',
            isFullscreen ? 'fixed inset-0 z-50 h-screen' : ''
          )}
          style={{ height: isFullscreen ? '100vh' : height }}
        >
          <MapContainer
            center={getMapCenter()}
            zoom={getMapZoom()}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
            ref={(ref) => setMapInstance(ref)}
          >
            {/* Camada de tiles do mapa */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Rota (linha entre pontos) */}
            {getRoutePoints().length > 1 && (
              <Polyline
                positions={getRoutePoints()}
                color="#3b82f6"
                weight={3}
                opacity={0.7}
                dashArray={[10, 5]}
              />
            )}

            {/* Histórico de localizações */}
            {getHistoricoPoints().length > 1 && (
              <Polyline
                positions={getHistoricoPoints()}
                color="#9ca3af"
                weight={2}
                opacity={0.5}
                dashArray={[5, 5]}
              />
            )}

            {/* Pontos de passagem da rota definida no schema */}
            {(rota?.pontosPassagem || []).filter(p => p.coordenadas).sort((a,b) => a.ordem - b.ordem).map((p) => (
              <Marker key={`passagem-${p.ordem}-${p.nome}`} position={[p.coordenadas!.latitude, p.coordenadas!.longitude]} icon={ICONS.routePoint}>
                <Popup>
                  <div className="text-sm"><strong>{p.ordem}. {p.nome}</strong><br/>{p.cidade}, {p.pais}{p.observacao ? <><br/><span>{p.observacao}</span></> : null}</div>
                </Popup>
              </Marker>
            ))}

            {/* Marcador de Origem */}
            {origem?.coordenadas && (
              <Marker
                position={[origem.coordenadas.latitude, origem.coordenadas.longitude]}
                icon={ICONS.origin}
              >
                <Popup>
                  <div className="text-sm">
                    <p className="font-semibold text-green-600">📍 Origem</p>
                    <p className="text-gray-600">{origem.endereco}</p>
                    <p className="text-gray-500 text-xs">{origem.cidade}, {origem.pais}</p>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Marcador de Destino */}
            {destino?.coordenadas && (
              <Marker
                position={[destino.coordenadas.latitude, destino.coordenadas.longitude]}
                icon={ICONS.destino}
              >
                <Popup>
                  <div className="text-sm">
                    <p className="font-semibold text-red-600">📍 Destino</p>
                    <p className="text-gray-600">{destino.endereco}</p>
                    <p className="text-gray-500 text-xs">{destino.cidade}, {destino.pais}</p>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Histórico de Localizações (marcadores) */}
            {historicoLocalizacoes.map((loc, index) => (
              <Circle
                key={index}
                center={[loc.latitude, loc.longitude]}
                radius={15}
                color="#9ca3af"
                fillColor="#d1d5db"
                fillOpacity={0.5}
                weight={1}
              >
                <Popup>
                  <div className="text-sm">
                    <p className="font-medium text-gray-600">📍 Histórico #{index + 1}</p>
                    <p className="text-gray-500 text-xs">{formatDate(loc.dataHora)}</p>
                    {loc.cidade && <p className="text-gray-500 text-xs">{loc.cidade}</p>}
                    {loc.velocidade !== undefined && (
                      <p className="text-gray-500 text-xs">Velocidade: {loc.velocidade} km/h</p>
                    )}
                  </div>
                </Popup>
              </Circle>
            ))}

            {/* Marcador de Localização Atual */}
            {localizacaoAtual && (
              <>
                <Marker
                  position={[localizacaoAtual.latitude, localizacaoAtual.longitude]}
                  icon={ICONS.current}
                >
                  <Popup>
                    <div className="text-sm">
                      <p className="font-semibold text-blue-600">📍 Localização Atual</p>
                      {localizacaoAtual.endereco && (
                        <p className="text-gray-600">{localizacaoAtual.endereco}</p>
                      )}
                      {localizacaoAtual.cidade && (
                        <p className="text-gray-500 text-xs">{localizacaoAtual.cidade}</p>
                      )}
                      <div className="mt-1 flex gap-2 text-xs text-gray-500">
                        {localizacaoAtual.velocidade !== undefined && (
                          <span>Vel: {localizacaoAtual.velocidade} km/h</span>
                        )}
                        <span>Fonte: {localizacaoAtual.fonte}</span>
                      </div>
                      <p className="text-gray-400 text-xs mt-1">
                        {formatDate(localizacaoAtual.dataHora)}
                      </p>
                    </div>
                  </Popup>
                </Marker>
                {/* Círculo de precisão */}
                {localizacaoAtual.precisao && localizacaoAtual.precisao > 0 && (
                  <Circle
                    center={[localizacaoAtual.latitude, localizacaoAtual.longitude]}
                    radius={localizacaoAtual.precisao}
                    color="#3b82f6"
                    fillColor="#3b82f6"
                    fillOpacity={0.1}
                    weight={1}
                    dashArray={[3, 3]}
                  />
                )}
              </>
            )}

            {/* Legenda */}
            <div className="leaflet-control leaflet-bar leaflet-control-custom bg-white/95 rounded-lg shadow-lg p-3 text-xs" style={{ margin: '10px' }}>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500 border border-white shadow-sm" />
                  <span className="text-gray-700">Localização Atual</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500 border border-white shadow-sm" />
                  <span className="text-gray-700">Origem</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500 border border-white shadow-sm" />
                  <span className="text-gray-700">Destino</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gray-400" />
                  <span className="text-gray-700">Histórico</span>
                </div>
                <div className="flex items-center gap-2 border-t border-gray-200 pt-1.5 mt-1">
                  <div className="w-6 h-0.5 bg-blue-500" />
                  <span className="text-gray-700">Rota</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-0.5 bg-gray-400 border-t border-gray-300 border-dashed" />
                  <span className="text-gray-700">Histórico de Rota</span>
                </div>
              </div>
            </div>

            {/* Controles de Zoom personalizados */}
            <div className="leaflet-control leaflet-bar leaflet-control-zoom-custom absolute bottom-4 right-4 flex flex-col gap-1" style={{ margin: '10px' }}>
              <button
                onClick={() => {
                  if (mapInstance) {
                    mapInstance.setZoom(mapInstance.getZoom() + 1);
                  }
                }}
                className="w-8 h-8 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-600 border border-gray-200"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  if (mapInstance) {
                    mapInstance.setZoom(mapInstance.getZoom() - 1);
                  }
                }}
                className="w-8 h-8 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-600 border border-gray-200"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
            </div>
          </MapContainer>

          {/* Status da localização */}
          {localizacaoAtual && (
            <div className="absolute bottom-4 left-4 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5 text-xs text-green-700 flex items-center gap-1.5 z-10">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span>Atualizado agora</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};