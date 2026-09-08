/* QC Insight – platba kartou cez Stripe Payment Link.
   Po aktivácii Stripe účtu vložte sem odkaz z Stripe Dashboardu
   (Payment Links → QC Insight → Copy link), napr. "https://buy.stripe.com/xxxx".
   Kým je prázdny, tlačidlo vedie na kontaktný formulár s predvoleným QC Insight. */
var QC_PAYMENT_LINK = "";

(function () {
  var hasLink = typeof QC_PAYMENT_LINK === 'string' && QC_PAYMENT_LINK.indexOf('https://') === 0;
  document.querySelectorAll('a[data-pay-link]').forEach(function (a) {
    var label = a.querySelector('[data-i18n]');
    if (hasLink) {
      a.setAttribute('href', QC_PAYMENT_LINK);
      a.setAttribute('rel', 'noopener');
      if (label) label.setAttribute('data-i18n', 'pay.cta.card');
    } else {
      a.setAttribute('href', 'contact.html?service=insight');
      if (label) label.setAttribute('data-i18n', 'pay.cta.order');
    }
  });
  // Kontaktný formulár: predvoliť službu z URL (?service=insight)
  var sel = document.querySelector('select[name="service"]');
  if (sel) {
    try {
      var want = new URLSearchParams(window.location.search).get('service');
      if (want && sel.querySelector('option[value="' + want + '"]')) sel.value = want;
    } catch (e) {}
  }
})();
