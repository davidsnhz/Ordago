import { useState } from 'react';
import { COMPANEROS } from '../../../datos/companeros';
import { GIRA } from '../../../datos/gira';
import { esDeUnUso, OBJETOS } from '../../../datos/objetos';
import {
  impedimentoCompra,
  precioDe,
  precioDeVenta,
  precioOtraRonda,
  type Bolsa,
  type CosaEnVenta,
  type Gira,
  type OfertaTaberna,
} from '../../../estado/gira';
import { ES } from '../../../textos/es';
import { BotonApuesta, clases } from '../../componentes/piezas';
import { Moneda, nombreCorto } from './Piezas';

const T = ES.gira.taberna;

/** Lo que está tocado: algo de las baldas (para comprar) o de tu bolsa (para vender). */
type Seleccion = { de: 'balda'; indice: number } | { de: keyof Bolsa; indice: number } | null;

const nombreDe = (cosa: CosaEnVenta) => (cosa.tipo === 'objeto' ? ES.objetos[cosa.id].nombre : ES.companeros[cosa.id].nombre);
const cortoDe = (cosa: CosaEnVenta) => (cosa.tipo === 'objeto' ? ES.objetos[cosa.id].corto : `${T.companero.toLowerCase()}: ${ES.companeros[cosa.id].corto}`);

/**
 * La taberna (prototipo T1): dos baldas con lo que hay a la venta (de un uso arriba; amuletos y
 * compañeros abajo), la ficha de lo que tocas y tu bolsa con los huecos. Lo de la bolsa se vende
 * por la mitad. «Otra ronda» cambia lo que hay.
 */
