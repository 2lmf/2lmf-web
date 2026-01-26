// -----------------------------------------------------------------------
// 2LMF PRO - Email System (Fixed V2)
// -----------------------------------------------------------------------

function doPost(e) {
  try {
    var params = e.parameter;
    
    var emailUser = params.email;
    var nameUser = params.name || "Kupac";
    var phoneUser = params.phone || "";
    var messageBody = params.message; // Fallback plain text
    var subject = params._subject || "2LMF Kalkulator Izračun";
    var itemsJson = params.items_json || "[]";
    var items = JSON.parse(itemsJson);
    var grandTotal = params.grand_total || "0,00 €"; // If sent from frontend

    // 1. Generate HTML Tables
    var customerHtml = generateCustomerHtml(items, nameUser, subject);
    var adminHtml = generateAdminHtml(items, nameUser, emailUser, phoneUser, subject);

    // 2. Send Immediate Emails
    // A) To Customer (Orange Theme)
    MailApp.sendEmail({
      to: emailUser,
      subject: subject,
      htmlBody: customerHtml,
      replyTo: "2lmf.info@gmail.com",
      name: "2LMF PRO Kalkulator"
    });

    // B) To Admin (Detailed View)
    MailApp.sendEmail({
      to: "2lmf.info@gmail.com",
      subject: "[NOVI UPIT] " + nameUser + " - " + subject,
      htmlBody: adminHtml
    });

    // 3. Schedule Delayed Follow-up
    queueFollowUp(emailUser, nameUser);

    return ContentService.createTextOutput(JSON.stringify({ 'result': 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 'result': 'error', 'error': error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function generateCustomerHtml(items, name, subject) {
  var totalAmount = calculateTotal(items);
  
  var html = "<div style='font-family: Arial, sans-serif; color: #333; max-width: 600px;'>" +
             "<h2 style='color: #FB8C00;'>2LMF PRO - Inforativni Izračun</h2>" +
             "<p>Poštovani <b>" + name + "</b>,</p>" +
             "<p>Zahvaljujemo na Vašem interesu. Ispod se nalazi specifikacija materijala prema Vašem upitu: <b>" + subject + "</b></p>" +
             
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
          "Budući da se stanje lagera konstantno mijenja, ovaj izračun (i trenutne cijene) vrijede 48 sati. Za fiksnu ponudu molimo potvrdite interes odgovorom na ovaj mail." +
          "</div>" +
          
          "<p style='margin-top: 20px;'>Slobodno nas kontaktirajte za sva dodatna pitanja.</p>" +
          "<p>Lijep pozdrav,<br><b>Vaš 2LMF PRO Tim</b><br>Mob: +385 95 311 5007</p>" +
          "</div>";
          
  return html;
}

function generateAdminHtml(items, name, email, phone, subject) {
  var totalAmount = calculateTotal(items);
  
  var html = "<div style='font-family: Arial, sans-serif; color: #333;'>" +
             "<h2 style='color: #2c3e50;'>Novi Upit sa Weba</h2>" +
             "<div style='background: #f4f4f4; padding: 15px; border-radius: 5px; margin-bottom: 20px;'>" +
             "<b>Kupac:</b> " + name + "<br>" +
             "<b>Email:</b> " + email + "<br>" +
             "<b>Telefon:</b> " + phone + "<br>" +
             "<b>Modul:</b> " + subject +
             "</div>" +
             
             "<table style='width: 100%; border-collapse: collapse;'>" +
             "<thead>" +
             "<tr style='background-color: #34495e; color: white;'>" +
             "<th style='padding: 8px; text-align: left; border: 1px solid #ddd;'>Materijal</th>" +
             "<th style='padding: 8px; text-align: center; border: 1px solid #ddd;'>Količina</th>" +
             "<th style='padding: 8px; text-align: right; border: 1px solid #ddd;'>Prodajna Cijena</th>" +
             "<th style='padding: 8px; text-align: right; border: 1px solid #ddd;'>Ukupno</th>" +
             "</tr>" +
             "</thead>" +
             "<tbody>";

  items.forEach(function(item) {
    var lineTotal = item.qty * item.price_sell;
    html += "<tr>" +
            "<td style='padding: 8px; border: 1px solid #ddd;'>" + item.name + "</td>" +
            "<td style='padding: 8px; border: 1px solid #ddd; text-align: center;'>" + item.qty + " " + item.unit + "</td>" +
            "<td style='padding: 8px; border: 1px solid #ddd; text-align: right;'>" + item.price_sell.toLocaleString('hr-HR', {minimumFractionDigits: 2}) + " €</td>" +
            "<td style='padding: 8px; border: 1px solid #ddd; text-align: right;'>" + lineTotal.toLocaleString('hr-HR', {minimumFractionDigits: 2}) + " €</td>" +
            "</tr>";
  });

  html += "</tbody>" +
          "<tfoot>" +
          "<tr style='font-weight: bold; background: #eee;'>" +
          "<td colspan='3' style='padding: 8px; border: 1px solid #ddd; text-align: right;'>SUMARNO:</td>" +
          "<td style='padding: 8px; border: 1px solid #ddd; text-align: right;'>" + totalAmount.toLocaleString('hr-HR', {minimumFractionDigits: 2}) + " €</td>" +
          "</tr>" +
          "</tfoot>" +
          "</table>" +
          "</div>";
          
  return html;
}

function calculateTotal(items) {
  var total = 0;
  items.forEach(function(item) {
    total += item.qty * item.price_sell;
  });
  return total;
}

// --- DISCLAIMER TEXT (UPDATED) ---
function getDisclaimerText() {
  return "--------------------------------------------------\n" +
         "NAPOMENA O CIJENAMA:\n" +
         "Budući da se stanje lagera konstantno mijenja, ovaj izračun (i trenutne cijene) \n" +
         "vrijede 48 sati. Za fiksnu ponudu molimo potvrdite interes odgovorom na ovaj mail.\n" +
         "--------------------------------------------------";
}

// --- FOLLOW UP QUEUE LOGIC ---
// Trigger this function every 1 hour (Time-based trigger)
// It checks if there are pending follow-ups
function processFollowUpQueue() {
  var props = PropertiesService.getScriptProperties();
  var queueJSON = props.getProperty("FOLLOW_UP_QUEUE");
  var queue = queueJSON ? JSON.parse(queueJSON) : [];
  
  var now = new Date().getTime();
  var newQueue = [];
  var processedCount = 0;

  for (var i = 0; i < queue.length; i++) {
    var item = queue[i];
    // Check if 24 hours (86400000 ms) have passed, or e.g. 2 minutes for test
    // Let's set it to 2 hours for "delayed check" as per typical request, or 24h.
    // Assuming user wants some delay. Let's say 24 hours.
    var delayTime = 24 * 60 * 60 * 1000; 
    
    if (now - item.timestamp > delayTime) {
      // Time to send!
      sendFeedbackEmail(item.email, item.name);
      processedCount++;
    } else {
      // Keep in queue
      newQueue.push(item);
    }
  }

  // Save cleaned queue
  if (processedCount > 0 || newQueue.length !== queue.length) {
    props.setProperty("FOLLOW_UP_QUEUE", JSON.stringify(newQueue));
  }
}

// Helper to add to queue
function queueFollowUp(email, name) {
  var props = PropertiesService.getScriptProperties();
  var queueJSON = props.getProperty("FOLLOW_UP_QUEUE");
  var queue = queueJSON ? JSON.parse(queueJSON) : [];
  
  queue.push({
    email: email,
    name: name,
    timestamp: new Date().getTime()
  });
  
  props.setProperty("FOLLOW_UP_QUEUE", JSON.stringify(queue));
  
  // Ensure the trigger exists
  ensureTrigger();
}

// Sends the actual Feedback Email
function sendFeedbackEmail(email, name) {
  var subject = "Jeste li uspjeli pogledati ponudu? - 2LMF PRO";
  var body = "Poštovani " + name + ",\n\n" +
             "Jučer ste radili izračun na našem kalkulatoru.\n" +
             "Javljamo se samo da provjerimo imate li kakvih pitanja ili trebate pomoć oko specifikacije?\n\n" +
             "Slobodno odgovorite na ovaj mail ili nas nazovite.\n\n" +
             "Lijepi pozdrav,\n" +
             "2LMF Tim";
             
  // IMPORTANT: Send TO the customer using the stored email
  MailApp.sendEmail({
    to: email, 
    subject: subject,
    body: body
  });
}

function ensureTrigger() {
  // Check if trigger exists
  var triggers = ScriptApp.getProjectTriggers();
  var exists = false;
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'processFollowUpQueue') {
      exists = true;
      break;
    }
  }
  
  if (!exists) {
    // Run every hour
    ScriptApp.newTrigger('processFollowUpQueue')
      .timeBased()
      .everyHours(1)
      .create();
  }
}
