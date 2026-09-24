// EL MODO EDITOR APAGA EL CROMO DEL PORTAL, NO LO ENCOGE.
//
// Veredicto del consejo (Leo/Julian/Sora), 2026-09-24, a pedido de Francisco:
// "necesito que el teléfono siempre se pueda ver completo... que el menú de
// arriba se colapse o se vaya". Las dos barras que hoy viven encima de toda
// pantalla del portal (BARRA_CASA, 56px, fija, y BARRA_WORKSPACE de
// PersonaLab, 48px) suman 104px que, sumados a los 69px de la cabecera
// propia del editor, dejaban al teléfono de vista previa calculándose contra
// un offset de 173px -- en una laptop común eso no le alcanzaba para
// mostrarse completo sin que la página entera hiciera scroll.
//
// Leo: las dos barras se quitan POR COMPLETO mientras se edita, no una
// versión encogida -- una versión mínima ocupa espacio sin dar valor.
// Julian: pantalla completa dedicada, cero versión comprimida -- la cabecera
// propia del editor ya es firma suficiente. Sora: nadie navega a otra
// sección de PersonaLab ni cierra sesión a mitad de un pensamiento; el
// enlace "← [nombre]" que la cabecera del editor ya trae es toda la
// orientación y toda la salida que hace falta.
//
// `AdminChrome.tsx` (la barra de la casa) y `PersonaLabChrome.tsx` (la
// barra de PersonaLab) son quienes de verdad apagan cada una contra esta
// misma función -- las dos tienen que estar de acuerdo en la misma regla o
// el modo editor deja un hueco a medio apagar.
export function enModoEditor(pathname: string | null): boolean {
  if (!pathname) return false
  return /^\/personalab\/experiencias\/[^/]+\/editor(\/|$)/.test(pathname)
}
