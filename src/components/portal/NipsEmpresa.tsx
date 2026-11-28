"use client";

import { type FormEvent, startTransition, useActionState, useEffect, useRef, useState } from "react";
import { darNip, darNipsATodos, type ResultadoNips } from "@/app/cuenta/portal/acciones";
import { claseBoton, claseBotonSecundario, claseEntrada } from "@/components/cuenta/clases";

function Tarjetas({ lista, handle, empresa }: { lista: NonNullable<ResultadoNips["lista"]>; handle: string; empresa: string }) {
  return (
    <div className="mt-4">
      <div className="grid gap-3 sm:grid-cols-2 print:grid-cols-2" id="nips-para-imprimir">
        {lista.map((p) => (
          <div key={p.idAcceso} className="break-inside-avoid rounded-tarjeta-chica border-2 border-dashed border-linea bg-white p-4 text-sm">
            <p className="font-semibold">{p.nombre}</p>
            <p className="text-xs text-gris">Mi gafete de {empresa} · lagafeteria.com/e/{handle}</p>
            <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
              <dt className="text-gris">ID de acceso</dt>
              <dd className="font-mono font-semibold">{p.idAcceso}</dd>
              <dt className="text-gris">NIP inicial</dt>
              <dd className="font-mono text-lg font-bold tracking-widest">{p.nip}</dd>
            </dl>
            <p className="mt-2 text-xs text-gris">Al entrar la primera vez te pedimos crear tu propio NIP.</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Dar o restablecer el NIP de una persona. Muestra el NIP una sola vez. */
export function BotonNip({
  empleado,
  idAcceso,
  pideId,
  texto,
  handle,
  empresa,
}: {
  empleado: string;
  idAcceso: string;
  pideId: boolean;
  texto: string;
  handle: string;
  empresa: string;
}) {
  const [estado, enviar, enviando] = useActionState<ResultadoNips, FormData>(darNip, {});
  const [abierto, setAbierto] = useState(false);
  const tarjeta = useRef<HTMLDivElement>(null);
  const hayNip = Boolean(estado.lista?.length);
  // Al recibir NIP, la persona pasa al final de la lista (ya tiene acceso):
  // la llevamos a la vista para que el NIP, que solo se muestra una vez, no se pierda.
  useEffect(() => {
    if (hayNip) tarjeta.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [hayNip]);
  const alEnviar = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const datos = new FormData(e.currentTarget);
    startTransition(() => enviar(datos));
  };
  if (estado.lista?.length) {
    return (
      <div ref={tarjeta} className="w-full scroll-mt-24">
        <Tarjetas lista={estado.lista} handle={handle} empresa={empresa} />
        <p className="mt-2 text-xs font-medium text-[#0a7d4f]">{estado.ok}</p>
      </div>
    );
  }
  if (!abierto) {
    return (
      <button type="button" onClick={() => setAbierto(true)} className="text-sm font-semibold underline underline-offset-4">
        {texto}
      </button>
    );
  }
  return (
    <form onSubmit={alEnviar} className="flex w-full flex-wrap items-end gap-2">
      <input type="hidden" name="empleado" value={empleado} />
      <label className="min-w-40 flex-1">
        <span className="text-xs font-semibold">ID de acceso</span>
        <input name="id_acceso" defaultValue={idAcceso} required={pideId} maxLength={40} placeholder="Número de empleado" className={`${claseEntrada} py-2`} />
      </label>
      <button type="submit" disabled={enviando} className={`${claseBoton} px-4 py-2 text-sm`}>
        {enviando ? "…" : "Generar NIP"}
      </button>
      <button type="button" onClick={() => setAbierto(false)} className="text-sm underline">Cancelar</button>
      {estado.error ? <p role="alert" className="w-full text-sm text-rojo-oscuro">{estado.error}</p> : null}
    </form>
  );
}

/** NIP inicial para todas las personas sin correo, listos para imprimir y recortar. */
export function NipsATodos({ pendientes, handle, empresa }: { pendientes: number; handle: string; empresa: string }) {
  const [estado, enviar, enviando] = useActionState<ResultadoNips, FormData>(darNipsATodos, {});
  return (
    <div>
      {estado.lista?.length ? (
        <>
          <p role="status" className="rounded-tarjeta-chica bg-resaltador/30 p-3 text-sm font-medium">{estado.ok}</p>
          <button type="button" onClick={() => window.print()} className={`${claseBotonSecundario} mt-3 text-sm`}>
            Imprimir tarjetas
          </button>
          <Tarjetas lista={estado.lista} handle={handle} empresa={empresa} />
        </>
      ) : (
        <form action={() => startTransition(() => enviar(new FormData()))}>
          <button type="submit" disabled={enviando || !pendientes} className={claseBoton}>
            {enviando ? "Generando…" : `Generar NIP para ${pendientes.toLocaleString("es-MX")} ${pendientes === 1 ? "persona" : "personas"}`}
          </button>
          {estado.error ? <p role="alert" className="mt-2 text-sm text-rojo-oscuro">{estado.error}</p> : null}
        </form>
      )}
    </div>
  );
}
