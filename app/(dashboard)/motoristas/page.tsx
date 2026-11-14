/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useCallback, useEffect, useState } from "react";
import { ProtectedRoute } from "../../../components/common/ProtectedRoute";
import { apiClient } from "../../../lib/api/client";

type Motorista = {
  _id: string;
  utilizadorId: string;
  motoristaId?: string;
  nomeCompleto: string;
  nomeUtilizador?: string;
  email: string;
  telefone: string;
  telefoneAlternativo?: string;
  endereco?: { rua?: string; cidade?: string; provincia?: string; pais?: string };
  estadoConta: string;
  ativo: boolean;
  observacoes?: string;
};

type ApiResponse<T> = { returnCode: number; returnMsg?: string; data: T };
type ListData = {
  list: Motorista[];
  totalCount: number;
  totalPage: number;
  curPage: number;
  pageSize: number;
};

const emptyForm = {
  nomeCompleto: "", email: "", telefone: "", telefoneAlternativo: "",
  rua: "", cidade: "", provincia: "", pais: "Moçambique",
  estadoConta: "ativo", ativo: true, observacoes: "",
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

function initials(name?: string) {
  return (name || "M").trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function isActive(m: Motorista) {
  return Boolean(m.ativo) && m.estadoConta === "ativo";
}

export default function MotoristasPage() {
  const [items, setItems] = useState<Motorista[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selected, setSelected] = useState<Motorista | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiClient.post<ApiResponse<ListData>>("/getMotoristaListA", {
        curPage: page,
        pageSize: 10,
        search: search.trim(),
        ativo: status === "ativo" ? true : status === "inativo" ? false : undefined,
      });
      const body: any = response?.data?.returnCode !== undefined ? response.data : response;
      if (body.returnCode !== 200) throw new Error(body.returnMsg || "Não foi possível carregar os motoristas.");
      setItems(Array.isArray(body.data?.list) ? body.data.list : []);
      setTotal(Number(body.data?.totalCount || 0));
      setTotalPages(Number(body.data?.totalPage || 0));
    } catch (e: any) {
      setError(e?.response?.data?.returnMsg || e?.message || "Erro ao carregar motoristas.");
      setItems([]);
      setTotal(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => { void load(); }, [load]);

  const openDetail = async (item: Motorista) => {
    setError("");
    setNotice("");
    try {
      const response = await apiClient.post<ApiResponse<Motorista>>("/getMotoristaDetailA", {
        motoristaId: item._id,
      });
      const body: any = response?.data?.returnCode !== undefined ? response.data : response;
      if (body.returnCode !== 200) throw new Error(body.returnMsg || "Erro ao consultar motorista.");
      const m: Motorista = body.data;
      setSelected(m);
      setForm({
        nomeCompleto: m.nomeCompleto || "", email: m.email || "",
        telefone: m.telefone || "", telefoneAlternativo: m.telefoneAlternativo || "",
        rua: m.endereco?.rua || "", cidade: m.endereco?.cidade || "",
        provincia: m.endereco?.provincia || "", pais: m.endereco?.pais || "Moçambique",
        estadoConta: m.estadoConta || "ativo", ativo: Boolean(m.ativo),
        observacoes: m.observacoes || "",
      });
    } catch (e: any) {
      setError(e?.response?.data?.returnMsg || e?.message || "Erro ao consultar motorista.");
    }
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selected) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const response = await apiClient.post<ApiResponse<Motorista>>("/updateMotoristaA", {
        motoristaId: selected._id,
        nomeCompleto: form.nomeCompleto.trim(),
        email: form.email.trim(),
        telefone: form.telefone.trim(),
        telefoneAlternativo: form.telefoneAlternativo.trim(),
        endereco: { rua: form.rua, cidade: form.cidade, provincia: form.provincia, pais: form.pais },
        estadoConta: form.estadoConta,
        ativo: form.ativo,
        observacoes: form.observacoes,
      });
      const body: any = response?.data?.returnCode !== undefined ? response.data : response;
      if (body.returnCode !== 200) throw new Error(body.returnMsg || "Não foi possível actualizar.");
      setNotice("Dados do motorista actualizados com sucesso.");
      setSelected(null);
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.returnMsg || e?.message || "Erro ao actualizar motorista.");
    } finally {
      setSaving(false);
    }
  };

  const setField = (key: keyof typeof emptyForm, value: any) =>
    setForm((old) => ({ ...old, [key]: value }));

  const activeCount = items.filter(isActive).length;
  const inactiveCount = items.length - activeCount;

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-slate-50/80 px-4 py-6 md:px-7 md:py-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
                <span className="h-2 w-2 rounded-full bg-blue-600" /> Gestão de utilizadores
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Motoristas</h1>
              <p className="mt-1.5 text-sm text-slate-500">
                Consulte, acompanhe e actualize os dados dos motoristas registados.
              </p>
            </div>
            <button
              onClick={() => void load()}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
            >
              <span className={loading ? "animate-spin" : ""}>↻</span>
              Actualizar lista
            </button>
          </div>

          {notice && (
            <div role="status" className="mb-5 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 font-bold">✓</span>
              {notice}
            </div>
          )}
          {error && (
            <div role="alert" className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <span className="font-bold">!</span><span>{error}</span>
            </div>
          )}

          <section className="mb-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">Total de motoristas</span>
                <span className="rounded-xl bg-blue-50 px-2.5 py-2 text-blue-700">♙</span>
              </div>
              <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{total}</div>
              <p className="mt-1 text-xs text-slate-400">Registos encontrados</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">Activos nesta página</span>
                <span className="rounded-xl bg-emerald-50 px-2.5 py-2 text-emerald-700">✓</span>
              </div>
              <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{activeCount}</div>
              <p className="mt-1 text-xs text-slate-400">Com conta activa</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">Inactivos nesta página</span>
                <span className="rounded-xl bg-amber-50 px-2.5 py-2 text-amber-700">Ⅱ</span>
              </div>
              <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{inactiveCount}</div>
              <p className="mt-1 text-xs text-slate-400">Sem actividade actual</p>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-4 md:p-5">
              <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="font-semibold text-slate-900">Lista de motoristas</h2>
                  <p className="mt-1 text-xs text-slate-500">Pesquise e filtre os registos para encontrar rapidamente um motorista.</p>
                </div>
                <span className="text-xs text-slate-400">{total} resultado(s)</span>
              </div>
              <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_210px]">
                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">⌕</span>
                  <input
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    placeholder="Pesquisar por nome, e-mail, telefone ou código..."
                    className={`${inputClass} pl-10`}
                  />
                </div>
                <select
                  value={status}
                  onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                  className={inputClass}
                >
                  <option value="">Todos os estados</option>
                  <option value="ativo">Activos</option>
                  <option value="inativo">Inactivos</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-sm text-slate-500">
                <span className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
                A carregar motoristas...
              </div>
            ) : items.length === 0 ? (
              <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-xl text-slate-500">⌕</div>
                <p className="font-semibold text-slate-800">Nenhum motorista encontrado</p>
                <p className="mt-1 max-w-sm text-sm text-slate-500">Experimente alterar os termos de pesquisa ou o filtro de estado.</p>
              </div>
            ) : (
              <>
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      <tr>
                        <th className="px-5 py-3.5">Motorista</th>
                        <th className="px-5 py-3.5">Contacto</th>
                        <th className="px-5 py-3.5">Identificador</th>
                        <th className="px-5 py-3.5">Estado</th>
                        <th className="px-5 py-3.5 text-right">Acção</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {items.map((m) => (
                        <tr key={m._id} className="transition hover:bg-slate-50/70">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-700">{initials(m.nomeCompleto)}</div>
                              <div className="min-w-0">
                                <div className="truncate font-semibold text-slate-800">{m.nomeCompleto || "Nome não indicado"}</div>
                                <div className="mt-0.5 truncate text-xs text-slate-500">{m.email || "Sem e-mail"}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-slate-600">{m.telefone || "—"}</td>
                          <td className="px-5 py-4 font-mono text-xs text-slate-500">{m._id}</td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${isActive(m) ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${isActive(m) ? "bg-emerald-500" : "bg-slate-400"}`} />
                              {isActive(m) ? "Activo" : "Inactivo"}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <button onClick={() => void openDetail(m)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700">
                              Ver detalhes&nbsp; →
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="divide-y divide-slate-100 md:hidden">
                  {items.map((m) => (
                    <article key={m._id} className="flex items-start gap-3 p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-700">{initials(m.nomeCompleto)}</div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-sm font-semibold text-slate-900">{m.nomeCompleto || "Nome não indicado"}</h3>
                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${isActive(m) ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{isActive(m) ? "Activo" : "Inactivo"}</span>
                        </div>
                        <p className="mt-1 truncate text-xs text-slate-500">{m.email || "Sem e-mail"}</p>
                        <p className="mt-1 text-xs text-slate-500">{m.telefone || "Sem telefone"}</p>
                        <button onClick={() => void openDetail(m)} className="mt-3 text-xs font-semibold text-blue-700">Ver detalhes →</button>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}

            <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/50 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <span className="text-xs text-slate-500">
                A mostrar {items.length ? (page - 1) * 10 + 1 : 0}–{(page - 1) * 10 + items.length} de {total} registo(s)
              </span>
              <div className="flex items-center gap-2">
                <button disabled={page <= 1 || loading} onClick={() => setPage((p) => p - 1)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">← Anterior</button>
                <span className="min-w-20 text-center text-xs font-medium text-slate-600">Página {page} / {Math.max(totalPages, 1)}</span>
                <button disabled={page >= totalPages || loading || totalPages === 0} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">Seguinte →</button>
              </div>
            </div>
          </section>
        </div>

        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-3 backdrop-blur-[2px] sm:p-6" onMouseDown={(e) => { if (e.target === e.currentTarget) setSelected(null); }}>
            <form onSubmit={save} className="my-auto w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
              <div className="flex items-start justify-between border-b border-slate-100 bg-slate-50/80 px-5 py-4 sm:px-7">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Perfil do motorista</p>
                  <h2 className="mt-1 text-xl font-bold text-slate-900">Dados do motorista</h2>
                  <p className="mt-1 font-mono text-[11px] text-slate-400">{selected._id}</p>
                </div>
                <button type="button" onClick={() => setSelected(null)} aria-label="Fechar" className="rounded-lg p-2 text-xl leading-none text-slate-400 transition hover:bg-slate-200 hover:text-slate-700">×</button>
              </div>

              <div className="max-h-[calc(100vh-190px)] space-y-6 overflow-y-auto px-5 py-5 sm:px-7">
                <section>
                  <h3 className="mb-3 text-sm font-semibold text-slate-800">Informações pessoais e contacto</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {([
                      ["nomeCompleto", "Nome completo", "text"],
                      ["email", "E-mail", "email"],
                      ["telefone", "Telefone principal", "tel"],
                      ["telefoneAlternativo", "Telefone alternativo", "tel"],
                    ] as const).map(([key, label, type]) => (
                      <label key={key} className="grid gap-1.5 text-xs font-medium text-slate-600">
                        {label}
                        <input type={type} required={["nomeCompleto", "email", "telefone"].includes(key)} value={form[key]} onChange={(e) => setField(key, e.target.value)} className={inputClass} />
                      </label>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="mb-3 text-sm font-semibold text-slate-800">Endereço</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {([
                      ["rua", "Rua / Endereço"],
                      ["cidade", "Cidade"],
                      ["provincia", "Província"],
                      ["pais", "País"],
                    ] as const).map(([key, label]) => (
                      <label key={key} className="grid gap-1.5 text-xs font-medium text-slate-600">
                        {label}
                        <input value={form[key]} onChange={(e) => setField(key, e.target.value)} className={inputClass} />
                      </label>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="mb-3 text-sm font-semibold text-slate-800">Estado e observações</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="grid gap-1.5 text-xs font-medium text-slate-600">
                      Estado da conta
                      <select value={form.estadoConta} onChange={(e) => setField("estadoConta", e.target.value)} className={inputClass}>
                        <option value="ativo">Activo</option>
                        <option value="inativo">Inactivo</option>
                        <option value="bloqueado">Bloqueado</option>
                        <option value="suspenso">Suspenso</option>
                        <option value="pendente_ativacao">Pendente de activação</option>
                      </select>
                    </label>
                    <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-3.5 py-3 text-sm text-slate-700">
                      <input type="checkbox" checked={form.ativo} onChange={(e) => setField("ativo", e.target.checked)} className="h-4 w-4 rounded border-slate-300 accent-blue-600" />
                      <span><span className="block font-semibold">Registo activo</span><span className="text-xs text-slate-500">Permitir que a conta permaneça activa</span></span>
                    </label>
                    <label className="grid gap-1.5 text-xs font-medium text-slate-600 sm:col-span-2">
                      Observações
                      <textarea rows={3} value={form.observacoes} onChange={(e) => setField("observacoes", e.target.value)} className={`${inputClass} resize-y`} placeholder="Notas adicionais sobre o motorista..." />
                    </label>
                  </div>
                </section>
              </div>

              <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-white px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
                <button type="button" onClick={() => setSelected(null)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">Cancelar</button>
                <button disabled={saving} className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
                  {saving ? "A guardar..." : "Guardar alterações"}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
