import { COMPANEROS } from '../../../datos/companeros';
import { ARENAS, GIRA, piedrasDeFiesta } from '../../../datos/gira';
import type { IdObjeto } from '../../../datos/objetos';
import {
  companeroDePremio,
  premioDisponible,
  puedeAceptarPlaza,
  type DesenlacePlaza,
  type EventoPlaza,
  type Gira,
  type Premio,
} from '../../../estado/gira';
import { ES } from '../../../textos/es';
import { BotonApuesta } from '../../componentes/piezas';
import { Hud, nombreCorto } from './Piezas';

const G = ES.gira;
const P = G.plaza;

/** Lo que vende el timador, con su artículo («la Medalla», «el Yesquero»). */
const conArticulo = (id: IdObjeto): string => {
  const objeto: { nombre: string; articulo?: 'el' } = ES.objetos[id];
  return `${objeto.articulo ?? 'la'} ${objeto.nombre}`;
};
const mayuscula = (texto: string) => texto.charAt(0).toUpperCase() + texto.slice(1);

/** La plaza: pasa algo, se responde y se vuelve al mapa. */
export function Plaza({
  gira,
  evento,
  desenlace,
  onResponder,
  onSeguir,
}: {
  gira: Gira;
  evento: EventoPlaza;
  desenlace: DesenlacePlaza | null;
  onResponder: (acepta: boolean) => void;
  onSeguir: () => void;
}) {
  const puede = desenlace === null && puedeAceptarPlaza(gira);
  let titulo: string;
  let texto: string;
  let aceptar: string;
  let rechazar: string | null = P.no;
  let motivoNo: string | null = null;
  switch (evento.tipo) {
    case 'forastero':
      titulo = P.forastero.titulo;
      texto = P.forastero.texto(GIRA.plaza.forastero.apuesta, GIRA.plaza.forastero.premio);
      aceptar = P.forastero.aceptar(GIRA.plaza.forastero.apuesta);
      if (!puede) motivoNo = P.forastero.sinDinero;
      break;
    case 'fiesta':
      titulo = P.fiesta.titulo;
      texto = P.fiesta.texto(piedrasDeFiesta(GIRA.piedrasPorNivel[gira.nivel]!));
      aceptar = P.fiesta.aceptar;
      rechazar = null;
      break;
    case 'timador': {
      titulo = P.timador.titulo;
      texto = P.timador.texto(conArticulo(evento.objeto), evento.precio);
      aceptar = P.timador.aceptar(evento.precio);
      rechazar = P.timador.no;
      if (!puede) motivoNo = gira.reales < evento.precio ? P.timador.sinDinero : P.timador.sinHueco;
      break;
    }
    case 'monja':
      titulo = P.monja.titulo;
      texto = P.monja.texto;
      aceptar = P.monja.aceptar;
      rechazar = null;
      break;
    case 'calle':
      titulo = P.calle.titulo;
      texto = P.calle.texto(GIRA.plaza.calle.premio);
      aceptar = P.calle.aceptar;
      rechazar = P.calle.no;
      break;
  }

  return (
    <div className="pantalla">
      <Hud gira={gira} />
      <div className="suceso panel panel--sombra">
        <div className="suceso__lugar">{P.titulo}</div>
        <span className="marcador">{P.marca[evento.tipo]}</span>
        <h3>{titulo}</h3>
        <p>{texto}</p>
        {desenlace ? (
          <>
            <p className="suceso__desenlace">{textoDesenlace(evento, desenlace)}</p>
            <BotonApuesta variante="gualda" onClick={onSeguir} autoFocus>
              {P.seguir}
            </BotonApuesta>
          </>
        ) : (
          <>
            {motivoNo && <p className="suceso__desenlace">{motivoNo}</p>}
            <BotonApuesta variante="gualda" disabled={!puede} onClick={() => onResponder(true)} autoFocus>
              {aceptar}
            </BotonApuesta>
            {rechazar && (
              <BotonApuesta variante="rendirse" onClick={() => onResponder(false)}>
                {rechazar}
              </BotonApuesta>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function textoDesenlace(evento: EventoPlaza, desenlace: DesenlacePlaza): string {
  const objeto = evento.tipo === 'timador' ? conArticulo(evento.objeto) : '';
  switch (desenlace) {
    case 'apuestaAceptada':
      return P.forastero.aceptada;
    case 'apuestaRechazada':
      return P.forastero.rechazada;
    case 'fiesta':
      return P.fiesta.hecho;
    case 'timadorFalso':
      return P.timador.falso(mayuscula(objeto));
    case 'timadorBueno':
      return P.timador.bueno(objeto);
    case 'timadorRechazado':
      return P.timador.rechazado;
    case 'monja':
      return P.monja.hecho;
    case 'calleGanada':
      return P.calle.ganada(GIRA.plaza.calle.premio);
    case 'callePerdida':
      return P.calle.perdida;
    case 'calleRechazada':
      return P.calle.rechazada;
  }
}

/** La era: descansas y sube la Cara. */
export function Era({ gira, antes, despues, onSeguir }: { gira: Gira; antes: number; despues: number; onSeguir: () => void }) {
  return (
    <div className="pantalla">
      <Hud gira={gira} />
      <div className="suceso panel panel--sombra">
        <div className="suceso__lugar">{G.era.titulo}</div>
        <span className="marcador">ERA</span>
        <p>{G.era.texto}</p>
        <div className="suceso__grande">{G.era.cara(antes, despues)}</div>
        <BotonApuesta variante="gualda" onClick={onSeguir} autoFocus>
          {G.era.seguir}
        </BotonApuesta>
      </div>
    </div>
  );
}

/** El premio del jefe: un compañero nuevo, su objeto raro o un punto de Honra. */
export function PremioDelJefe({ gira, onElegir }: { gira: Gira; onElegir: (p: Premio) => void }) {
  const R = G.premio;
  const arena = ARENAS[gira.arena]!;
  const jefe = ES.rivales[arena.niveles![3]].nombre;
  const otro = companeroDePremio(gira);
  const raro = arena.raro;
  const opciones: { premio: Premio; marca: string; titulo: string; texto: string; no: string | null }[] = [
    {
      premio: 'companero',
      marca: otro ? nombreCorto(ES.companeros[otro].nombre) : '—',
      titulo: otro ? `${R.companero}: ${ES.companeros[otro].nombre}` : R.companero,
      texto: otro
        ? `${ES.companeros[otro].pasiva}${gira.companero ? ` ${R.cambia(ES.companeros[gira.companero].nombre, Math.floor(COMPANEROS[gira.companero].precio * GIRA.taberna.venta))}` : ''}`
        : '',
      no: otro ? null : R.yaLoTienes,
    },
    {
      premio: 'raro',
      marca: raro ? nombreCorto(ES.objetos[raro].nombre) : '—',
      titulo: raro ? `${R.raro}: ${ES.objetos[raro].nombre}` : R.raro,
      texto: raro ? ES.objetos[raro].efecto : '',
      no: premioDisponible(gira, 'raro') ? null : raro && gira.bolsa.amuletos.includes(raro) ? R.yaLoTienes : R.sinHueco,
    },
    {
      premio: 'honra',
      marca: 'HONRA',
      titulo: R.honra,
      texto: R.honraTexto,
      no: premioDisponible(gira, 'honra') ? null : R.honraLlena,
    },
  ];
  return (
    <div className="pantalla">
      <Hud gira={gira} />
      <div className="suceso panel panel--sombra">
        <h3>{R.titulo(jefe)}</h3>
        <p>{R.elige}</p>
        <div className="premios">
          {opciones.map((o) => (
            <div key={o.premio} className="premio">
              <span className="marcador">{o.marca}</span>
              <div className="premio__texto">
                <b>{o.titulo}</b>
                {o.texto}
                {o.no && <i>{o.no}</i>}
              </div>
              <BotonApuesta variante="gualda" className="boton-apuesta--peque" disabled={o.no !== null} onClick={() => onElegir(o.premio)}>
                {R.elegir}
              </BotonApuesta>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** El final de la gira: superada la última arena hecha o sin Honra. */
export function FinDeGira({ gira, victoria, onOtra, onPortada }: { gira: Gira; victoria: boolean; onOtra: () => void; onPortada: () => void }) {
  const F = G.fin;
  const arena = ES.arenas[ARENAS[gira.arena]!.id].nombre;
  const siguiente = ARENAS[gira.arena + 1];
  return (
    <div className="pantalla">
      <div className="suceso panel panel--sombra">
        <h3>{victoria ? F.victoria(arena) : F.derrota}</h3>
        <p>{victoria ? F.victoriaTexto(siguiente ? ES.arenas[siguiente.id].nombre : '') : F.derrotaTexto}</p>
        <p className="suceso__grande">{F.duelos(gira.cuenta.ganados, gira.cuenta.duelos)}</p>
        <p>{F.reales(gira.cuenta.reales)}</p>
        <BotonApuesta variante="gualda" onClick={onOtra} autoFocus>
          {F.otra}
        </BotonApuesta>
        <BotonApuesta variante="rendirse" onClick={onPortada}>
          {F.portada}
        </BotonApuesta>
      </div>
    </div>
  );
}
