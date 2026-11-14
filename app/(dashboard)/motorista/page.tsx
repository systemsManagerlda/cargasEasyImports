/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  MapPin,
  Navigation,
  Package,
  RefreshCw,
  Truck,
  ClipboardList,
  X,
} from "lucide-react";
import { useAuth } from "../../../lib/hooks/useAuth";
import { cargaApi, CargaListParams } from "../../../lib/api/cargas";
import { Carga } from "../../../lib/types/carga";
import { Button } from "../../../components/ui/Button";
import { Spinner } from "../../../components/ui/Spinner";
import { CargaStatusBadge } from "../../../components/cargas/CargaStatusBadge";

const PAGE_SIZE = 100;

const etapaOptions = [
  { value: "em_preparacao", label: "Preparação da carga" },
  { value: "em_transito", label: "Início / continuação da viagem" },
  { value: "posto_controlo", label: "Passagem por posto de controlo" },
  { value: "fronteira", label: "Passagem pela fronteira" },
  { value: "porto", label: "Chegada ao porto" },
  { value: "armazem", label: "Chegada ao armazém" },
  { value: "em_distribuicao", label: "Em distribuição" },
];

const occurrenceTypes = [
  { value: "atraso", label: "Atraso" },
  { value: "acidente", label: "Acidente" },
  { value: "avaria", label: "Avaria da viatura" },
  { value: "mercadoria_danificada", label: "Mercadoria danificada" },
  { value: "problema_documentacao", label: "Problema de documentação" },
  { value: "bloqueio_estrada", label: "Bloqueio / interrupção da estrada" },
  { value: "outro", label: "Outro" },
];

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("pt-MZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getPlace(address?: {
  endereco?: string;
  cidade?: string;
  pais?: string;
}) {
  if (!address) return "Local não indicado";
  return (
    [address.cidade, address.pais].filter(Boolean).join(", ") ||
    address.endereco ||
    "Local não indicado"
  );
}

function isDelivered(status?: string) {
  return (status || "").toLowerCase() === "recebida_integra";
}

