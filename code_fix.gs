// -----------------------------------------------------------------------
// 2LMF PRO - Email System (Fixed V2)
// -----------------------------------------------------------------------

function doPost(e) {
  try {
    var params = e.parameter;
    
    var emailUser = params.email;
    var nameUser = params.name || "Kupac";
    var phoneUser = params.phone || "";
    var messageBody = params.message; // Frontend formated text
    var subject = params._subject || "2LMF Kalkulator Izračun";
    var itemsJson = params.items_json || "[]"; // For potential HTML table generation

    // 1. Send Immediate Emails
    // A) To Customer
    MailApp.sendEmail({
      to: emailUser,
      subject: subject,
      body: messageBody + "\n\n" + getDisclaimerText(), // Append updated disclaimer
      replyTo: "2lmf.info@gmail.com",
      name: "2LMF PRO Kalkulator"
    });

    // B) To Admin (Notification)
    MailApp.sendEmail({
      to: "2lmf.info@gmail.com",
      subject: "[NOVI UPIT] " + nameUser + " - " + subject,
      body: "Stigao je novi izračun!\n\nEmail: " + emailUser + "\nTel: " + phoneUser + "\n\n" + messageBody
    });

    // 2. Schedule Delayed Follow-up (Feedback Check)
    // We store the user data in a queue to handle multiple users correctly
    queueFollowUp(emailUser, nameUser);

    // Return JSON Success
    return ContentService.createTextOutput(JSON.stringify({ 'result': 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 'result': 'error', 'error': error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
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
