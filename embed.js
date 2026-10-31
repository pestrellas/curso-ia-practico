/* embed.js — integración de las páginas del curso con Moodle (training.techxpert.guru)

   Cada página lo carga con:
     <script src="/curso-ia-practico/embed.js"></script>

   Solo actúa cuando la página está dentro de un iframe (por ejemplo, en Moodle):
   1. Si el fondo de la página es claro, quita el padding y el fondo del <body>
      para que se funda con el curso (las páginas oscuras se dejan como están).
   2. Envía su altura real a la página que la contiene. Moodle tiene un script
      en "HTML adicional" que ajusta la altura del iframe y elimina el scroll interno.

   Abierta directamente en el navegador, la página se ve exactamente igual que antes. */
(function () {
  if (window.self === window.top) return;

  function esClaro(color) {
    var m = color && color.match(/\d+(\.\d+)?/g);
    if (!m || m.length < 3) return false;
    if (m.length >= 4 && parseFloat(m[3]) === 0) return true; // transparente
    var l = (0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]) / 255;
    return l > 0.85;
  }

  function integrar() {
    if (esClaro(getComputedStyle(document.body).backgroundColor)) {
      var css = document.createElement('style');
      css.textContent = 'html.en-moodle,html.en-moodle body{background:transparent!important}' +
                        'html.en-moodle body{padding:0 0 8px!important;margin:0!important}';
      document.head.appendChild(css);
      document.documentElement.classList.add('en-moodle');
    }
  }

  var ultima = 0;
  function enviarAltura() {
    var h = Math.ceil(Math.max(document.documentElement.scrollHeight, document.body.scrollHeight));
    if (h === ultima) return;
    ultima = h;
    window.parent.postMessage({ tipo: 'txg-embed-altura', altura: h }, '*');
  }

  function iniciar() {
    integrar();
    enviarAltura();
    window.addEventListener('load', enviarAltura);
    window.addEventListener('resize', enviarAltura);
    if ('ResizeObserver' in window) new ResizeObserver(enviarAltura).observe(document.body);
    document.addEventListener('click', function () { setTimeout(enviarAltura, 350); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
