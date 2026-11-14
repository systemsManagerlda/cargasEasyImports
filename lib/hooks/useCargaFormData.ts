/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect, useCallback } from 'react';
import { clienteApi, Cliente } from '../api/clientes';
import { motoristaApi, Motorista } from '../api/motoristas';
import toast from 'react-hot-toast';

interface UseCargaFormDataResult {
  clientes: Cliente[];
  motoristas: Motorista[];
  loading: boolean;
  error: string | null;
  fetchData: () => Promise<void>;
  getClienteById: (id: string) => Cliente | undefined;
  getMotoristaById: (id: string) => Motorista | undefined;
  hasClientes: boolean;
  hasMotoristas: boolean;
}

export function useCargaFormData(): UseCargaFormDataResult {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [motoristas, setMotoristas] = useState<Motorista[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [clientesResponse, motoristasResponse] = await Promise.all([
        clienteApi.getList({ pageSize: 1000 }),
        motoristaApi.getAll({ ativo: true }),
      ]);

      if (clientesResponse.returnCode === 200) {
        const listaClientes = clientesResponse.data?.list || [];

        setClientes(listaClientes);

        console.log(
          `✅ ${listaClientes.length} clientes carregados`
        );
      }

      const listaMotoristas = motoristasResponse;
      setMotoristas(listaMotoristas);
      console.log(`✅ ${listaMotoristas.length} motoristas carregados`);
    } catch (err: any) {
      const message =
        err?.response?.data?.returnMsg ||
        err?.message ||
        'Erro ao carregar dados';

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (cancelled) return;

      await fetchData();
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [fetchData]);

  const getClienteById = useCallback(
    (id: string) => {
      return clientes.find((cliente) => cliente.clienteId === id);
    },
    [clientes]
  );

  const getMotoristaById = useCallback(
    (id: string) => {
      return motoristas.find((motorista) => motorista._id === id);
    },
    [motoristas]
  );

  return {
    clientes,
    motoristas,
    loading,
    error,
    fetchData,
    getClienteById,
    getMotoristaById,
    hasClientes: clientes.length > 0,
    hasMotoristas: motoristas.length > 0,
  };
}