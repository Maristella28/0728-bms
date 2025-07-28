<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Barangay Clearance</title>
  <link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@700&family=Open+Sans:wght@400;600&display=swap" rel="stylesheet">
  <style>
    @page {
      margin: 0;
      size: A4;
    }
    body {
      margin: 0;
      padding: 0;
      font-family: 'Open Sans', Arial, sans-serif;
      background: #f6fbf7;
    }
    .certificate-container {
      width: 210mm;
      height: 297mm;
      margin: 0 auto;
      background: #fff;
      position: relative;
    }
    .certificate-container::before,
    .certificate-container::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      z-index: 1;
    }
    .certificate-container::before {
      top: 0;
      height: 180px;
      background: linear-gradient(135deg, #b2dfdb 0%, #66bb6a 50%, #4caf50 100%);
      clip-path: polygon(0 0, 100% 0, 100% 100%, 0 60%);
    }
    .certificate-container::after {
      bottom: 0;
      height: 120px;
      background: linear-gradient(135deg, #4caf50 0%, #66bb6a 50%, #b2dfdb 100%);
      clip-path: polygon(0 40%, 100% 0, 100% 100%, 0 100%);
    }
    .corner-logo {
      position: absolute;
      top: 20px;
      width: 80px;
      height: 80px;
      object-fit: contain;
      background: #fff;
      border-radius: 50%;
      border: 2px solid #42b983;
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
      z-index: 10;
    }
    .left-corner-logo { left: 30px; }
    .right-corner-logo { right: 30px; }

    .header {
      padding: 55px 40px 0;
      text-align: center;
      position: relative;
      z-index: 11;
    }
    .republic { font-size: 15px; font-weight: bold; }
    .province, .city { font-size: 13px; }
    .barangay { font-size: 18px; font-weight: bold; }
    .contact { font-size: 11px; color: #4169E1; }

    .certificate-title {
      font-family: 'Times New Roman', serif;
      font-size: 22px;
      font-weight: bold;
      color: #4169E1;
      margin: 15px 0 6px;
      letter-spacing: 1px;
      text-align: center;
    }
    .blue-line {
      width: 100%;
      height: 2px;
      background: #7ea7d8;
      margin: 10px 0 14px;
    }
    .content {
      padding: 0 40px;
      position: relative;
      z-index: 12;
    }
    .modern-card {
      background: transparent;
      padding: 0;
      border: none;
      box-shadow: none;
    }
    .info-section {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      gap: 20px;
    }
    .info-fields {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    .info-field {
      display: flex;
      align-items: center;
      font-size: 11px;
      margin-bottom: 6px;
    }
    .field-label {
      font-weight: bold;
      width: 100px;
    }
    .field-line {
      flex: 0 0 180px;
      border-bottom: 1px solid #999;
      padding: 2px 4px;
      margin-left: 8px;
      font-weight: 600;
      color: #2e7d32;
      text-align: left;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .photo-section {
      flex: 0 0 100px;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 20px;
      padding-top: 20px;
    }
    .photo-box, .thumb-box {
      width: 90px;
      height: 90px;
      border: 1.5px solid #ccc;
      border-radius: 12px;
      background: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      color: #888;
    }
    .thumb-box {
      height: 60px;
    }
    .footer-fields .info-field {
      font-size: 11px;
      margin-bottom: 8px;
    }
    .footer-section {
      margin-top: 20px;
      display: flex;
      justify-content: space-between;
    }
    .signature-area {
      text-align: center;
      flex: 1;
    }
    .signature-line {
      width: 180px;
      height: 1px;
      background: #ccc;
      margin: 16px auto 4px;
    }
    .signature-name {
      font-size: 12px;
      font-weight: bold;
    }
    .signature-title {
      font-size: 10px;
      color: #222;
    }
  </style>
</head>
<body>
  <div class="certificate-container">
    <img src="{{ public_path('assets/logo.jpg') }}" class="corner-logo left-corner-logo" alt="Logo">
    <img src="{{ public_path('assets/logo1.jpg') }}" class="corner-logo right-corner-logo" alt="Logo">

    <div class="header">
      <div class="republic">REPUBLIC OF THE PHILIPPINES</div>
      <div class="province">PROVINCE OF LAGUNA</div>
      <div class="city">CABUYAO CITY</div>
      <div class="barangay">BARANGAY MAMATID</div>
      <div class="contact">0949-588-3131 0906-579-1460</div>
    </div>

    <div class="certificate-title">BARANGAY CLEARANCE</div>
    <div class="blue-line"></div>

    <div class="content">
      <div class="modern-card">
        <div style="margin-bottom: 6px; font-size: 12px;">TO WHOM IT MAY CONCERN:</div>
        <div style="margin-bottom: 10px; font-size: 12px;">
          As per record kept in this office, the person whose name, right thumbmark and signature appear hereon has requested a BARANGAY CLEARANCE with the following information:
        </div>

        <div class="info-section">
          <div class="info-fields">
            @php $fields = [
              ['CLEARANCE NO.', $documentRequest->id ?? 'N/A'],
              ['DATE ISSUED', \Carbon\Carbon::now()->format('M d, Y')],
              ['NAME', "{$resident->first_name} {$resident->middle_name} {$resident->last_name}" . ($resident->name_suffix ? " {$resident->name_suffix}" : '')],
              ['ADDRESS', $resident->full_address ?? 'N/A'],
              ['PERIOD OF STAY', $resident->years_in_barangay . ' years' ?? 'N/A'],
              ['CIVIL STATUS', $resident->civil_status ?? 'N/A'],
              ['DATE OF BIRTH', $resident->birth_date ? \Carbon\Carbon::parse($resident->birth_date)->format('M d, Y') : 'N/A'],
              ['BIRTH PLACE', $resident->birth_place ?? 'N/A'],
              ['GENDER', $resident->sex ?? 'N/A'],
              ['AGE', $resident->age . ' years old' ?? 'N/A'],
              ['PURPOSE', $documentRequest->fields['purpose'] ?? 'Official purposes'],
              ['REMARKS', 'No pending case'],
            ]; @endphp

            @foreach ($fields as [$label, $value])
              <div class="info-field">
                <div class="field-label">{{ $label }}:</div>
                <div class="field-line">{{ $value }}</div>
              </div>
            @endforeach
          </div>

          <div class="photo-section">
            <div class="photo-box">PHOTO</div>
            <div class="thumb-box">THUMBMARK</div>
          </div>
        </div>

        <div class="blue-line"></div>

        <div class="footer-fields">
          <div class="info-field">
            <div class="field-label">CTC NO.:</div>
            <div class="field-line">N/A</div>
          </div>
          <div class="info-field">
            <div class="field-label">PLACE ISSUED:</div>
            <div class="field-line">Barangay Mamatid</div>
          </div>
          <div class="info-field">
            <div class="field-label">DATE ISSUED:</div>
            <div class="field-line">{{ \Carbon\Carbon::now()->format('M d, Y') }}</div>
          </div>
        </div>

        <div class="footer-section">
          <div class="signature-area">
            <div class="signature-line"></div>
            <div class="signature-name">SIGNATURE</div>
          </div>
          <div class="signature-area">
            <div class="signature-line"></div>
            <div class="signature-name">HON. ERNANI G. HIMPISAO</div>
            <div class="signature-title">PUNONG BARANGAY</div>
          </div>
        </div>

      </div>
    </div>
  </div>
</body>
</html>
