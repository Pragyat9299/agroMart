// ============================================================
//  MAKHANA SOURCING FORM — Auto-Generator
//  
//  HOW TO USE:
//  1. Go to script.google.com → New project
//  2. Delete everything in Code.gs
//  3. Paste this entire script
//  4. Replace NOTIFY_EMAIL with your email address
//  5. Click Save (Ctrl+S), then Run → createMakhanaForm
//  6. Approve permissions when prompted
//  7. Check the Execution log for your form URL
//
//  NOTE ON FILE UPLOADS:
//  Google Apps Script CANNOT create File Upload questions programmatically.
//  The API method addFileUploadItem() does not support setFolderId() or 
//  setAllowedFileTypes() — these are editor-only features.
//  
//  WORKAROUND: This script uses text fields for photo/video links.
//  After the script runs, open the form in the editor and manually
//  convert those text fields to File Upload questions if you prefer
//  direct uploads over Drive links.
// ============================================================

function createMakhanaForm() {

  // ── 1. Create the Form ─────────────────────────────────────
  var form = FormApp.create('Makhana Sourcing Form');
  form.setDescription(
    'Complete all sections carefully. Fields marked * are mandatory. ' +
    'A joint photo with the farmer is required before submission.'
  );
  form.setCollectEmail(false);
  form.setAllowResponseEdits(false);
  form.setShowLinkToRespondAgain(false);
  form.setProgressBar(true);

  // ── 2. PART A — Personal Information ──────────────────────
  form.addSectionHeaderItem()
    .setTitle('Part A — Personal Information')
    .setHelpText('Fill in all the details of the farmer or processor you are visiting today.');

  // Farmer Name
  form.addTextItem()
    .setTitle('Name of Farmer / Processor *')
    .setHelpText('Enter the full legal name of the individual or business')
    .setRequired(true);

  // Contact Number with regex validation
  var phoneItem = form.addTextItem()
    .setTitle('Contact Number *')
    .setHelpText('Enter 10-digit mobile number (e.g. 9876543210)')
    .setRequired(true);
  phoneItem.setValidation(
    FormApp.createTextValidation()
      .requireTextMatchesPattern('[6-9][0-9]{9}')
      .setHelpText('Must be a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9')
      .build()
  );

  // Address
  form.addParagraphTextItem()
    .setTitle('Address *')
    .setHelpText('Village / Town, District, State, PIN Code')
    .setRequired(true);

  // Years in Business with number validation
  var yrsItem = form.addTextItem()
    .setTitle('Total Years in Business *')
    .setHelpText('How many years has this farmer/processor been active in makhana business?')
    .setRequired(true);
  yrsItem.setValidation(
    FormApp.createTextValidation()
      .requireNumber()
      .requireNumberGreaterThan(0)
      .setHelpText('Must be a number greater than 0')
      .build()
  );

  // Geo Tag Location
  form.addTextItem()
    .setTitle('Geo Tag Location *')
    .setHelpText(
      'Open Google Maps → Long-press your current location → ' +
      'Copy the coordinates shown at the top → Paste here. ' +
      'Format example: 26.59823, 85.47821'
    )
    .setRequired(true);

  // Farmer Photo — Drive link (since file upload can't be scripted with restrictions)
  form.addTextItem()
    .setTitle('Photo of Farmer / Processor * (Drive Link)')
    .setHelpText(
      'Take a clear photo of the farmer → Upload to Google Drive → ' +
      'Set sharing to "Anyone with the link" → Paste the link here. ' +
      'Both face and surroundings should be visible.'
    )
    .setRequired(true);

  // ── 3. PART B — Farmer Category ───────────────────────────
  form.addPageBreakItem()
    .setTitle('Part B — Farmer Category')
    .setHelpText('Select every category that applies to this supplier. You may select multiple.');

  // Category checkboxes with validation
  var catItem = form.addCheckboxItem()
    .setTitle('Supplier Category *')
    .setHelpText('Select all categories that apply — at least one must be selected');
  catItem.setChoices([
    catItem.createChoice('Guri Supplier — Raw popped foxnuts (ungraded)'),
    catItem.createChoice('Tauli Supplier — Semi-processed / roasted makhana'),
    catItem.createChoice('Graded Makhana Supplier — Size-sorted, quality-graded foxnuts'),
    catItem.createChoice('Makhana Products Supplier — Flavoured makhana, biscuits, macaroni, etc.')
  ]);
  catItem.setRequired(true);
  catItem.setValidation(
    FormApp.createCheckboxValidation()
      .requireSelectAtLeast(1)
      .build()
  );

  // Product Photos — Drive link
  form.addTextItem()
    .setTitle('Photos of Products * (Drive Link)')
    .setHelpText(
      'Upload all product photos to a Google Drive folder → ' +
      'Set sharing to "Anyone with the link" → Paste the folder link here. ' +
      'Include packaging, labels, and bulk stock if visible.'
    )
    .setRequired(true);

  // Product Video — optional Drive link
  form.addTextItem()
    .setTitle('Video of Products / Facility (Drive Link — Optional)')
    .setHelpText(
      'Short video showing the facility, storage, or processing area. ' +
      'Upload to Drive → Paste the shareable link. Not required.'
    )
    .setRequired(false);

  // ── 4. PART C — Rates & Quantity ──────────────────────────
  form.addPageBreakItem()
    .setTitle('Part C — Available Products, Rates & Quantity')
    .setHelpText(
      'List every product the supplier has available right now. ' +
      'For each product, enter the rate per kg and quantity available. ' +
      'Leave rows blank if not applicable.'
    );

  // Product grid — rows = products, columns = Rate and Qty
  var productTypes = [
    'Guri — 3 Sutta (Small)',
    'Guri — 4 Sutta (Medium)',
    'Guri — 5 Sutta (Large)',
    'Tauli — Small',
    'Tauli — Medium',
    'Graded — 4 Sutta Premium',
    'Graded — 6 Sutta Premium',
    'Flavoured Makhana — Classic Salt',
    'Flavoured Makhana — Peri Peri',
    'Flavoured Makhana — Cheese & Onion',
    'Makhana Biscuits',
    'Makhana Macaroni',
    'Other Product (specify below)'
  ];

  form.addGridItem()
    .setTitle('Rate & Quantity Available')
    .setHelpText(
      'For each product available, mark the corresponding row. ' +
      'Then fill in rate and quantity in the fields below. ' +
      'Leave unmarked if the supplier does not carry that product.'
    )
    .setRows(productTypes)
    .setColumns(['Rate (Rs per kg)', 'Quantity Available (kg)']);

  // Primary product fields — required to force at least one entry
  form.addTextItem()
    .setTitle('Primary Product Name *')
    .setHelpText(
      'Type the MAIN product this supplier is selling today (e.g. "Graded - 6 Sutta"). ' +
      'This ensures at least one product is recorded.'
    )
    .setRequired(true);

  form.addTextItem()
    .setTitle('Primary Product Rate (Rs/kg) *')
    .setHelpText('Rate per kg for the primary product listed above')
    .setRequired(true);

  form.addTextItem()
    .setTitle('Primary Product Quantity Available (kg) *')
    .setHelpText('How many kg does the supplier have available right now?')
    .setRequired(true);

  // Additional remarks
  form.addParagraphTextItem()
    .setTitle('Additional Remarks')
    .setHelpText(
      'Payment terms, lead time, packaging details, certifications, minimum order qty, etc. ' +
      'Anything else relevant to this supplier.'
    )
    .setRequired(false);

  // ── 5. JOINT PHOTO GATE ────────────────────────────────────
  form.addPageBreakItem()
    .setTitle('Joint Photo — Mandatory')
    .setHelpText(
      'WARNING: This section is required. The form CANNOT be submitted without a joint photo. ' +
      'Take a photo that clearly shows BOTH you and the farmer together at the sourcing location.'
    );

  // Joint photo — Drive link
  form.addTextItem()
    .setTitle('Joint Photo — Agent with Farmer * (Drive Link)')
    .setHelpText(
      'Take a selfie or ask someone nearby to photograph you and the farmer together. ' +
      'Upload to Google Drive → Set sharing → Paste the link here. ' +
      'Both faces must be clearly visible. MANDATORY for submission.'
    )
    .setRequired(true);

  // Declaration checkbox
  var declItem = form.addCheckboxItem()
    .setTitle('Declaration *')
    .setHelpText('You must tick this box to submit the form.');
  declItem.setChoices([
    declItem.createChoice(
      'I confirm that the joint photo above clearly shows me and the farmer/processor ' +
      'together at the sourcing location on today\'s date, and all information entered is accurate.'
    )
  ]);
  declItem.setRequired(true);
  declItem.setValidation(
    FormApp.createCheckboxValidation()
      .requireSelectExactly(1)
      .build()
  );

  // ── 6. Confirmation message ────────────────────────────────
  form.setConfirmationMessage(
    'Your sourcing entry has been submitted successfully!\n\n' +
    'The sourcing team lead has been notified. ' +
    'You can now close this page or submit another entry.'
  );

  // ── 7. Link to Google Sheet ────────────────────────────────
  var ss = SpreadsheetApp.create('Makhana Sourcing Responses');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());

  var sheet = ss.getActiveSheet();
  sheet.setName('Form Responses');
  Utilities.sleep(2000);

  // ── 8. Log output URLs ─────────────────────────────────────
  Logger.log('');
  Logger.log('=== FORM CREATED SUCCESSFULLY ===');
  Logger.log('');
  Logger.log('Form edit URL (you)  : ' + form.getEditUrl());
  Logger.log('Form fill URL (team) : ' + form.getPublishedUrl());
  Logger.log('Responses Sheet      : ' + ss.getUrl());
  Logger.log('');
  Logger.log('NEXT STEPS:');
  Logger.log('1. Share the Form fill URL with your sourcing team via WhatsApp.');
  Logger.log('2. (Optional) Open the form editor and convert Drive Link text fields');
  Logger.log('   to File Upload questions for direct photo uploads.');
  Logger.log('');

  // ── 9. Set up submission email trigger ────────────────────
  ScriptApp.newTrigger('onMakhanaFormSubmit')
    .forForm(form)
    .onFormSubmit()
    .create();

  Logger.log('Email alert trigger created.');
  Logger.log('Edit NOTIFY_EMAIL variable in this script to change the recipient.');
}