export function Taberna({
  gira,
  oferta,
  onComprar,
  onVender,
  onOtraRonda,
  onSalir,
}: {
  gira: Gira;
  oferta: OfertaTaberna;
  onComprar: (indice: number) => void;
  onVender: (hueco: keyof Bolsa, indice: number) => void;
  onOtraRonda: () => void;
  onSalir: () => void;
}) {
  const [seleccion, setSeleccion] = useState<Seleccion>(null);
  const deUnUso = oferta.cosas.map((cosa, indice) => ({ cosa, indice })).filter(({ cosa }) => cosa.tipo === 'objeto' && esDeUnUso(cosa.id));
  const paraLaGira = oferta.cosas.map((cosa, indice) => ({ cosa, indice })).filter(({ cosa }) => !(cosa.tipo === 'objeto' && esDeUnUso(cosa.id)));
  const ronda = precioOtraRonda(oferta);

  const balda = (cosas: { cosa: CosaEnVenta; indice: number }[]) =>
    cosas.map(({ cosa, indice }) => (
      <button
        key={`${indice}-${cosa.id}`}
        type="button"
        className={clases('cosa', cosa.vendida && 'cosa--vendida', seleccion?.de === 'balda' && seleccion.indice === indice && 'cosa--elegida')}
        onClick={() => setSeleccion({ de: 'balda', indice })}
      >
        <span className={clases('marcador', cosa.tipo === 'companero' && 'marcador--redondo')}>{nombreCorto(nombreDe(cosa))}</span>
        <span className="cosa__etiqueta">
          <b>
            {nombreDe(cosa)} <span className="cosa__precio">· {cosa.vendida ? T.vendida : ES.gira.reales(precioDe(cosa))}</span>
          </b>
          <i>{cortoDe(cosa)}</i>
        </span>
      </button>
    ));

  return (
    <div className="pantalla pantalla--madera">
      <div className="taberna__titulo">{T.titulo}</div>
      <button type="button" className="mapa__atajo taberna__salir" onClick={onSalir}>
        {T.salir}
      </button>
      <div className="taberna__tabernera marcador">{T.tabernera}</div>
      <div className="taberna__frase panel">{T.frase}</div>

      <div className="balda" style={{ top: 150 }}>
        <div className="balda__rotulo">{T.deUnUso}</div>
        <div className="balda__cosas">{balda(deUnUso)}</div>
        <div className="balda__tabla" />
      </div>
      <div className="balda" style={{ top: 316 }}>
        <div className="balda__rotulo">{T.gira}</div>
        <div className="balda__cosas">{balda(paraLaGira)}</div>
        <div className="balda__tabla" />
      </div>

      <Ficha gira={gira} oferta={oferta} seleccion={seleccion} ronda={ronda} onComprar={onComprar} onVender={(h, i) => {
        onVender(h, i);
        setSeleccion(null);
      }} onOtraRonda={() => {
        onOtraRonda();
        setSeleccion(null);
      }} />

      <div className="bolsa-taberna panel">
        <div className="bolsa-taberna__cabecera">
          {T.bolsa}{' '}
          <span className="taberna__reales">
            <Moneda /> {ES.gira.reales(gira.reales)}
          </span>
        </div>
        <div className="bolsa-taberna__huecos">
          <Huecos titulo={T.huecos.unUso} cosas={gira.bolsa.unUso} total={GIRA.huecos.unUso} hueco="unUso" seleccion={seleccion} onTocar={setSeleccion} />
          <Huecos titulo={T.huecos.amuletos} cosas={gira.bolsa.amuletos} total={GIRA.huecos.amuletos} hueco="amuletos" seleccion={seleccion} onTocar={setSeleccion} />
          <div className="bolsa-taberna__grupo">
            <div className="rotulo">{T.huecos.baraja}</div>
            <div className="bolsa-taberna__cajas">
              <span className="hueco" />
            </div>
          </div>
          <div className="bolsa-taberna__grupo">
            <div className="rotulo">{T.huecos.companero}</div>
            <div className="bolsa-taberna__cajas">
              {gira.companero ? (
                <span className="hueco hueco--lleno hueco--redondo">{nombreCorto(ES.companeros[gira.companero].nombre)}</span>
              ) : (
                <span className="hueco hueco--redondo" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Huecos({
  titulo,
  cosas,
  total,
  hueco,
  seleccion,
  onTocar,
}: {
  titulo: string;
  cosas: readonly (keyof typeof OBJETOS)[];
  total: number;
  hueco: keyof Bolsa;
  seleccion: Seleccion;
  onTocar: (s: Seleccion) => void;
}) {
  return (
    <div className="bolsa-taberna__grupo">
      <div className="rotulo">{titulo}</div>
      <div className="bolsa-taberna__cajas">
        {Array.from({ length: total }, (_, i) => {
          const id = cosas[i];
          return id ? (
            <button
              key={i}
              type="button"
              className={clases('hueco hueco--lleno', seleccion?.de === hueco && seleccion.indice === i && 'hueco--elegido')}
              onClick={() => onTocar({ de: hueco, indice: i })}
              aria-label={ES.objetos[id].nombre}
            >
              {nombreCorto(ES.objetos[id].nombre)}
            </button>
          ) : (
            <span key={i} className="hueco" />
          );
        })}
      </div>
    </div>
  );
}

/** La ficha de lo que tocas: qué es, qué hace y el botón (comprar o vender). «Otra ronda», siempre. */
function Ficha({
  gira,
  oferta,
  seleccion,
  ronda,
  onComprar,
  onVender,
  onOtraRonda,
}: {
  gira: Gira;
  oferta: OfertaTaberna;
  seleccion: Seleccion;
  ronda: number;
  onComprar: (indice: number) => void;
  onVender: (hueco: keyof Bolsa, indice: number) => void;
  onOtraRonda: () => void;
}) {
  const otra = (
    <BotonApuesta className="boton-apuesta--peque" disabled={gira.reales < ronda} onClick={onOtraRonda}>
      {T.otraRonda(ronda)}
    </BotonApuesta>
  );

  if (!seleccion) {
    return (
      <div className="ficha panel panel--sombra">
        <p>{T.toca}</p>
        <div className="fila-botones">{otra}</div>
      </div>
    );
  }

  if (seleccion.de === 'balda') {
    const cosa = oferta.cosas[seleccion.indice];
    if (!cosa) return null;
    const impedimento = impedimentoCompra(gira, cosa);
    const tipo = cosa.tipo === 'objeto' ? OBJETOS[cosa.id].tipo : 'companero';
    const efecto =
      cosa.tipo === 'objeto' ? ES.objetos[cosa.id].efecto : `${ES.companeros[cosa.id].pasiva} ${ES.gira.elegir.sena(COMPANEROS[cosa.id].senas)}: ${ES.companeros[cosa.id].sena}`;
    const aviso =
      cosa.tipo === 'companero' && gira.companero === cosa.id
        ? T.tuyo
        : cosa.tipo === 'companero' && gira.companero && !cosa.vendida
          ? T.cambiaCompanero(ES.companeros[gira.companero].nombre, Math.floor(COMPANEROS[gira.companero].precio * GIRA.taberna.venta))
          : impedimento === 'sinDinero'
            ? T.sinDinero
            : impedimento === 'sinHueco'
              ? T.sinHueco
              : null;
    return (
      <div className="ficha panel panel--sombra">
        <span className={`chip chip--${tipo}`}>{tipo === 'companero' ? T.companero : ES.tiposObjeto[tipo]}</span>
        <h4>{nombreDe(cosa)}</h4>
        <p>{efecto}</p>
        {aviso && <div className="ficha__aviso">{aviso}</div>}
        <div className="fila-botones">
          <BotonApuesta variante="gualda" className="boton-apuesta--peque" disabled={impedimento !== null} onClick={() => onComprar(seleccion.indice)}>
            {cosa.vendida ? T.vendida : T.comprar(precioDe(cosa))}
          </BotonApuesta>
          {otra}
        </div>
      </div>
    );
  }

  const id = gira.bolsa[seleccion.de][seleccion.indice];
  if (!id) return null;
  return (
    <div className="ficha panel panel--sombra">
      <span className={`chip chip--${OBJETOS[id].tipo}`}>{ES.tiposObjeto[OBJETOS[id].tipo]}</span>
      <h4>{ES.objetos[id].nombre}</h4>
      <p>{ES.objetos[id].efecto}</p>
      <div className="fila-botones">
        <BotonApuesta className="boton-apuesta--peque" onClick={() => onVender(seleccion.de as keyof Bolsa, seleccion.indice)}>
          {T.vender(precioDeVenta(id))}
        </BotonApuesta>
        {otra}
      </div>
    </div>
  );
}
