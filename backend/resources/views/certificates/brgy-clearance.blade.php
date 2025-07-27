<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Barangay Clearance</title>
    <style>
        @page {
            margin: 0;
            size: A4;
        }
        body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #E8F5E8 0%, #F0FFF0 50%, #E8F5E8 100%);
            position: relative;
        }
        .certificate-container {
            width: 210mm;
            height: 297mm;
            margin: 0 auto;
            background: linear-gradient(135deg, #E8F5E8 0%, #F0FFF0 50%, #E8F5E8 100%);
            position: relative;
            overflow: hidden;
        }
        .wavy-pattern {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-image: 
                radial-gradient(circle at 20% 20%, rgba(144, 238, 144, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 80% 30%, rgba(152, 251, 152, 0.2) 0%, transparent 50%),
                radial-gradient(circle at 40% 70%, rgba(144, 238, 144, 0.2) 0%, transparent 50%),
                radial-gradient(circle at 70% 80%, rgba(152, 251, 152, 0.3) 0%, transparent 50%);
            background-size: 200px 200px, 150px 150px, 180px 180px, 120px 120px;
            background-position: 0 0, 50px 30px, 100px 100px, 150px 200px;
        }
        .header {
            position: relative;
            z-index: 2;
            padding: 15px 40px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
        }
        .left-seal {
            width: 70px;
            height: 70px;
            border: 2px solid #FF0000;
            border-radius: 50%;
            background: white;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-size: 7px;
            font-weight: bold;
            color: #000;
            text-align: center;
            line-height: 1.2;
        }
        .left-seal .barangay {
            font-size: 8px;
            margin-bottom: 2px;
        }
        .left-seal .city {
            font-size: 6px;
        }
        .left-seal .stars {
            font-size: 5px;
            margin: 2px 0;
        }
        .center-header {
            text-align: center;
            flex: 1;
            margin: 0 30px;
        }
        .republic {
            font-size: 13px;
            font-weight: bold;
            margin-bottom: 2px;
        }
        .province {
            font-size: 11px;
            font-weight: bold;
            margin-bottom: 2px;
        }
        .city {
            font-size: 11px;
            font-weight: bold;
            margin-bottom: 2px;
        }
        .barangay {
            font-size: 13px;
            font-weight: bold;
            margin-bottom: 3px;
        }
        .contact {
            font-size: 9px;
            color: #4169E1;
            margin-bottom: 3px;
        }
        .right-seal {
            width: 70px;
            height: 70px;
            border: 2px solid #FF0000;
            border-radius: 50%;
            background: white;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-size: 7px;
            font-weight: bold;
            text-align: center;
            line-height: 1.2;
        }
        .right-seal .heart {
            color: #FF0000;
            font-size: 9px;
            margin-bottom: 1px;
        }
        .right-seal .wow {
            color: #FFD700;
            font-size: 11px;
            font-weight: bold;
            -webkit-text-stroke: 1px #FF0000;
            margin-bottom: 1px;
        }
        .right-seal .tinig {
            font-size: 5px;
            color: #FF0000;
        }
        .certificate-title {
            text-align: center;
            font-size: 20px;
            font-weight: bold;
            color: #4169E1;
            margin: 30px 0 10px;
            letter-spacing: 2px;
        }
        .title-line {
            width: 70%;
            height: 1px;
            background: #4169E1;
            margin: 0 auto 15px;
            position: relative;
            z-index: 2;
        }
        .content {
            padding: 0 40px;
            position: relative;
            z-index: 2;
        }
        .top-blue-line {
            width: 100%;
            height: 1px;
            background: #4169E1;
            margin-bottom: 15px;
        }
        .intro-text {
            font-size: 11px;
            line-height: 1.4;
            margin-bottom: 15px;
        }
        .intro-text .bold {
            font-weight: bold;
        }
        .salutation-line {
            width: 100%;
            height: 1px;
            background: #4169E1;
            margin: 10px 0 15px;
        }
        .info-section {
            display: flex;
            gap: 30px;
            align-items: flex-start;
        }
        .info-fields {
            flex: 2;
        }
        .photo-section {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 20px;
            align-items: flex-end;
        }
        .info-field {
            display: flex;
            align-items: center;
            margin-bottom: 14px;
            font-size: 12px;
        }
        .field-label {
            font-weight: bold;
            min-width: 120px;
            margin-right: 8px;
            text-align: left;
        }
        .field-line {
            flex: 1;
            height: 1px;
            background: transparent;
            margin-left: 5px;
            border-bottom: 1px dotted #999;
        }
        .field-value {
            font-weight: normal;
            margin-left: 10px;
            min-width: 120px;
            text-align: left;
        }
        .photo-box, .thumb-box {
            width: 80px;
            height: 80px;
            border: 1px solid #000;
            border-radius: 8px;
            background: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            color: #666;
        }
        .thumb-box {
            height: 50px;
        }
        .separator-line {
            width: 100%;
            height: 1px;
            background: #4169E1;
            margin: 15px 0;
        }
        .footer-section {
            margin-top: 60px;
            display: flex;
            justify-content: space-between;
            gap: 40px;
        }
        .signature-area {
            text-align: center;
            flex: 1;
        }
        .signature-label {
            font-size: 10px;
            font-weight: bold;
            margin-bottom: 12px;
            text-align: left;
        }
        .signature-line {
            width: 180px;
            height: 1px;
            background: #000;
            margin: 25px auto 8px;
        }
        .signature-name {
            font-size: 10px;
            font-weight: bold;
            margin-bottom: 4px;
        }
        .signature-title {
            font-size: 8px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="certificate-container">
        <!-- Wavy Background Pattern -->
        <div class="wavy-pattern"></div>
        
        <!-- Header Section -->
        <div class="header">
            <div class="left-seal">
                <div class="barangay">BARANGAY</div>
                <div class="barangay">MAMATID</div>
                <div class="stars">★ ★</div>
                <div class="city">CITY OF</div>
                <div class="city">CABUYAO</div>
            </div>
            
            <div class="center-header">
                <div class="republic">REPUBLIC OF THE PHILIPPINES</div>
                <div class="province">PROVINCE OF LAGUNA</div>
                <div class="city">CABUYAO CITY</div>
                <div class="barangay">BARANGAY MAMATID</div>
                <div class="contact">0949-588-3131 0906-579-1460</div>
            </div>
            
            <div class="right-seal">
                <div class="heart">♥ SERBISYONG</div>
                <div class="wow">WOW!</div>
                <div class="tinig">TINIG NG BARANGAY</div>
            </div>
        </div>

        <!-- Certificate Title -->
        <div class="certificate-title">BARANGAY CLEARANCE</div>
        <div class="title-line"></div>

        <!-- Content -->
        <div class="content">
            <div class="top-blue-line"></div>
            <div class="intro-text">
                <span class="bold">TO WHOM IT MAY CONCERN:</span>
            </div>
            <div class="salutation-line"></div>
            <div class="intro-text">
                As per record kept in this office, the person whose name, right thumbmark and signature appear hereon has requested a <span class="bold">BARANGAY CLEARANCE</span> with the following information:
            </div>

            <div class="info-section">
                <div class="info-fields">
                    <div class="info-field">
                        <span class="field-label">CLEARANCE NO.:</span>
                        <div class="field-line"></div>
                        <span class="field-value">{{ $documentRequest->id ?? 'N/A' }}</span>
                    </div>
                    <div class="info-field">
                        <span class="field-label">DATE ISSUED:</span>
                        <div class="field-line"></div>
                        <span class="field-value">{{ \Carbon\Carbon::now()->format('M d, Y') }}</span>
                    </div>
                    <div class="info-field">
                        <span class="field-label">NAME:</span>
                        <div class="field-line"></div>
                        <span class="field-value">{{ $resident->first_name ?? '' }} {{ $resident->middle_name ?? '' }} {{ $resident->last_name ?? '' }}{{ $resident->name_suffix ? ' ' . $resident->name_suffix : '' }}</span>
                    </div>
                    <div class="info-field">
                        <span class="field-label">ADDRESS:</span>
                        <div class="field-line"></div>
                        <span class="field-value">{{ $resident->full_address ?? 'N/A' }}</span>
                    </div>
                    <div class="info-field">
                        <span class="field-label">PERIOD OF STAY:</span>
                        <div class="field-line"></div>
                        <span class="field-value">{{ $resident->years_in_barangay ?? 'N/A' }} years</span>
                    </div>
                    <div class="info-field">
                        <span class="field-label">CIVIL STATUS:</span>
                        <div class="field-line"></div>
                        <span class="field-value">{{ $resident->civil_status ?? 'N/A' }}</span>
                    </div>
                    <div class="info-field">
                        <span class="field-label">DATE OF BIRTH:</span>
                        <div class="field-line"></div>
                        <span class="field-value">{{ $resident->birth_date ? \Carbon\Carbon::parse($resident->birth_date)->format('M d, Y') : 'N/A' }}</span>
                    </div>
                    <div class="info-field">
                        <span class="field-label">BIRTH PLACE:</span>
                        <div class="field-line"></div>
                        <span class="field-value">{{ $resident->birth_place ?? 'N/A' }}</span>
                    </div>
                    <div class="info-field">
                        <span class="field-label">GENDER:</span>
                        <div class="field-line"></div>
                        <span class="field-value">{{ $resident->sex ?? 'N/A' }}</span>
                    </div>
                    <div class="info-field">
                        <span class="field-label">AGE:</span>
                        <div class="field-line"></div>
                        <span class="field-value">{{ $resident->age ?? 'N/A' }} years old</span>
                    </div>
                    <div class="info-field">
                        <span class="field-label">PURPOSE:</span>
                        <div class="field-line"></div>
                        <span class="field-value">{{ $documentRequest->fields['purpose'] ?? 'Official purposes' }}</span>
                    </div>
                    <div class="info-field">
                        <span class="field-label">REMARKS:</span>
                        <div class="field-line"></div>
                        <span class="field-value">No pending case</span>
                    </div>
                </div>
                
                <div class="photo-section">
                    <div class="photo-box">2x2 Photo</div>
                    <div class="thumb-box">Right Thumbmark</div>
                </div>
            </div>

            <div class="separator-line"></div>

            <div class="info-fields">
                <div class="info-field">
                    <span class="field-label">CTC NO.:</span>
                    <div class="field-line"></div>
                    <span class="field-value">N/A</span>
                </div>
                <div class="info-field">
                    <span class="field-label">PLACE ISSUED:</span>
                    <div class="field-line"></div>
                    <span class="field-value">Barangay Mamatid</span>
                </div>
                <div class="info-field">
                    <span class="field-label">DATE ISSUED:</span>
                    <div class="field-line"></div>
                    <span class="field-value">{{ \Carbon\Carbon::now()->format('M d, Y') }}</span>
                </div>
            </div>

            <div class="footer-section">
                <div class="signature-area">
                    <div class="signature-label">ISSUED TO:</div>
                    <div class="signature-line"></div>
                    <div class="signature-name">SIGNATURE</div>
                </div>
                <div class="signature-area">
                    <div class="signature-label">APPROVED FOR ISSUE:</div>
                    <div class="signature-line"></div>
                    <div class="signature-name">HON. ERNANI G. HIMPISAO</div>
                    <div class="signature-title">PUNONG BARANGAY</div>
                </div>
            </div>
        </div>
    </div>
</body>
</html> 