// ════════════════════════════════════════════════════════════
// EMAIL ALERT — fires on every form submission
// ════════════════════════════════════════════════════════════

var NOTIFY_EMAIL = 'sourcing-lead@yourcompany.com'; // ← CHANGE THIS TO YOUR EMAIL

function onMakhanaFormSubmit(e) {
  try {
    var r = e.response;
    var items = r.getItemResponses();
    var data = {};
    items.forEach(function(item) {
      data[item.getItem().getTitle()] = item.getResponse();
    });

    var farmerName = data['Name of Farmer / Processor *'] || '-';
    var contact    = data['Contact Number *'] || '-';
    var address    = data['Address *'] || '-';
    var cats       = data['Supplier Category *'] || '-';
    var primary    = data['Primary Product Name *'] || '-';
    var rate       = data['Primary Product Rate (Rs/kg) *'] || '-';
    var qty        = data['Primary Product Quantity Available (kg) *'] || '-';
    var remarks    = data['Additional Remarks'] || '-';
    var submitted  = Utilities.formatDate(
      r.getTimestamp(), Session.getScriptTimeZone(), 'dd-MMM-yyyy HH:mm'
    );

    var subject = 'New Makhana Sourcing Entry: ' + farmerName;

    var body =
      'A new Makhana sourcing entry has been submitted.\n\n' +
      '-----------------------------\n' +
      'FARMER DETAILS\n' +
      '-----------------------------\n' +
      'Name       : ' + farmerName + '\n' +
      'Contact    : ' + contact + '\n' +
      'Address    : ' + address + '\n\n' +
      'CATEGORIES : ' + (Array.isArray(cats) ? cats.join(', ') : cats) + '\n\n' +
      'PRIMARY PRODUCT\n' +
      '-----------------------------\n' +
      'Product    : ' + primary + '\n' +
      'Rate       : Rs.' + rate + '/kg\n' +
      'Quantity   : ' + qty + ' kg\n\n' +
      'Remarks    : ' + remarks + '\n\n' +
      'Submitted  : ' + submitted + '\n\n' +
      'Open the Google Sheet to view full details and uploaded photos.\n';

    MailApp.sendEmail({ to: NOTIFY_EMAIL, subject: subject, body: body });

  } catch(err) {
    Logger.log('Email alert error: ' + err);
  }
}
