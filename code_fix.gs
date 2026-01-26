// --- BUSINESS LOGIC: MATERIAL CONFIGURATION ---
// Ovdje možete podesiti nabavne cijene i dobavljače. 
// Sustav traži ključnu riječ u nazivu materijala.
const MATERIAL_CONFIG = {
  "XPS": { buy_factor: 0.85, supplier: "RAVA" },
  "Kamena vuna": { buy_factor: 0.82, supplier: "RAVA" },
  "TPO": { buy_factor: 0.75, supplier: "RAVA" },
  "PVC": { buy_factor: 0.75, supplier: "RAVA" },
  "Diamond": { buy_factor: 0.80, supplier: "RAVA" },
  "Ruby": { buy_factor: 0.80, supplier: "RAVA" },
  "Vapor": { buy_factor: 0.80, supplier: "RAVA" },
  "2D panel": { buy_factor: 0.90, supplier: "Dobavljač Ograde" },
  "3D panel": { buy_factor: 0.90, supplier: "Dobavljač Ograde" },
  "Stup": { buy_factor: 0.88, supplier: "Dobavljač Ograde" },
  "Pješačka vrata": { buy_factor: 0.85, supplier: "Dobavljač Ograde" },
  "Spojnice": { buy_factor: 0.50, supplier: "Dobavljač Ograde" },
  "Sidreni vijci": { buy_factor: 0.50, supplier: "Dobavljač Ograde" },
  "Aquamat": { buy_factor: 0.80, supplier: "Isomat" },
  "Isoflex": { buy_factor: 0.80, supplier: "Isomat" },
  "AK-20": { buy_factor: 0.80, supplier: "Isomat" },
  "Usluga montaže": { buy_factor: 0.70, supplier: "Vanjski kooperant" }
};