export default function MotoristaDashboardPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [cargas, setCargas] = useState<Carga[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [selectedCarga, setSelectedCarga] = useState<Carga | null>(null);
  const [action, setAction] = useState<
    "etapa" | "ocorrencia" | "entrega" | null
  >(null);
  const [submitting, setSubmitting] = useState(false);
  const [etapa, setEtapa] = useState("em_transito");
  const [descricaoEtapa, setDescricaoEtapa] = useState("");
  const [tipoOcorrencia, setTipoOcorrencia] = useState("atraso");
  const [gravidade, setGravidade] = useState<
    "leve" | "moderada" | "grave" | "critica"
  >("moderada");
  const [descricaoOcorrencia, setDescricaoOcorrencia] = useState("");
  const [observacaoEntrega, setObservacaoEntrega] = useState("");
  const motoristaId = user?.perfil === "motorista" ? user?._id : undefined;

  const loadCargas = useCallback(
    async (quiet = false) => {
      if (!motoristaId) {
        setCargas([]);
        setError(
          "A sua conta não tem um identificador de motorista associado. Contacte a Central.",
        );
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (quiet) setRefreshing(true);
      else setLoading(true);
      setError("");

      try {
        const params: CargaListParams = {
          curPage: 1,
          pageSize: PAGE_SIZE,
          orderBy: "dataAtualizacao",
          orderDirection: -1,
        };
        const response = await cargaApi.getList(params);
        if (response.returnCode === 200) {
          setCargas(
            Array.isArray(response.data?.list) ? response.data.list : [],
          );
        } else {
          setError(
            response.returnMsg || "Não foi possível consultar as suas cargas.",
          );
        }
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : "Erro de comunicação com o servidor.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [motoristaId],
  );

  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.perfil === "motorista") {
      void loadCargas();
    }
  }, [authLoading, isAuthenticated, user?.perfil, loadCargas]);

  const stats = useMemo(
    () => ({
      total: cargas.length,
      active: cargas.filter(
        (c) =>
          !isDelivered(c.status) &&
          !["cancelada", "suspensa", "extraviada"].includes(
            (c.status || "").toLowerCase(),
          ),
      ).length,
      transit: cargas.filter((c) =>
        [
          "em_transito",
          "em_distribuicao",
          "em_posto_controlo",
          "em_fronteira",
        ].includes((c.status || "").toLowerCase()),
      ).length,
      delivered: cargas.filter((c) => isDelivered(c.status)).length,
      incidents: cargas.reduce(
        (total, c) =>
          total +
          (Array.isArray(c.ocorrencias)
            ? c.ocorrencias.filter(
                (o) => !["resolvido", "fechado"].includes(o.status),
              ).length
            : 0),
        0,
      ),
    }),
    [cargas],
  );

  const openAction = (
    carga: Carga,
    selectedAction: "etapa" | "ocorrencia" | "entrega",
  ) => {
    setSelectedCarga(carga);
    setAction(selectedAction);
    setNotice(null);
    setDescricaoEtapa("");
    setDescricaoOcorrencia("");
    setObservacaoEntrega("");
  };

  const closeAction = () => {
    if (submitting) return;
    setAction(null);
    setSelectedCarga(null);
  };

  const submitAction = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedCarga || !action) return;
    setSubmitting(true);
    setNotice(null);

    try {
      if (action === "etapa") {
        const selected = etapaOptions.find((item) => item.value === etapa);
        const response = await cargaApi.adicionarEtapa({
          cargaId: selectedCarga.cargaId,
          nome: etapa,
          descricao: descricaoEtapa.trim() || selected?.label,
          responsavel: {
            nome: user?.nomeCompleto || user?.nomeUtilizador || "Motorista",
            cargo: "Motorista",
          },
        });
        if (response.returnCode !== 200)
          throw new Error(
            response.returnMsg || "Não foi possível registar a etapa.",
          );
        if (etapa === "em_transito") {
          await cargaApi.atualizarStatus(
            selectedCarga.cargaId,
            "em_transito",
            descricaoEtapa.trim() || "Viagem iniciada pelo motorista.",
          );
        }
        setNotice({
          type: "success",
          message: "Actividade registada com sucesso.",
        });
      }

      if (action === "ocorrencia") {
        if (!descricaoOcorrencia.trim())
          throw new Error("Indique uma descrição para a ocorrência.");
        const response = await cargaApi.registrarOcorrencia({
          cargaId: selectedCarga.cargaId,
          tipo: tipoOcorrencia,
          descricao: descricaoOcorrencia.trim(),
          gravidade,
        });
        if (response.returnCode !== 200)
          throw new Error(
            response.returnMsg || "Não foi possível registar a ocorrência.",
          );
        setNotice({
          type: "success",
          message: "Ocorrência enviada à Central.",
        });
      }

      if (action === "entrega") {
        const response = await cargaApi.confirmarEntrega({
          cargaId: selectedCarga.cargaId,
          status: "recebida_integra",
          observacao:
            observacaoEntrega.trim() || "Entrega comunicada pelo motorista.",
        });
        if (response.returnCode !== 200)
          throw new Error(
            response.returnMsg || "Não foi possível confirmar a entrega.",
          );
        setNotice({
          type: "success",
          message: "Confirmação de entrega enviada com sucesso.",
        });
      }

      await loadCargas(true);
      window.setTimeout(() => {
        setAction(null);
        setSelectedCarga(null);
      }, 900);
    } catch (err: unknown) {
      setNotice({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : "Ocorreu um erro ao submeter o registo.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const updateLocation = async (carga: Carga) => {
    setNotice(null);
    if (!navigator.geolocation) {
      setNotice({
        type: "error",
        message: "Este dispositivo não disponibiliza geolocalização.",
      });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const response = await cargaApi.atualizarLocalizacao({
            cargaId: carga.cargaId,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            altitude: position.coords.altitude ?? undefined,
            velocidade:
              position.coords.speed == null
                ? undefined
                : position.coords.speed * 3.6,
            direcao: position.coords.heading ?? undefined,
            precisao: position.coords.accuracy,
            fonte: "gps",
            observacao: "Localização actualizada pelo motorista.",
          });
          if (response.returnCode !== 200)
            throw new Error(
              response.returnMsg ||
                "Não foi possível actualizar a localização.",
            );
          setNotice({
            type: "success",
            message: `Localização da carga ${carga.codigoRastreio || carga.cargaId} actualizada.`,
          });
          await loadCargas(true);
        } catch (err: unknown) {
          setNotice({
            type: "error",
            message:
              err instanceof Error
                ? err.message
                : "Erro ao actualizar a localização.",
          });
        }
      },
      (errorGps) => {
        const message =
          errorGps.code === errorGps.PERMISSION_DENIED
            ? "Permita o acesso à localização no navegador para continuar."
            : "Não foi possível obter a localização GPS. Tente novamente.";
        setNotice({ type: "error", message });
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-[65vh] flex items-center justify-center">
        <Spinner size="xl" label="A carregar as suas cargas" />
      </div>
    );
  }

  if (!isAuthenticated || user?.perfil !== "motorista") return null;

  return (
    <div className="max-w-[1500px] mx-auto space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 text-white p-6 lg:p-8 shadow-xl">
        <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-slate-300 mb-4">
              <span className="h-2 w-2 rounded-full bg-emerald-400" /> Área do
              motorista
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
              Olá, {user.nomeCompleto || user.nomeUtilizador}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              Acompanhe as suas cargas e mantenha a Central e os clientes
              informados sobre cada etapa do transporte.
            </p>
          </div>
          <Button
            variant="outline"
            className="!border-white/20 !bg-white/5 !text-white hover:!bg-white/10"
            onClick={() => void loadCargas(true)}
            loading={refreshing}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Actualizar
          </Button>
        </div>
      </section>

      {notice && !action && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${notice.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-700"}`}
        >
          {notice.message}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <div className="flex items-start justify-between gap-3">
            <span>{error}</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => void loadCargas()}
              leftIcon={<RefreshCw className="h-4 w-4" />}
            >
              Tentar novamente
            </Button>
          </div>
        </div>
      )}

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard
          label="Cargas atribuídas"
          value={stats.total}
          icon={<Package />}
          tone="blue"
        />
        <StatCard
          label="Por concluir"
          value={stats.active}
          icon={<Truck />}
          tone="violet"
        />
        <StatCard
          label="Em trânsito"
          value={stats.transit}
          icon={<Navigation />}
          tone="cyan"
        />
        <StatCard
          label="Entregues"
          value={stats.delivered}
          icon={<CheckCircle2 />}
          tone="green"
        />
        <StatCard
          label="Ocorrências abertas"
          value={stats.incidents}
          icon={<AlertTriangle />}
          tone="amber"
        />
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/motorista/cargas"
          className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-300 hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
              <Package className="h-5 w-5" />
            </span>
            <div>
              <p className="font-semibold text-slate-900">Minhas cargas</p>
              <p className="text-xs text-slate-500">
                Consultar e filtrar as cargas atribuídas
              </p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600" />
        </Link>
        <Link
          href="/motorista/historico"
          className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-300 hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-violet-50 p-2.5 text-violet-600">
              <ClipboardList className="h-5 w-5" />
            </span>
            <div>
              <p className="font-semibold text-slate-900">
                Histórico de registos
              </p>
              <p className="text-xs text-slate-500">
                Consultar actividades, ocorrências e localizações
              </p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600" />
        </Link>
      </section>

      <section id="cargas" className="space-y-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              As minhas cargas
            </h2>
            <p className="text-sm text-slate-500">
              Cargas associadas à sua conta de motorista.
            </p>
          </div>
          <span className="text-xs text-slate-500">
            {cargas.length} registo(s)
          </span>
        </div>

        {cargas.length === 0 && !error ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Package className="h-7 w-7" />
            </div>
            <h3 className="mt-4 font-semibold text-slate-900">
              Ainda não tem cargas atribuídas
            </h3>
            <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
              Quando a Central ou o transportador lhe atribuir uma carga, ela
              será apresentada aqui.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {cargas.map((carga) => (
              <CargaMotoristaCard
                key={carga.cargaId}
                carga={carga}
                onActivity={() => openAction(carga, "etapa")}
                onOccurrence={() => openAction(carga, "ocorrencia")}
                onLocation={() => void updateLocation(carga)}
                onDelivery={() => openAction(carga, "entrega")}
              />
            ))}
          </div>
        )}
      </section>

      <section
        id="historico"
        className="rounded-2xl border border-slate-200 bg-white p-5 lg:p-6"
      >
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
            <ClipboardList className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900">Registos e histórico</h2>
            <p className="text-sm text-slate-500">
              Os acontecimentos submetidos ficam associados à respectiva carga.
            </p>
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <InfoLine
            icon={<Activity />}
            title="Actividades"
            description="Etapas e progresso da viagem."
          />
          <InfoLine
            icon={<AlertTriangle />}
            title="Ocorrências"
            description="Atrasos, avarias e incidentes comunicados."
          />
          <InfoLine
            icon={<MapPin />}
            title="Localização"
            description="Actualizações GPS da carga."
          />
        </div>
      </section>

      {action && selectedCarga && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeAction();
          }}
        >
          <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
              <div>
                <h3 className="font-bold text-slate-900">
                  {action === "etapa"
                    ? "Registar actividade"
                    : action === "ocorrencia"
                      ? "Reportar ocorrência"
                      : "Confirmar entrega"}
                </h3>
                <p className="text-xs text-slate-500">
                  Carga {selectedCarga.codigoRastreio || selectedCarga.cargaId}
                </p>
              </div>
              <button
                type="button"
                onClick={closeAction}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={submitAction} className="space-y-4 p-5">
              {action === "etapa" && (
                <>
                  <Field label="Actividade">
                    <select
                      value={etapa}
                      onChange={(e) => setEtapa(e.target.value)}
                      className={selectClass}
                    >
                      {etapaOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Observação (opcional)">
                    <textarea
                      value={descricaoEtapa}
                      onChange={(e) => setDescricaoEtapa(e.target.value)}
                      rows={3}
                      placeholder="Indique detalhes adicionais..."
                      className={textareaClass}
                    />
                  </Field>
                </>
              )}
              {action === "ocorrencia" && (
                <>
                  <Field label="Tipo de ocorrência">
                    <select
                      value={tipoOcorrencia}
                      onChange={(e) => setTipoOcorrencia(e.target.value)}
                      className={selectClass}
                    >
                      {occurrenceTypes.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Gravidade">
                    <select
                      value={gravidade}
                      onChange={(e) =>
                        setGravidade(e.target.value as typeof gravidade)
                      }
                      className={selectClass}
                    >
                      <option value="leve">Leve</option>
                      <option value="moderada">Moderada</option>
                      <option value="grave">Grave</option>
                      <option value="critica">Crítica</option>
                    </select>
                  </Field>
                  <Field label="Descrição">
                    <textarea
                      required
                      value={descricaoOcorrencia}
                      onChange={(e) => setDescricaoOcorrencia(e.target.value)}
                      rows={4}
                      placeholder="Descreva o que aconteceu, quando e quais são as consequências..."
                      className={textareaClass}
                    />
                  </Field>
                  <p className="text-xs text-slate-500">
                    A ocorrência será enviada para acompanhamento pela Central.
                  </p>
                </>
              )}
              {action === "entrega" && (
                <>
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                    Confirme apenas se a carga já foi entregue no destino. A
                    confirmação será comunicada à Central e ficará registada no
                    histórico.
                  </div>
                  <Field label="Observação da entrega (opcional)">
                    <textarea
                      value={observacaoEntrega}
                      onChange={(e) => setObservacaoEntrega(e.target.value)}
                      rows={3}
                      placeholder="Nome de quem recebeu, condições da entrega ou outras observações..."
                      className={textareaClass}
                    />
                  </Field>
                </>
              )}
              {notice && (
                <div
                  className={`rounded-lg px-3 py-2 text-sm ${notice.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}
                >
                  {notice.message}
                </div>
              )}
              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeAction}
                  disabled={submitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  loading={submitting}
                  leftIcon={<CheckCircle2 className="h-4 w-4" />}
                >
                  Submeter registo
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  tone: "blue" | "violet" | "cyan" | "green" | "amber";
}) {
  const tones = {
    blue: "bg-blue-50 text-blue-600",
    violet: "bg-violet-50 text-violet-600",
    cyan: "bg-cyan-50 text-cyan-700",
    green: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-slate-500">{label}</span>
        <span className={`rounded-xl p-2 ${tones[tone]}`}>
          {React.cloneElement(
            icon as React.ReactElement<{ className?: string }>,
            { className: "h-4 w-4" },
          )}
        </span>
      </div>
      <p className="mt-3 text-2xl font-bold tabular-nums text-slate-900">
        {value}
      </p>
    </div>
  );
}

function CargaMotoristaCard({
  carga,
  onActivity,
  onOccurrence,
  onLocation,
  onDelivery,
}: {
  carga: Carga;
  onActivity: () => void;
  onOccurrence: () => void;
  onLocation: () => void;
  onDelivery: () => void;
}) {
  const delivered = isDelivered(carga.status);
  const location = carga.localizacaoAtual;
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Código de rastreio
            </p>
            <h3 className="mt-1 text-lg font-bold text-slate-900">
              {carga.codigoRastreio || carga.numeroOrdem || carga.cargaId}
            </h3>
            <p className="mt-1 text-sm text-slate-500 line-clamp-1">
              {carga.descricao || carga.tipoMercadoria || "Carga sem descrição"}
            </p>
          </div>
          <CargaStatusBadge status={carga.status} />
        </div>
        <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-wide text-slate-400">
              Origem
            </p>
            <p className="mt-1 truncate text-sm font-semibold text-slate-800">
              {getPlace(carga.origem)}
            </p>
          </div>
          <div className="rounded-full bg-slate-100 p-2 text-slate-400">
            <ArrowRight className="h-4 w-4" />
          </div>
          <div className="min-w-0 text-right">
            <p className="text-[11px] uppercase tracking-wide text-slate-400">
              Destino
            </p>
            <p className="mt-1 truncate text-sm font-semibold text-slate-800">
              {getPlace(carga.destino)}
            </p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 px-5 py-4 text-sm">
        <div className="flex items-center gap-2 text-slate-500">
          <Truck className="h-4 w-4 shrink-0" />
          <span className="truncate">
            {carga.viatura?.matricula || "Viatura não indicada"}
          </span>
        </div>
        <div className="flex items-center justify-end gap-2 text-slate-500">
          <Clock3 className="h-4 w-4 shrink-0" />
          <span className="truncate">
            {formatDate(carga.dataAtualizacao || carga.dataHoraStatus)}
          </span>
        </div>
        <div className="col-span-2 flex items-center gap-2 text-slate-500">
          <MapPin className="h-4 w-4 shrink-0" />
          <span className="truncate">
            {location?.cidade ||
              location?.endereco ||
              "Localização ainda não actualizada"}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 border-t border-slate-100 bg-slate-50/70 p-4 sm:grid-cols-4">
        <ActionButton
          icon={<Activity />}
          label="Actividade"
          onClick={onActivity}
          disabled={delivered}
        />
        <ActionButton
          icon={<AlertTriangle />}
          label="Ocorrência"
          onClick={onOccurrence}
          disabled={delivered}
        />
        <ActionButton
          icon={<Navigation />}
          label="GPS"
          onClick={onLocation}
          disabled={delivered}
        />
        <ActionButton
          icon={<CheckCircle2 />}
          label="Entregue"
          onClick={onDelivery}
          disabled={delivered}
        />
      </div>
      <div className="px-5 pb-4">
        <Link
          href={`/rastrear?codigo=${encodeURIComponent(carga.codigoRastreio || "")}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
        >
          Ver rastreamento público <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </article>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {React.cloneElement(icon as React.ReactElement<{ className?: string }>, {
        className: "h-4 w-4",
      })}
      {label}
    </button>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function InfoLine({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3 rounded-xl bg-slate-50 p-3">
      <span className="mt-0.5 text-slate-500">{icon}</span>
      <div>
        <p className="text-sm font-semibold text-slate-800">{title}</p>
        <p className="mt-0.5 text-xs leading-5 text-slate-500">{description}</p>
      </div>
    </div>
  );
}

const selectClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
const textareaClass =
  "w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