function doPost(e) {
  try {
    var params = e.parameter;
    
    var emailUser = params.email;
    var nameUser = params.name || "Kupac";
    var phoneUser = params.phone || "";
    var subject = params._subject || "2LMF Kalkulator Izračun";
    var itemsJson = params.items_json || "[]";
    var items = JSON.parse(itemsJson);

    // 1. Obrada podataka s poslovnom logikom
    var enrichedItems = enrichItemsWithBusinessLogic(items);

    // 2. Generiranje HTML tablica
    var customerHtml = generateCustomerHtml(enrichedItems, nameUser, subject);
    var adminHtml = generateAdminHtml(enrichedItems, nameUser, emailUser, phoneUser, subject);

    // 3. Slanje mailova
    MailApp.sendEmail({
      to: emailUser,
      subject: subject,
      htmlBody: customerHtml,
      replyTo: "2lmf.info@gmail.com",
      name: "2LMF PRO Kalkulator"
    });

    MailApp.sendEmail({
      to: "2lmf.info@gmail.com",
      subject: "[NOVI UPIT] " + nameUser + " - " + subject,
      htmlBody: adminHtml
    });

    queueFollowUp(emailUser, nameUser);

    return ContentService.createTextOutput(JSON.stringify({ 'result': 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 'result': 'error', 'error': error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function enrichItemsWithBusinessLogic(items) {
  return items.map(function(item) {
    var config = { buy_factor: 0.80, supplier: "Ostalo" }; // Default
    
    for (var key in MATERIAL_CONFIG) {
      if (item.name.toLowerCase().indexOf(key.toLowerCase()) !== -1) {
        config = MATERIAL_CONFIG[key];
        break;
      }
    }
    
    item.price_buy = item.price_sell * config.buy_factor;
    item.supplier = config.supplier;
    item.profit = item.price_sell - item.price_buy;
    item.margin_pct = (item.profit / item.price_sell) * 100;
    
    return item;
  });
}

function generateCustomerHtml(items, name, subject) {
  var totalAmount = calculateTotal(items, 'price_sell');
  
  var html = "<div style='font-family: Arial, sans-serif; color: #333; max-width: 600px;'>" +
             "<h2 style='color: #FB8C00;'>2LMF PRO - Informativni Izračun</h2>" +
             "<p>Poštovani <b>" + name + "</b>,</p>" +
             "<p>Zahvaljujemo na Vašem interesu. Ispod se nalazi specifikacija prema Vašem upitu: <b>" + subject + "</b></p>" +
             
             "<table style='width: 100%; border-collapse: collapse; margin-top: 20px;'>" +
             "<thead>" +
             "<tr style='background-color: #FB8C00; color: white;'>" +
             "<th style='padding: 10px; text-align: left; border: 1px solid #ddd;'>Stavka</th>" +
             "<th style='padding: 10px; text-align: center; border: 1px solid #ddd;'>Kol.</th>" +
             "<th style='padding: 10px; text-align: right; border: 1px solid #ddd;'>Cijena</th>" +
             "<th style='padding: 10px; text-align: right; border: 1px solid #ddd;'>Ukupno</th>" +
             "</tr>" +
             "</thead>" +
             "<tbody>";

  items.forEach(function(item) {
    var lineTotal = item.qty * item.price_sell;
    html += "<tr>" +
            "<td style='padding: 10px; border: 1px solid #ddd;'>" + item.name + "</td>" +
            "<td style='padding: 10px; border: 1px solid #ddd; text-align: center;'>" + item.qty + " " + item.unit + "</td>" +
            "<td style='padding: 10px; border: 1px solid #ddd; text-align: right;'>" + item.price_sell.toLocaleString('hr-HR', {minimumFractionDigits: 2}) + " €</td>" +
            "<td style='padding: 10px; border: 1px solid #ddd; text-align: right;'>" + lineTotal.toLocaleString('hr-HR', {minimumFractionDigits: 2}) + " €</td>" +
            "</tr>";
  });

  html += "</tbody>" +
          "<tfoot>" +
          "<tr style='background-color: #f9f9f9; font-weight: bold;'>" +
          "<td colspan='3' style='padding: 10px; border: 1px solid #ddd; text-align: right;'>SVEUKUPNO (sa PDV-om):</td>" +
          "<td style='padding: 10px; border: 1px solid #ddd; text-align: right; color: #FB8C00; font-size: 18px;'>" + totalAmount.toLocaleString('hr-HR', {minimumFractionDigits: 2}) + " €</td>" +
          "</tr>" +
          "</tfoot>" +
          "</table>" +
          
          "<div style='margin-top: 25px; padding: 15px; background-color: #fff3e0; border-left: 5px solid #FB8C00; font-size: 13px;'>" +
          "<b>NAPOMENA O CIJENAMA:</b><br>" +
          "Budući da se stanje lagera konstantno mijenja, ovaj izračun (i trenutne cijene) vrijede 48 sati." +
          "</div>" +
          "<p>Lijep pozdrav,<br><b>Vaš 2LMF PRO Tim</b></p></div>";
          
  return html;
}

function generateAdminHtml(items, name, email, phone, subject) {
  var totalSell = calculateTotal(items, 'price_sell');
  var totalBuy = calculateTotal(items, 'price_buy');
  var totalProfit = totalSell - totalBuy;
  
  var html = "<div style='font-family: Arial, sans-serif; color: #333;'>" +
             "<h2 style='color: #2c3e50;'>ADMIN REPORT: Novi Upit</h2>" +
             "<div style='background: #f4f4f4; padding: 15px; border-radius: 5px; margin-bottom: 20px;'>" +
             "<b>Kupac:</b> " + name + " | <b>Email:</b> " + email + " | <b>Tel:</b> " + phone + "<br>" +
             "<b>Modul:</b> " + subject +
             "</div>" +
             
             "<table style='width: 100%; border-collapse: collapse; font-size: 12px;'>" +
             "<thead>" +
             "<tr style='background-color: #34495e; color: white;'>" +
             "<th style='padding: 8px; text-align: left; border: 1px solid #ddd;'>Materijal</th>" +
             "<th style='padding: 8px; text-align: center; border: 1px solid #ddd;'>Kol.</th>" +
             "<th style='padding: 8px; text-align: right; border: 1px solid #ddd;'>Prodajna</th>" +
             "<th style='padding: 8px; text-align: right; border: 1px solid #ddd; background:#2ecc71;'>Nabavna</th>" +
             "<th style='padding: 8px; text-align: right; border: 1px solid #ddd; background:#e67e22;'>Marža (€)</th>" +
             "<th style='padding: 8px; text-align: center; border: 1px solid #ddd;'>Dobavljač</th>" +
             "</tr>" +
             "</thead>" +
             "<tbody>";

  items.forEach(function(item) {
    html += "<tr>" +
            "<td style='padding: 8px; border: 1px solid #ddd;'>" + item.name + "</td>" +
            "<td style='padding: 8px; border: 1px solid #ddd; text-align: center;'>" + item.qty + " " + item.unit + "</td>" +
            "<td style='padding: 8px; border: 1px solid #ddd; text-align: right;'>" + item.price_sell.toLocaleString('hr-HR', {minimumFractionDigits: 2}) + " €</td>" +
            "<td style='padding: 8px; border: 1px solid #ddd; text-align: right; font-weight:bold;'>" + item.price_buy.toLocaleString('hr-HR', {minimumFractionDigits: 2}) + " €</td>" +
            "<td style='padding: 8px; border: 1px solid #ddd; text-align: right;'>" + item.profit.toLocaleString('hr-HR', {minimumFractionDigits: 2}) + " €</td>" +
            "<td style='padding: 8px; border: 1px solid #ddd; text-align: center;'>" + item.supplier + "</td>" +
            "</tr>";
  });

  html += "</tbody>" +
          "<tfoot>" +
          "<tr style='font-weight: bold; background: #eee;'>" +
          "<td colspan='2' style='padding: 8px; border: 1px solid #ddd;'>TOTALNI IZNOSI:</td>" +
          "<td style='padding: 8px; border: 1px solid #ddd; text-align: right;'>" + totalSell.toLocaleString('hr-HR', {minimumFractionDigits: 2}) + " €</td>" +
          "<td style='padding: 8px; border: 1px solid #ddd; text-align: right;'>" + totalBuy.toLocaleString('hr-HR', {minimumFractionDigits: 2}) + " €</td>" +
          "<td style='padding: 8px; border: 1px solid #ddd; text-align: right; color:#d35400;'>" + totalProfit.toLocaleString('hr-HR', {minimumFractionDigits: 2}) + " €</td>" +
          "<td style='padding: 8px; border: 1px solid #ddd; text-align: center;'>-</td>" +
          "</tr>" +
          "</tfoot>" +
          "</table>" +
          "</div>";
          
  return html;
}

function calculateTotal(items, priceField) {
  var total = 0;
  items.forEach(function(item) {
    total += item.qty * item[priceField];
  });
  return total;
}

// --- FOLLOW UP & TRIGGER LOGIC (KEEP AS IS) ---
function processFollowUpQueue() {
  var props = PropertiesService.getScriptProperties();
  var queueJSON = props.getProperty("FOLLOW_UP_QUEUE");
  var queue = queueJSON ? JSON.parse(queueJSON) : [];
  var now = new Date().getTime();
  var newQueue = [];
  for (var i = 0; i < queue.length; i++) {
    var item = queue[i];
    if (now - item.timestamp > 86400000) { sendFeedbackEmail(item.email, item.name); } 
    else { newQueue.push(item); }
  }
  props.setProperty("FOLLOW_UP_QUEUE", JSON.stringify(newQueue));
}

function queueFollowUp(email, name) {
  var props = PropertiesService.getScriptProperties();
  var queueJSON = props.getProperty("FOLLOW_UP_QUEUE");
  var queue = queueJSON ? JSON.parse(queueJSON) : [];
  queue.push({ email: email, name: name, timestamp: new Date().getTime() });
  props.setProperty("FOLLOW_UP_QUEUE", JSON.stringify(queue));
  ensureTrigger();
}

function sendFeedbackEmail(email, name) {
  MailApp.sendEmail({
    to: email, 
    subject: "Jeste li uspjeli pogledati ponudu? - 2LMF PRO",
    body: "Poštovani " + name + ",\n\nJavljamo se samo da provjerimo imate li kakvih pitanja oko jučerašnjeg izračuna?\n\nLijepi pozdrav,\n2LMF Tim"
  });
}

function ensureTrigger() {
  if (ScriptApp.getProjectTriggers().length === 0) {
    ScriptApp.newTrigger('processFollowUpQueue').timeBased().everyHours(1).create();
  }
}
